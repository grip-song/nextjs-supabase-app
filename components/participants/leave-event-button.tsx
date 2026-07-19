"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
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
import { leaveEvent } from "@/app/actions/participants";

interface LeaveEventButtonProps {
  eventId: string;
}

/**
 * 참여자(호스트가 아닌 본인) 전용 이벤트 나가기 버튼.
 * components/events/event-detail-actions.tsx의 삭제 버튼과 동일한 패턴(useTransition +
 * 확인 Dialog)을 사용한다. leaveEvent는 redirect하지 않으므로(현재 페이지에 머무름)
 * 성공 시에도 실패 시에도 다이얼로그를 닫고, 실패했을 때만 sonner toast로 안내한다.
 * 참여자 목록/카운트 갱신은 실시간 구독(ParticipantsRealtimeList)이 처리한다.
 */
export function LeaveEventButton({ eventId }: LeaveEventButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLeaveConfirm() {
    setIsDialogOpen(false);
    startTransition(async () => {
      const result = await leaveEvent(eventId);
      if (!result.success) {
        toast.error(result.message ?? "참여 취소에 실패했어요");
      }
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogOut />
          나가기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트 참여를 취소할까요?</DialogTitle>
          <DialogDescription>
            다시 참여하려면 초대 링크가 필요해요
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeaveConfirm}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "나가기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
