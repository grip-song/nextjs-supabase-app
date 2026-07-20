import type { EventStatus } from "@/types";

/**
 * "진행 중(ongoing)" 판정 윈도우(24시간, ms).
 * lib/admin/queries.ts의 관리자 이벤트 상태 필터(SQL 날짜 조건)에서도 이 값을 그대로 import해
 * 사용한다 — 두 곳의 값이 어긋나지 않도록 반드시 이 상수를 단일 소스로 유지할 것.
 */
export const ONGOING_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * event_date를 기준으로 이벤트 상태를 계산하는 순수 함수.
 * DB의 status 컬럼은 별도 배치/크론 없이는 최신 상태를 보장할 수 없으므로,
 * 화면 렌더링 시점마다 이 함수로 상태를 계산해 사용한다.
 * "진행 중(ongoing)" 판정 기준은 event_date로부터 24시간 이내로 확정되었다(사용자 확인).
 */
export function getEventStatus(
  eventDateIso: string,
  now: Date = new Date(),
): EventStatus {
  const eventDate = new Date(eventDateIso);
  const ongoingEndsAt = new Date(eventDate.getTime() + ONGOING_WINDOW_MS);

  if (now < eventDate) return "upcoming";
  if (now < ongoingEndsAt) return "ongoing";
  return "ended";
}
