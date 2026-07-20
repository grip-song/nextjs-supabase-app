"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminUserListParams,
  AdminUserRoleFilter,
  UserWithEventStats,
} from "@/types";

interface UsersTableProps {
  /** 서버(getAdminUsersOverview)에서 이미 검색·필터·페이지네이션이 적용된 현재 페이지 목록 */
  users: UserWithEventStats[];
  /** 필터 조건 전체에 대한 총 건수(페이지네이션 계산용) */
  totalCount: number;
  /** 현재 적용된 검색/필터/페이지 파라미터(URL 쿼리와 동기화된 상태) */
  filter: AdminUserListParams;
}

const ROLE_OPTIONS: { value: AdminUserRoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반" },
  { value: "admin", label: "관리자" },
];

/**
 * 관리자용 사용자 관리 테이블.
 * 검색어(이름/이메일)·역할·페이지는 모두 URL 쿼리 파라미터로 관리하며, 값이 바뀔 때마다
 * router.push로 URL을 갱신해 상위 Server Component(app/admin/(dashboard)/users/page.tsx)가
 * getAdminUsersOverview를 다시 호출하도록 한다(클라이언트 사이드 필터링 없음).
 *
 * 사용자 삭제는 이번 MVP 범위에서 제외했다: public.users에는 admin delete RLS 정책이 없고,
 * public.users.id가 auth.users(id) on delete cascade로 연결되어 있어 "진짜" 계정 삭제는
 * supabase.auth.admin.deleteUser()(서비스 롤 키 필요)로만 가능하다. 이 프로젝트는 서비스
 * 롤 키를 도입하지 않기로 했으므로(레포 전체에 사용처 없음, CLAUDE.md 필수 환경변수에도 없음)
 * 삭제 버튼/Dialog 자체를 제공하지 않는다. 추후 서비스 롤 키를 도입하게 되면
 * app/actions/admin.ts에 auth.admin.deleteUser() 기반 액션을 추가해 확장할 수 있다.
 */
export function UsersTable({ users, totalCount, filter }: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(filter.search);

  const totalPages = Math.max(1, Math.ceil(totalCount / filter.pageSize));
  const currentPage = filter.page + 1;
  const hasPrevPage = filter.page > 0;
  const hasNextPage = currentPage < totalPages;

  function updateQuery(
    patch: Partial<{
      search: string;
      role: AdminUserRoleFilter;
      page: number;
    }>,
  ) {
    const next = {
      search: patch.search ?? filter.search,
      role: patch.role ?? filter.role,
      // 검색어/역할이 바뀌면 첫 페이지로 리셋하고, 페이지 이동일 때만 명시적으로 page를 넘긴다.
      page: patch.page ?? 0,
    };

    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.role !== "all") params.set("role", next.role);
    if (next.page > 0) params.set("page", String(next.page));

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput });
  }

  return (
    <div className="space-y-4">
      {/* 검색/역할 필터 영역 */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="pl-9"
          />
        </div>

        <Select
          value={filter.role}
          onValueChange={(value: AdminUserRoleFilter) =>
            updateQuery({ role: value })
          }
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="역할" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" variant="secondary" className="sm:w-auto">
          검색
        </Button>
      </form>

      {/* 사용자 목록 테이블 */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead className="text-right">주최 수</TableHead>
              <TableHead className="text-right">참여 수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "outline" : "secondary"}
                    >
                      {user.role === "admin" ? "관리자" : "일반"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.hostedEventCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.participatingEventCount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  조건에 맞는 사용자가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {totalCount}건 · {currentPage} / {totalPages} 페이지
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => updateQuery({ page: filter.page - 1 })}
          >
            <ChevronLeft className="size-4" />
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => updateQuery({ page: filter.page + 1 })}
          >
            다음
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
