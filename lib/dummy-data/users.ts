import type { User } from "@/types";

/**
 * 더미 사용자 목록
 * Phase 2(더미 데이터 기반 UI/UX 완성)에서 사용하는 고정 사용자 데이터.
 * id는 실제 DB 연동(Task 007+) 전까지 페이지 데모 재현을 위해 고정 문자열을 사용한다.
 */
export const dummyUsers: User[] = [
  {
    id: "user-1",
    email: "minjun.kim@example.com",
    name: "김민준",
    avatar_url: null,
    role: "user",
    created_at: "2026-01-05T09:00:00.000Z",
    updated_at: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "user-2",
    email: "seoyeon.lee@example.com",
    name: "이서연",
    avatar_url: null,
    role: "user",
    created_at: "2026-01-12T10:30:00.000Z",
    updated_at: "2026-01-12T10:30:00.000Z",
  },
  {
    id: "user-3",
    email: "doyoon.park@example.com",
    name: "박도윤",
    avatar_url: null,
    role: "admin",
    created_at: "2026-01-15T08:15:00.000Z",
    updated_at: "2026-01-15T08:15:00.000Z",
  },
  {
    id: "user-4",
    email: "jiwoo.choi@example.com",
    name: "최지우",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-02T11:45:00.000Z",
    updated_at: "2026-02-02T11:45:00.000Z",
  },
  {
    id: "user-5",
    email: "haeun.jung@example.com",
    name: "정하은",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-10T14:20:00.000Z",
    updated_at: "2026-02-10T14:20:00.000Z",
  },
  {
    id: "user-6",
    email: "siwoo.kang@example.com",
    name: "강시우",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-18T13:00:00.000Z",
    updated_at: "2026-02-18T13:00:00.000Z",
  },
  {
    id: "user-7",
    email: "soyul.yoon@example.com",
    name: "윤소율",
    avatar_url: null,
    role: "user",
    created_at: "2026-03-01T09:30:00.000Z",
    updated_at: "2026-03-01T09:30:00.000Z",
  },
  {
    id: "user-8",
    email: "junseo.lim@example.com",
    name: "임준서",
    avatar_url: null,
    role: "user",
    created_at: "2026-03-09T16:10:00.000Z",
    updated_at: "2026-03-09T16:10:00.000Z",
  },
];
