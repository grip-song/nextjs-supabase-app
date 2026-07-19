import { UsersTable } from "@/components/admin/users-table";
import { getAdminUsersOverview } from "@/lib/dummy-data/helpers";

export default function AdminUsersPage() {
  const users = getAdminUsersOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 사용자를 검색·필터링하고 필요 시 삭제할 수 있어요.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
