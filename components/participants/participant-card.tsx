import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { ParticipantWithUser } from "@/types";

interface ParticipantCardProps {
  participant: ParticipantWithUser;
  variant?: "default" | "compact";
  /** 현재 로그인한 사용자 본인의 카드인지 여부 */
  isCurrentUser?: boolean;
  className?: string;
}

function formatJoinedAt(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 참여자 프로필 카드. 주최자/참여자 역할 배지와 참여 일시를 함께 보여준다. */
export function ParticipantCard({
  participant,
  variant = "default",
  isCurrentUser = false,
  className,
}: ParticipantCardProps) {
  const isCompact = variant === "compact";
  const isHost = participant.role === "host";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        isCurrentUser && "border-primary",
        className,
      )}
    >
      <UserAvatar user={participant.user} size={isCompact ? "sm" : "md"} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {participant.user.name}
            {isCurrentUser && (
              <span className="text-muted-foreground"> (나)</span>
            )}
          </span>
          <Badge
            variant={isHost ? "outline" : "secondary"}
            className="shrink-0"
          >
            {isHost ? "주최자" : "참여자"}
          </Badge>
        </div>
        {!isCompact && (
          <span className="text-xs text-muted-foreground">
            {formatJoinedAt(participant.joined_at)} 참여
          </span>
        )}
      </div>
    </div>
  );
}
