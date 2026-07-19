import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/events/status";
import { getParticipantCount } from "@/lib/participants/queries";
import type { EventsRow } from "@/types/database";
import type { Event, EventWithParticipantCount } from "@/types";

/**
 * DB Row(EventsRow) -> 프론트 도메인 타입(Event) 변환.
 * status는 DB 컬럼 값을 그대로 신뢰하지 않고 event_date 기준으로 매번 계산한다
 * (배치/크론 없이도 항상 최신 상태를 보장하기 위함, 사용자 확정 기준: 24시간 이내 = ongoing).
 * lib/participants/queries.ts에서도 재사용하므로 export한다(도메인간 순환 참조처럼 보이지만
 * 함수 본문 내부에서만 서로를 호출하므로 ESM 모듈 초기화 시점에는 문제되지 않는다).
 */
export function toEvent(row: EventsRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    event_date: row.event_date,
    cover_image_url: row.cover_image_url,
    invite_code: row.invite_code,
    status: getEventStatus(row.event_date),
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** id로 이벤트 단건 조회. 존재하지 않으면 null(호출부에서 notFound() 트리거용). */
export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ? toEvent(data) : null;
}

/** invite_code로 이벤트 단건 조회(초대 링크 미리보기용). */
export async function getEventByInviteCode(
  inviteCode: string,
): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  return data ? toEvent(data) : null;
}

/** 주최자(created_by) 기준 내가 만든 이벤트 목록. participant_count는 이벤트별로 병렬 조회한다. */
export async function getMyHostedEvents(
  userId: string,
): Promise<EventWithParticipantCount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .order("event_date", { ascending: false });

  const rows = data ?? [];
  const counts = await Promise.all(
    rows.map((row) => getParticipantCount(row.id)),
  );

  return rows.map((row, index) => ({
    ...toEvent(row),
    participant_count: counts[index],
  }));
}
