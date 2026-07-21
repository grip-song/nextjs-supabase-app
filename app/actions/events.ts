"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  eventTextFieldsSchema,
  type EventFormValues,
} from "@/lib/schemas/event";
import {
  UNIQUE_VIOLATION_CODE,
  withInviteCodeRetry,
} from "@/lib/events/invite-code";
import { localInputToUtcIso } from "@/lib/events/datetime";

/** 이벤트 생성/수정 폼(useActionState)이 공유하는 상태 타입 */
export type EventActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof EventFormValues, string[]>>;
};

const COVER_BUCKET = "event-covers";

function getCoverFile(formData: FormData): File | null {
  const file = formData.get("cover_image");
  return file instanceof File && file.size > 0 ? file : null;
}

/**
 * getPublicUrl()이 만든 공개 URL에서 버킷 내부 경로만 추출한다.
 * 기존 커버 이미지를 정리(삭제)할 때 이 경로가 필요하다.
 */
function extractStoragePath(publicUrl: string): string | null {
  const marker = `/object/public/${COVER_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}

/**
 * 로그인한 사용자의 새 이벤트를 생성한다.
 * eventId를 미리 생성해 Storage 업로드 경로({user_id}/{event_id}/{파일명})에 사용하고,
 * 초대 코드는 unique_violation(23505) 발생 시에만 최대 5회 재시도한다.
 */
export async function createEvent(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  const parsed = eventTextFieldsSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    event_date: formData.get("event_date"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "입력 내용을 확인해주세요",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const eventId = randomUUID();
  const coverFile = getCoverFile(formData);
  let coverImageUrl: string | null = null;

  if (coverFile) {
    const path = `${user.sub}/${eventId}/${coverFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(path, coverFile);

    if (uploadError) {
      return { success: false, message: "커버 이미지 업로드에 실패했어요" };
    }

    coverImageUrl = supabase.storage.from(COVER_BUCKET).getPublicUrl(path)
      .data.publicUrl;
  }

  const { title, location, event_date, description } = parsed.data;

  const { error } = await withInviteCodeRetry(async (inviteCode) => {
    return supabase.from("events").insert({
      id: eventId,
      title,
      location,
      event_date: localInputToUtcIso(event_date),
      description: description || null,
      cover_image_url: coverImageUrl,
      invite_code: inviteCode,
      created_by: user.sub,
    });
  });

  if (error) {
    // insert 실패 시 방금 업로드한 Storage 오브젝트를 best-effort로 정리한다
    // (삭제 실패해도 사용자에게는 원래 에러 메시지를 보여주는 것이 우선이므로 결과를 무시한다).
    if (coverFile) {
      await supabase.storage
        .from(COVER_BUCKET)
        .remove([`${user.sub}/${eventId}/${coverFile.name}`]);
    }

    const message =
      error.code === UNIQUE_VIOLATION_CODE
        ? "초대 코드 생성에 실패했어요. 다시 시도해주세요"
        : "이벤트 생성에 실패했어요";
    return { success: false, message };
  }

  redirect(`/events/${eventId}`);
}

/**
 * 이벤트 주최자가 자신의 이벤트를 수정한다.
 * RLS(events_update_own)가 최종 방어선이지만, 사전에 created_by를 확인해
 * 권한 없는 사용자에게 더 친절한 에러 메시지를 보여준다.
 */
export async function updateEvent(
  eventId: string,
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  const { data: existing } = await supabase
    .from("events")
    .select("created_by, cover_image_url")
    .eq("id", eventId)
    .single();

  if (!existing || existing.created_by !== user.sub) {
    return { success: false, message: "수정 권한이 없어요" };
  }

  const parsed = eventTextFieldsSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    event_date: formData.get("event_date"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "입력 내용을 확인해주세요",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let coverImageUrl = existing.cover_image_url;
  const coverFile = getCoverFile(formData);

  if (coverFile) {
    // 같은 파일명을 다시 올려도 경로가 항상 새로 생기도록 접두사를 붙인다.
    // upsert(덮어쓰기)는 storage.objects에 SELECT 정책이 없어 기존 오브젝트
    // 존재 여부를 확인하지 못해 매번 400을 반환하므로 사용하지 않는다.
    const path = `${user.sub}/${eventId}/${randomUUID()}-${coverFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(path, coverFile);

    if (uploadError) {
      return { success: false, message: "커버 이미지 업로드에 실패했어요" };
    }

    coverImageUrl = supabase.storage.from(COVER_BUCKET).getPublicUrl(path)
      .data.publicUrl;

    // 이전 커버 이미지는 best-effort로 정리한다(실패해도 새 업로드는 이미 반영됨).
    const previousPath = existing.cover_image_url
      ? extractStoragePath(existing.cover_image_url)
      : null;
    if (previousPath) {
      await supabase.storage.from(COVER_BUCKET).remove([previousPath]);
    }
  }

  const { title, location, event_date, description } = parsed.data;

  const { error } = await supabase
    .from("events")
    .update({
      title,
      location,
      event_date: localInputToUtcIso(event_date),
      description: description || null,
      cover_image_url: coverImageUrl,
    })
    .eq("id", eventId);

  if (error) {
    return { success: false, message: "이벤트 수정에 실패했어요" };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

/**
 * 이벤트 주최자가 자신의 이벤트를 삭제한다.
 * 폼 없이 버튼 클릭으로 바로 호출되므로 useActionState 대신 클라이언트 컴포넌트에서
 * 직접 호출하고, 반환된 결과를 확인해 실패 시에만 sonner toast로 안내한다
 * (성공 시에는 redirect()가 네비게이션까지 처리한다).
 */
export async function deleteEvent(eventId: string): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  const { data: existing } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (!existing || existing.created_by !== user.sub) {
    return { success: false, message: "삭제 권한이 없어요" };
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, message: "이벤트 삭제에 실패했어요" };
  }

  redirect("/events");
}
