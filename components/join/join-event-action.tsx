"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { joinEvent } from "@/app/actions/participants";

interface JoinEventActionProps {
  eventId: string;
  alreadyJoined: boolean;
}

/**
 * 초대 링크 페이지의 참여 액션.
 * joinEvent 서버 액션을 호출해 실제로 event_participants에 참여 행을 추가한다.
 * 성공 시 서버 액션 내부의 redirect가 네비게이션까지 처리하므로,
 * 클라이언트에서는 실패했을 때만 sonner toast로 안내한다.
 * 비로그인 사용자가 클릭한 경우(joinEvent가 '로그인이 필요해요'를 반환) 로그인 페이지로 보낸다.
 */
export function JoinEventAction({
  eventId,
  alreadyJoined,
}: JoinEventActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (alreadyJoined) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-center text-sm text-muted-foreground">
          이미 참여한 이벤트입니다
        </p>
        <Button asChild className="w-full">
          <Link href={`/events/${eventId}`}>이벤트 보기</Link>
        </Button>
      </div>
    );
  }

  function handleJoin() {
    startTransition(async () => {
      const result = await joinEvent(eventId);
      // 성공 시 joinEvent 내부의 redirect()가 던져져 이 아래 코드는 실행되지 않는다.
      if (result && !result.success) {
        toast.error(result.message ?? "참여에 실패했어요");
        if (result.message === "로그인이 필요해요") {
          router.push("/auth/login");
        }
      }
    });
  }

  return (
    <Button className="w-full" onClick={handleJoin} disabled={isPending}>
      {isPending ? "참여 중..." : "참여하기"}
    </Button>
  );
}
