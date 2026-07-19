"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  AdminUserFilter,
  AdminUserRoleFilter,
  UserWithEventStats,
} from "@/types";

interface UsersTableProps {
  /** 서버에서 조회한 초기 사용자 목록 (관리자 화면 전용 더미 조합 데이터) */
  initialUsers: UserWithEventStats[];
}

const ROLE_OPTIONS: { value: AdminUserRoleFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반" },
  { value: "admin", label: "관리자" },
];

/**
 * 관리자용 사용자 관리 테이블.
 * 검색어(이름/이메일)와 역할로 클라이언트 사이드 필터링하며,
 * 행 삭제는 로컬 state에서만 제거하는 더미 동작(실제 API 없음)이다.
 */
export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<UserWithEventStats[]>(initialUsers);
  const [filter, setFilter] = useState<AdminUserFilter>({
    search: "",
    role: "all",
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const keyword = filter.search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        keyword.length === 0 ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);
      const matchesRole = filter.role === "all" || user.role === filter.role;

      return matchesKeyword && matchesRole;
    });
  }, [users, filter]);

  function handleDeleteConfirm() {
    if (!deleteTargetId) return;

    setUsers((prev) => prev.filter((user) => user.id !== deleteTargetId));
    setDeleteTargetId(null);
    toast.success("사용자가 삭제되었습니다");
  }

  return (
    <div className="space-y-4">
      {/* 검색/역할 필터 영역 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="이름 또는 이메일로 검색"
            className="pl-9"
          />
        </div>

        <Select
          value={filter.role}
          onValueChange={(value: AdminUserRoleFilter) =>
            setFilter((prev) => ({ ...prev, role: value }))
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
      </div>

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
              <TableHead className="text-right">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
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
                  <TableCell className="text-right">
                    <Dialog
                      open={deleteTargetId === user.id}
                      onOpenChange={(open) =>
                        setDeleteTargetId(open ? user.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="사용자 삭제"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>사용자를 삭제할까요?</DialogTitle>
                          <DialogDescription>
                            삭제하면 되돌릴 수 없어요
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteTargetId(null)}
                          >
                            취소
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                          >
                            삭제
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  조건에 맞는 사용자가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
