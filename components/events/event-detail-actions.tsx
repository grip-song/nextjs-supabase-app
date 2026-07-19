"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteEvent } from "@/app/actions/events";

interface EventDetailActionsProps {
  eventId: string;
  inviteCode: string;
}

/**
 * 이벤트 상세 페이지의 주최자 전용 액션(초대 링크 복사/수정/삭제).
 * 삭제는 폼 없이 버튼 클릭으로 바로 서버 액션(deleteEvent)을 호출한다.
 * 성공 시 서버 액션 내부의 redirect가 네비게이션까지 처리하므로,
 * 클라이언트에서는 실패했을 때(권한 없음 등)만 sonner toast로 안내한다.
 */
export function EventDetailActions({
  eventId,
  inviteCode,
}: EventDetailActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleCopyInviteLink() {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("링크가 복사되었습니다");
  }

  function handleDeleteConfirm() {
    setIsDeleteDialogOpen(false);
    startDeleteTransition(async () => {
      const result = await deleteEvent(eventId);
      // 성공 시 deleteEvent 내부의 redirect()가 던져져 이 아래 코드는 실행되지 않는다.
      if (result && !result.success) {
        toast.error(result.message ?? "이벤트 삭제에 실패했어요");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleCopyInviteLink}
      >
        <Link2 />
        초대 링크 복사
      </Button>

      <Button variant="outline" size="sm" asChild>
        <Link href={`/events/${eventId}/edit`}>
          <Pencil />
          수정
        </Link>
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 />
            삭제
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
            <DialogDescription>삭제하면 되돌릴 수 없어요</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
