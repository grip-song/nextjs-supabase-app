import type {
  Event,
  EventStatus,
  EventWithHost,
  EventWithParticipantCount,
  User,
  UserWithEventStats,
} from "@/types";
import { dummyUsers } from "./users";
import { dummyEvents } from "./events";
import { dummyParticipants } from "./participants";

/**
 * 현재 로그인한 것으로 간주하는 데모 사용자 ID.
 * 실제 인증 연동(Task 007+) 전까지 "내 이벤트" 등 화면에서 사용한다.
 */
export const CURRENT_USER_ID = dummyUsers[0].id;

/**
 * 모든 조회 함수는 동기 순수 함수로 작성한다.
 * 추후 실제 Supabase 연동 시 동일한 함수 시그니처를 유지한 채
 * 내부만 비동기 쿼리로 교체할 수 있도록 이름과 반환 타입을 맞춘다.
 */

export function getUserById(id: string): User | undefined {
  return dummyUsers.find((user) => user.id === id);
}

export function getEventById(id: string): Event | undefined {
  return dummyEvents.find((event) => event.id === id);
}

export function getEventByInviteCode(inviteCode: string): Event | undefined {
  return dummyEvents.find((event) => event.invite_code === inviteCode);
}

function getParticipantCount(eventId: string): number {
  return dummyParticipants.filter(
    (participant) => participant.event_id === eventId,
  ).length;
}

export function getEventsWithParticipantCount(): EventWithParticipantCount[] {
  return dummyEvents.map((event) => ({
    ...event,
    participant_count: getParticipantCount(event.id),
  }));
}

export function getEventsWithHost(): EventWithHost[] {
  return dummyEvents.flatMap((event) => {
    const host = getUserById(event.created_by);
    if (!host) return [];
    return [{ ...event, host }];
  });
}

export function getCurrentUser(): User {
  const user = getUserById(CURRENT_USER_ID);
  if (!user) {
    throw new Error(
      "CURRENT_USER_ID에 해당하는 더미 사용자를 찾을 수 없습니다.",
    );
  }
  return user;
}

/** 현재 사용자가 주최자(created_by)인 이벤트 목록 */
export function getMyHostedEvents(): EventWithParticipantCount[] {
  return getEventsWithParticipantCount().filter(
    (event) => event.created_by === CURRENT_USER_ID,
  );
}

/**
 * 관리자 대시보드용 요약 통계.
 * 전체 이벤트/사용자/참여자 수와 이벤트 상태별 집계를 반환한다.
 * 통계 분석 페이지 등 다른 화면에서도 재사용하므로 필드명을 변경하지 않는다.
 */
export function getAdminDashboardStats(): {
  totalEvents: number;
  totalUsers: number;
  totalParticipants: number;
  eventsByStatus: Record<EventStatus, number>;
} {
  const eventsByStatus = dummyEvents.reduce<Record<EventStatus, number>>(
    (acc, event) => {
      acc[event.status] += 1;
      return acc;
    },
    { upcoming: 0, ongoing: 0, ended: 0 },
  );

  return {
    totalEvents: dummyEvents.length,
    totalUsers: dummyUsers.length,
    totalParticipants: dummyParticipants.length,
    eventsByStatus,
  };
}

/**
 * 관리자 이벤트 관리 페이지용 목록.
 * getEventsWithHost()와 getEventsWithParticipantCount()의 결과를
 * event.id 기준으로 결합해 주최자 정보와 참여자 수를 함께 제공한다.
 */
export function getAdminEventsOverview(): (EventWithHost & {
  participant_count: number;
})[] {
  const participantCountById = new Map(
    getEventsWithParticipantCount().map((event) => [
      event.id,
      event.participant_count,
    ]),
  );

  return getEventsWithHost().map((event) => ({
    ...event,
    participant_count: participantCountById.get(event.id) ?? 0,
  }));
}

/**
 * 관리자 사용자 관리 페이지용 목록.
 * 각 사용자에 대해 주최자(role: 'host')로 참여한 이벤트 수와
 * 참여자(role: 'participant')로 참여한 이벤트 수를 함께 집계해 반환한다.
 */
export function getAdminUsersOverview(): UserWithEventStats[] {
  return dummyUsers.map((user) => {
    const hostedEventCount = dummyParticipants.filter(
      (participant) =>
        participant.role === "host" && participant.user_id === user.id,
    ).length;
    const participatingEventCount = dummyParticipants.filter(
      (participant) =>
        participant.role === "participant" && participant.user_id === user.id,
    ).length;

    return {
      ...user,
      hostedEventCount,
      participatingEventCount,
    };
  });
}

/**
 * 통계 분석 페이지의 "월별 신규 이벤트 추이" 차트용 데이터.
 * dummyEvents의 created_at을 'YYYY-MM' 단위로 그룹핑하고,
 * 데이터가 존재하는 가장 최근 달을 기준으로 최근 6개월을 빠짐없이 채워 반환한다
 * (해당 월에 생성된 이벤트가 없으면 count: 0).
 * 반환 배열은 월 오름차순으로 정렬된다.
 */
export function getEventsCreatedByMonth(): { month: string; count: number }[] {
  const MONTHS_TO_SHOW = 6;

  const countByMonth = new Map<string, number>();
  for (const event of dummyEvents) {
    // ISO 문자열의 'YYYY-MM' 부분만 사용해 타임존에 따른 날짜 오차를 방지한다.
    const month = event.created_at.slice(0, 7);
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
