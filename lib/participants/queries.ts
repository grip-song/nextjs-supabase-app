import { createClient } from "@/lib/supabase/server";
import { toEvent } from "@/lib/events/queries";
import { toUser } from "@/lib/users/queries";
import type { EventParticipantsRow } from "@/types/database";
import type {
  EventWithParticipantCount,
  ParticipantRole,
  ParticipantWithUser,
  User,
} from "@/types";

/** DB Row(EventParticipantsRow) + User -> 프론트 도메인 타입(ParticipantWithUser) 변환. */
function toParticipant(
  row: EventParticipantsRow,
  user: User,
): ParticipantWithUser {
  const role: ParticipantRole = row.role === "host" ? "host" : "participant";

  return {
    id: row.id,
    event_id: row.event_id,
    user_id: row.user_id,
    role,
    joined_at: row.joined_at,
    user,
  };
}

/**
 * 이벤트 참여자 목록(사용자 정보 포함) 조회.
 * PostgREST 임베디드 조인(select("*, user:users(*)"))은 손으로 작성한 types/database.ts의
 * Relationships가 비어 있어 타입 추론이 불안정하므로, event_participants를 조회한 뒤
 * user_id로 users를 별도 조회해 조합하는 방식을 사용한다(타입 안전성 우선).
 */
export async function getParticipantsWithUser(
  eventId: string,
): Promise<ParticipantWithUser[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .order("joined_at");

  if (!rows || rows.length === 0) {
    return [];
  }

  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .in("id", userIds);

  const userById = new Map(
    (users ?? []).map((user) => [user.id, toUser(user)]),
  );

  return rows.flatMap((row) => {
    const user = userById.get(row.user_id);
    return user ? [toParticipant(row, user)] : [];
  });
}

/** 이벤트 참여자 수를 경량으로 조회한다(count only, head:true로 행 데이터는 받지 않음). */
export async function getParticipantCount(eventId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  return count ?? 0;
}

/** 특정 사용자가 이벤트에 이미 참여 중인지 여부(role 무관, host/participant 모두 true). */
export async function isUserParticipating(
  eventId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}

/** 사용자가 참여자(role: 'participant')로 참여 중인 이벤트 목록. */
export async function getMyParticipatingEvents(
  userId: string,
): Promise<EventWithParticipantCount[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", userId)
    .eq("role", "participant");

  const eventIds = (rows ?? []).map((row) => row.event_id);
  if (eventIds.length === 0) {
    return [];
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .order("event_date", { ascending: false });

  const eventRows = events ?? [];
  const counts = await Promise.all(
    eventRows.map((event) => getParticipantCount(event.id)),
  );

  return eventRows.map((event, index) => ({
    ...toEvent(event),
    participant_count: counts[index],
  }));
}
