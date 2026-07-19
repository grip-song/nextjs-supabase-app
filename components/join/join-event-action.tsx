"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface JoinEventActionProps {
  eventId: string;
  alreadyJoined: boolean;
}

/**
 * 초대 링크 페이지의 참여 액션.
 * 실제 참여 데이터 저장 로직은 없으며(Task 009 범위), 이미 참여한 경우
 * 이벤트 상세로 바로 이동하는 링크를, 아니면 참여 버튼을 보여준다.
 */
export function JoinEventAction({
  eventId,
  alreadyJoined,
}: JoinEventActionProps) {
  const router = useRouter();

  if (alreadyJoined) {
    return (
      <Button asChild className="w-full">
        <Link href={`/events/${eventId}`}>이벤트 보기</Link>
      </Button>
    );
  }

  function handleJoin() {
    toast.success("참여가 완료되었습니다");
    router.push(`/events/${eventId}`);
  }

  return (
    <Button className="w-full" onClick={handleJoin}>
      참여하기
    </Button>
  );
}
