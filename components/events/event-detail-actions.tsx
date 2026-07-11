"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

interface EventDetailActionsProps {
  eventId: string;
  inviteCode: string;
}

/**
 * 이벤트 상세 페이지의 주최자 전용 액션(초대 링크 복사/수정/삭제).
 * 실제 삭제 로직은 없으며(Task 009 범위), 확인 시 toast 안내 후 목록으로 이동한다.
 */
export function EventDetailActions({
  eventId,
  inviteCode,
}: EventDetailActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function handleCopyInviteLink() {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("링크가 복사되었습니다");
  }

  function handleDeleteConfirm() {
    setIsDeleteDialogOpen(false);
    toast.success("이벤트가 삭제되었습니다");
    router.push("/events");
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
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
