import { createClient } from "@/lib/supabase/server";
import type { UsersRow } from "@/types/database";
import type { User, UserRole } from "@/types";

/**
 * DB Row(UsersRow) -> 프론트 도메인 타입(User) 변환. role은 문자열이므로 안전하게 좁힌다.
 * lib/participants/queries.ts에서도 재사용하므로 export한다.
 */
export function toUser(row: UsersRow): User {
  const role: UserRole = row.role === "admin" ? "admin" : "user";

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * id(=auth.users.id=public.users.id)로 사용자 단건 조회.
 * 이벤트 주최자 정보 표시(상세/초대 미리보기/프로필)에서 공용으로 사용한다.
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ? toUser(data) : null;
}
