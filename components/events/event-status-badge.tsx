import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; className?: string; variant?: "secondary" }
> = {
  upcoming: {
    label: "예정",
    className:
      "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ongoing: {
    label: "진행 중",
    className:
      "border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  ended: {
    label: "종료",
    variant: "secondary",
  },
};

/** 이벤트 상태(예정/진행 중/종료)를 나타내는 배지 */
export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
