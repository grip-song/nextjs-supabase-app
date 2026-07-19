"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  AdminEventFilter,
  EventStatusFilter,
  EventWithHost,
} from "@/types";

type AdminEventRow = EventWithHost & { participant_count: number };

interface EventsTableProps {
  /** 서버에서 조회한 초기 이벤트 목록 (관리자 화면 전용 더미 조합 데이터) */
  initialEvents: AdminEventRow[];
}

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

/** 이벤트 일시를 "YYYY년 M월 D일 오후 H:mm" 형식으로 표시 */
function formatEventDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * 관리자용 이벤트 관리 테이블.
 * 검색어(제목/장소)와 상태로 클라이언트 사이드 필터링하며,
 * 행 삭제는 로컬 state에서만 제거하는 더미 동작(실제 API 없음)이다.
 */
export function EventsTable({ initialEvents }: EventsTableProps) {
  const [events, setEvents] = useState<AdminEventRow[]>(initialEvents);
  const [filter, setFilter] = useState<AdminEventFilter>({
    search: "",
    status: "all",
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const keyword = filter.search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesKeyword =
        keyword.length === 0 ||
        event.title.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword);
      const matchesStatus =
        filter.status === "all" || event.status === filter.status;

      return matchesKeyword && matchesStatus;
    });
  }, [events, filter]);

  function handleDeleteConfirm() {
    if (!deleteTargetId) return;

    setEvents((prev) => prev.filter((event) => event.id !== deleteTargetId));
    setDeleteTargetId(null);
    toast.success("이벤트가 삭제되었습니다");
  }

  return (
    <div className="space-y-4">
      {/* 검색/상태 필터 영역 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="제목 또는 장소로 검색"
            className="pl-9"
          />
        </div>

        <Select
          value={filter.status}
          onValueChange={(value: EventStatusFilter) =>
            setFilter((prev) => ({ ...prev, status: value }))
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
      </div>

      {/* 이벤트 목록 테이블 */}
      <div className="rounded-md border">
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
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {event.title}
                  </TableCell>
                  <TableCell>{event.host.name}</TableCell>
                  <TableCell>{formatEventDate(event.event_date)}</TableCell>
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
    </div>
  );
}
