import type { EventStatus } from "./event";
import type { UserRole } from "./user";

export type EventStatusFilter = "all" | EventStatus;

export type AdminEventFilter = {
  search: string;
  status: EventStatusFilter;
  dateFrom?: string;
  dateTo?: string;
};

export type AdminUserRoleFilter = "all" | UserRole;

export type AdminUserFilter = {
  search: string;
  role: AdminUserRoleFilter;
};
