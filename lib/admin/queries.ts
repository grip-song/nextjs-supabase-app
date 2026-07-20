import { createClient } from "@/lib/supabase/server";
import { toEvent } from "@/lib/events/queries";
import { toUser } from "@/lib/users/queries";
import { getEventStatus, ONGOING_WINDOW_MS } from "@/lib/events/status";
import type {
  AdminEventListParams,
  AdminEventListResult,
  AdminUserListParams,
  AdminUserListResult,
  EventStatus,
  EventWithHost,
} from "@/types";

/**
 * 관리자 대시보드용 요약 통계.
 * 전체 이벤트/사용자/참여자 수와 이벤트 상태별 집계를 반환한다.
 * count는 head:true로 행 데이터 없이 경량 조회하고,
 * eventsByStatus는 status 컬럼(DB)을 신뢰하지 않는 기존 원칙(lib/events/status.ts)에 따라
 * id/event_date 두 컬럼만 조회한 뒤 getEventStatus()로 매번 계산해 집계한다.
 */
export async function getAdminDashboardStats(): Promise<{
  totalEvents: number;
  totalUsers: number;
  totalParticipants: number;
  eventsByStatus: Record<EventStatus, number>;
}> {
  const supabase = await createClient();

  const [
    { count: totalEvents },
    { count: totalUsers },
    { count: totalParticipants },
    { data: rows },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true }),
    supabase.from("events").select("id, event_date"),
  ]);

  const eventsByStatus = (rows ?? []).reduce<Record<EventStatus, number>>(
    (acc, row) => {
      acc[getEventStatus(row.event_date)] += 1;
      return acc;
    },
    { upcoming: 0, ongoing: 0, ended: 0 },
  );

  return {
    totalEvents: totalEvents ?? 0,
    totalUsers: totalUsers ?? 0,
    totalParticipants: totalParticipants ?? 0,
    eventsByStatus,
  };
}

/**
 * 관리자 대시보드의 "최근 이벤트" 섹션용 목록.
 * 생성일(created_at) 내림차순으로 limit개를 조회하고, 주최자(host) 정보를 별도 조회 후
 * Map으로 결합한다(PostgREST 임베디드 조인 대신 별도조회+Map 패턴, lib/participants/queries.ts와 동일).
 * host를 찾을 수 없는 행(정합성이 깨진 예외 상황)은 결과에서 제외한다.
 */
export async function getRecentEventsWithHost(
  limit = 5,
): Promise<EventWithHost[]> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  const hostIds = [...new Set((rows ?? []).map((row) => row.created_by))];
  if (hostIds.length === 0) {
    return [];
  }

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .in("id", hostIds);

  const userById = new Map(
    (users ?? []).map((user) => [user.id, toUser(user)]),
  );

  return (rows ?? []).flatMap((row) => {
    const host = userById.get(row.created_by);
    return host ? [{ ...toEvent(row), host }] : [];
  });
}

/**
 * 관리자 이벤트 관리 페이지용 목록 조회.
 * 검색(title/location ilike), 상태 필터, 페이지네이션(.range()+count)을 서버 사이드에서 처리한다.
 *
 * status 필터는 DB의 status 컬럼을 신뢰하지 않는 기존 원칙(lib/events/status.ts)에 따라
 * event_date와 현재 시각을 비교하는 SQL 조건으로 변환한다. ONGOING_WINDOW_MS(24시간)를
 * lib/events/status.ts에서 그대로 import해 getEventStatus()와 판정 경계가 항상 일치하도록 한다.
 *
 * 참여자 수는 조회된 이벤트들의 id 목록으로 event_participants를 한 번에 in() 조회해 Map으로
 * 집계한다(이벤트마다 개별 count 쿼리를 날리는 N+1 대신 배치 조회).
 */
