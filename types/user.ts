export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

/** 관리자 사용자 관리 페이지용: 사용자 정보 + 주최/참여 이벤트 수 통계 */
export type UserWithEventStats = User & {
  hostedEventCount: number;
  participatingEventCount: number;
};
