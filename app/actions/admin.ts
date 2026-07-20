"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EventActionState } from "@/app/actions/events";

/**
 * public.users.role을 직접 조회해 관리자 여부를 판정한다.
 * user_metadata는 로그인한 본인이 조작 가능하므로 신뢰할 수 없어 사용하지 않는다
 * (app/admin/(dashboard)/layout.tsx와 동일한 신뢰 소스/패턴).
 */
async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

/**
 * 관리자가 임의의 이벤트(자신이 만들지 않은 이벤트 포함)를 삭제한다.
 * app/actions/events.ts의 deleteEvent(생성자 본인 전용, redirect 포함)와는 별개의 액션이다.
 * requireAdmin으로 사전 체크하고, RLS의 events_admin_all 정책을 최종 방어선으로 사용한다.
 * 관리자는 삭제 후에도 목록 페이지(/admin/events)에 머물러야 하므로 redirect 대신
 * revalidatePath로 캐시를 갱신하고 결과 객체를 반환한다.
 */
export async function deleteEventAsAdmin(
  eventId: string,
): Promise<EventActionState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { success: false, message: "로그인이 필요해요" };
  }

  if (!(await requireAdmin(supabase, user.sub))) {
    return { success: false, message: "관리자 권한이 없어요" };
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, message: "이벤트 삭제에 실패했어요" };
  }

  revalidatePath("/admin/events");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
