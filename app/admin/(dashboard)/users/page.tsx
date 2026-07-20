import { UsersTable } from "@/components/admin/users-table";
import { getAdminUsersOverview } from "@/lib/admin/queries";
import type { AdminUserListParams, AdminUserRoleFilter } from "@/types";

const PAGE_SIZE = 20;

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}

/**
 * 관리자 사용자 관리 페이지.
 * searchParams(Promise, Next.js 15)를 파싱해 서버 사이드 검색/필터/페이지네이션 파라미터를 만들고
 * getAdminUsersOverview로 실제 조회한 결과를 UsersTable(프레젠테이셔널 컴포넌트)에 전달한다.
 * 사용자 삭제는 이번 MVP 범위에서 제외했으므로(users-table.tsx 상단 주석 참고) 삭제 UI가 없다.
 */
export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const sp = await searchParams;

  const params: AdminUserListParams = {
    search: sp.search ?? "",
    role: (sp.role as AdminUserRoleFilter | undefined) ?? "all",
    page: Number(sp.page ?? 0) || 0,
    pageSize: PAGE_SIZE,
  };

  const { users, totalCount } = await getAdminUsersOverview(params);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 사용자를 검색·필터링할 수 있어요.
        </p>
      </div>

      <UsersTable users={users} totalCount={totalCount} filter={params} />
    </div>
  );
}
