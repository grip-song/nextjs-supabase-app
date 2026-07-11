import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { ParticipantWithUser } from "@/types";

interface ParticipantCardProps {
  participant: ParticipantWithUser;
  variant?: "default" | "compact";
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
  className,
}: ParticipantCardProps) {
  const isCompact = variant === "compact";
  const isHost = participant.role === "host";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        className,
      )}
    >
      <UserAvatar user={participant.user} size={isCompact ? "sm" : "md"} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {participant.user.name}
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