export async function getAdminEventsOverview(
  params: AdminEventListParams,
): Promise<AdminEventListResult> {
  const supabase = await createClient();

  let query = supabase.from("events").select("*", { count: "exact" });

  const keyword = params.search.trim();
  if (keyword.length > 0) {
    query = query.or(`title.ilike.%${keyword}%,location.ilike.%${keyword}%`);
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const ongoingStartIso = new Date(
    now.getTime() - ONGOING_WINDOW_MS,
  ).toISOString();

  if (params.status === "upcoming") {
    query = query.gt("event_date", nowIso);
  } else if (params.status === "ongoing") {
    query = query.lte("event_date", nowIso).gt("event_date", ongoingStartIso);
  } else if (params.status === "ended") {
    query = query.lte("event_date", ongoingStartIso);
  }

  const from = params.page * params.pageSize;
  const { data: rows, count } = await query
    .order("event_date", { ascending: false })
    .range(from, from + params.pageSize - 1);

  if (!rows || rows.length === 0) {
    return { events: [], totalCount: count ?? 0 };
  }

  const hostIds = [...new Set(rows.map((row) => row.created_by))];
  const eventIds = rows.map((row) => row.id);

  const [{ data: users }, { data: participants }] = await Promise.all([
    supabase.from("users").select("*").in("id", hostIds),
    supabase
      .from("event_participants")
      .select("event_id")
      .in("event_id", eventIds),
  ]);

  const userById = new Map(
    (users ?? []).map((user) => [user.id, toUser(user)]),
  );

  const countByEvent = new Map<string, number>();
  for (const participant of participants ?? []) {
    countByEvent.set(
      participant.event_id,
      (countByEvent.get(participant.event_id) ?? 0) + 1,
    );
  }

  const events = rows.flatMap((row) => {
    const host = userById.get(row.created_by);
    if (!host) return [];
    return [
      {
        ...toEvent(row),
        host,
        participant_count: countByEvent.get(row.id) ?? 0,
      },
    ];
  });

  return { events, totalCount: count ?? 0 };
}

/**
 * 관리자 사용자 관리 페이지용 목록 조회.
 * 검색(name/email ilike), role 필터, 페이지네이션(.range()+count)을 서버 사이드에서 처리한다.
 * role은 event_date 기반 status와 달리 시간에 따라 변하지 않는 실제 DB 컬럼이므로 신뢰해서
 * .eq()로 직접 필터링한다(별도 계산 불필요).
 *
 * hostedEventCount/participatingEventCount는 조회된 페이지의 user_id 목록으로
 * event_participants를 한 번에 in() 조회한 뒤 role별로 Map에 집계한다(N+1 방지).
 */
export async function getAdminUsersOverview(
  params: AdminUserListParams,
): Promise<AdminUserListResult> {
  const supabase = await createClient();

  let query = supabase.from("users").select("*", { count: "exact" });

  const keyword = params.search.trim();
  if (keyword.length > 0) {
    query = query.or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`);
  }
  if (params.role !== "all") {
    query = query.eq("role", params.role);
  }

  const from = params.page * params.pageSize;
  const { data: rows, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + params.pageSize - 1);

  if (!rows || rows.length === 0) {
    return { users: [], totalCount: count ?? 0 };
  }

  const userIds = rows.map((row) => row.id);
  const { data: participations } = await supabase
    .from("event_participants")
    .select("user_id, role")
    .in("user_id", userIds);

  const hostedById = new Map<string, number>();
  const participatingById = new Map<string, number>();
  for (const participation of participations ?? []) {
    const target =
      participation.role === "host" ? hostedById : participatingById;
    target.set(
      participation.user_id,
      (target.get(participation.user_id) ?? 0) + 1,
    );
  }

  const users = rows.map((row) => ({
    ...toUser(row),
    hostedEventCount: hostedById.get(row.id) ?? 0,
    participatingEventCount: participatingById.get(row.id) ?? 0,
  }));

  return { users, totalCount: count ?? 0 };
}

/**
 * 통계 분석 페이지의 "월별 신규 이벤트 추이" 차트용 데이터.
 * events의 created_at을 'YYYY-MM' 단위로 그룹핑하고,
 * 데이터가 존재하는 가장 최근 달을 기준으로 최근 6개월을 빠짐없이 채워 반환한다
 * (해당 월에 생성된 이벤트가 없으면 count: 0). 반환 배열은 월 오름차순으로 정렬된다.
 * 그룹핑/6개월 채우기 알고리즘은 lib/dummy-data/helpers.ts의 기존 구현을 그대로 옮긴 것이며,
 * 데이터 소스만 dummyEvents 배열에서 실제 events 테이블 조회로 교체했다.
 */
export async function getEventsCreatedByMonth(): Promise<
  { month: string; count: number }[]
> {
  const MONTHS_TO_SHOW = 6;

  const supabase = await createClient();
  const { data: rows } = await supabase.from("events").select("created_at");

  const countByMonth = new Map<string, number>();
  for (const row of rows ?? []) {
    // ISO 문자열의 'YYYY-MM' 부분만 사용해 타임존에 따른 날짜 오차를 방지한다.
    const month = row.created_at.slice(0, 7);
    countByMonth.set(month, (countByMonth.get(month) ?? 0) + 1);
  }

  const monthsWithData = [...countByMonth.keys()].sort();
  const latestMonth = monthsWithData[monthsWithData.length - 1];

  if (!latestMonth) {
    return [];
  }

  const [latestYear, latestMonthIndex] = latestMonth.split("-").map(Number);

  return Array.from({ length: MONTHS_TO_SHOW }, (_, index) => {
    const offset = MONTHS_TO_SHOW - 1 - index;
    // UTC 기준으로 월을 계산해 연도 경계(예: 2월 -> 이전 해 9월)를 안전하게 처리한다.
    const date = new Date(
      Date.UTC(latestYear, latestMonthIndex - 1 - offset, 1),
    );
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    return {
      month,
      count: countByMonth.get(month) ?? 0,
    };
  });
}
