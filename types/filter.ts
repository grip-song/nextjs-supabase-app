import type { EventStatus, EventWithHost } from "./event";
import type { UserRole, UserWithEventStats } from "./user";

export type EventStatusFilter = "all" | EventStatus;

export type AdminEventFilter = {
  search: string;
  status: EventStatusFilter;
  dateFrom?: string;
  dateTo?: string;
};

/** 관리자 이벤트 목록 조회 파라미터. AdminEventFilter에 페이지네이션을 추가한 형태. */
export type AdminEventListParams = AdminEventFilter & {
  page: number;
  pageSize: number;
};

/** 관리자 이벤트 목록 조회 결과. events는 참여자 수를 포함한 EventWithHost 배열. */
export type AdminEventListResult = {
  events: (EventWithHost & { participant_count: number })[];
  totalCount: number;
};

export type AdminUserRoleFilter = "all" | UserRole;

export type AdminUserFilter = {
  search: string;
  role: AdminUserRoleFilter;
};

/** 관리자 사용자 목록 조회 파라미터. AdminUserFilter에 페이지네이션을 추가한 형태. */
export type AdminUserListParams = AdminUserFilter & {
  page: number;
  pageSize: number;
};

/** 관리자 사용자 목록 조회 결과. */
export type AdminUserListResult = {
  users: UserWithEventStats[];
  totalCount: number;
};
