"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEventAsAdmin } from "@/app/actions/admin";
import { formatEventDateTime } from "@/lib/events/datetime";
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
import { EventStatusBadge } from "@/components/events/event-status-badge";
import type {
  AdminEventListParams,
  EventStatusFilter,
  EventWithHost,
} from "@/types";

type AdminEventRow = EventWithHost & { participant_count: number };

interface EventsTableProps {
  /** 서버(getAdminEventsOverview)에서 이미 검색·필터·페이지네이션이 적용된 현재 페이지 목록 */
  events: AdminEventRow[];
  /** 필터 조건 전체에 대한 총 건수(페이지네이션 계산용) */
  totalCount: number;
  /** 현재 적용된 검색/필터/페이지 파라미터(URL 쿼리와 동기화된 상태) */
  filter: AdminEventListParams;
}

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

/**
 * 관리자용 이벤트 관리 테이블.
 * 검색어(제목/장소)·상태·페이지는 모두 URL 쿼리 파라미터로 관리하며, 값이 바뀔 때마다
 * router.push로 URL을 갱신해 상위 Server Component(app/admin/(dashboard)/events/page.tsx)가
 * getAdminEventsOverview를 다시 호출하도록 한다(클라이언트 사이드 필터링 없음).
 *
 * 삭제 확인 후에는 app/actions/admin.ts의 deleteEventAsAdmin 서버 액션을 useTransition으로
 * 호출한다. 액션 내부에서 이미 revalidatePath를 호출하지만, 현재 화면을 즉시 갱신하기 위해
 * 성공 시 router.refresh()도 함께 호출한다.
 */
export function EventsTable({ events, totalCount, filter }: EventsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(filter.search);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / filter.pageSize));
  const currentPage = filter.page + 1;
  const hasPrevPage = filter.page > 0;
  const hasNextPage = currentPage < totalPages;

  function updateQuery(
    patch: Partial<{
      search: string;
      status: EventStatusFilter;
      page: number;
    }>,
  ) {
    const next = {
      search: patch.search ?? filter.search,
      status: patch.status ?? filter.status,
      // 검색어/상태가 바뀌면 첫 페이지로 리셋하고, 페이지 이동일 때만 명시적으로 page를 넘긴다.
      page: patch.page ?? 0,
    };

    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.status !== "all") params.set("status", next.status);
    if (next.page > 0) params.set("page", String(next.page));

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput });
  }

  function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;

    startTransition(async () => {
      const result = await deleteEventAsAdmin(targetId);
      if (result.success) {
        toast.success("이벤트가 삭제되었습니다");
        // revalidatePath는 이미 서버 액션 내부에서 호출되지만, 현재 페이지를 즉시
        // 최신 데이터로 다시 렌더링하기 위해 router.refresh()로 재조회를 트리거한다.
        router.refresh();
      } else {
        toast.error(result.message ?? "삭제에 실패했어요");
      }
      setDeleteTargetId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* 검색/상태 필터 영역 */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목 또는 장소로 검색"
            className="pl-9"
          />
        </div>

        <Select
          value={filter.status}
          onValueChange={(value: EventStatusFilter) =>
            updateQuery({ status: value })
          }
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
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

      {/* 이벤트 목록 테이블 */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>주최자</TableHead>
              <TableHead>일시</TableHead>
              <TableHead>장소</TableHead>
              <TableHead className="text-right">참여자수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {event.title}
                  </TableCell>
                  <TableCell>{event.host.name}</TableCell>
                  <TableCell>
                    {formatEventDateTime(event.event_date, { withYear: true })}
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {event.location}
                  </TableCell>
                  <TableCell className="text-right">
                    {event.participant_count}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={deleteTargetId === event.id}
                      onOpenChange={(open) =>
                        setDeleteTargetId(open ? event.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="이벤트 삭제"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
                          <DialogDescription>
                            삭제하면 되돌릴 수 없어요
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteTargetId(null)}
                            disabled={isPending}
                          >
                            취소
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isPending}
                          >
                            {isPending ? "삭제 중..." : "삭제"}
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
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  조건에 맞는 이벤트가 없습니다.
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
