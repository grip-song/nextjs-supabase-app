"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UNIQUE_VIOLATION_CODE } from "@/lib/events/invite-code";
import { isUserParticipating } from "@/lib/participants/queries";
import type { EventActionState } from "@/app/actions/events";

/**
 * 로그인한 사용자가 초대 링크를 통해 이벤트에 참여한다.
 * role은 'participant'로 고정한다(participants_insert_own RLS가 role='participant'만
 * 허용하므로 다른 값은 어차피 거부되지만, 의도치 않은 삽입 시도를 애플리케이션
 * 레벨에서도 막기 위해 하드코딩한다).
 */
export async function joinEvent(eventId: string): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  // insert 전 사전 체크로 대부분의 중복 참여를 걸러내고 사용자 친화적 메시지를 보여준다.
  const alreadyJoined = await isUserParticipating(eventId, user.sub);
  if (alreadyJoined) {
    return { success: false, message: "이미 참여한 이벤트예요" };
  }

  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: user.sub,
    role: "participant",
  });

  if (error) {
    // 동시에 같은 초대 링크로 두 번 클릭하는 등 사전 체크와 insert 사이의 레이스 컨디션에
    // 대비해, UNIQUE(event_id, user_id) 위반도 동일한 안내 메시지로 매핑한다(이중 방어).
    const message =
      error.code === UNIQUE_VIOLATION_CODE
        ? "이미 참여한 이벤트예요"
        : "참여에 실패했어요";
    return { success: false, message };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

/**
 * 참여자(role: 'participant')가 자신의 이벤트 참여를 취소한다.
 * deleteEvent(이벤트 자체 삭제)와 달리 redirect하지 않는다: 이벤트는 삭제되는 게 아니라
 * 여전히 존재하고 공개 조회도 가능하므로, 상세 페이지에 머무른 채 revalidatePath로
 * 참여자 목록/버튼 상태만 갱신되면 충분하다.
 * RLS(participants_delete_own)가 role='participant' 조건의 최종 방어선이지만,
 * host가 시도했을 때 더 친절한 에러 메시지를 주기 위해 사전에 role을 확인한다.
 */
export async function leaveEvent(eventId: string): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  const { data: existing } = await supabase
    .from("event_participants")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.sub)
    .maybeSingle();

  if (!existing) {
    return { success: false, message: "참여 중인 이벤트가 아니에요" };
  }

  if (existing.role === "host") {
    return { success: false, message: "주최자는 참여를 취소할 수 없어요" };
  }

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.sub);

  if (error) {
    return { success: false, message: "참여 취소에 실패했어요" };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
