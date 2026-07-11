import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionSlot?: React.ReactNode;
  className?: string;
}

/**
 * 빈 상태(데이터 없음) UI 컴포넌트.
 * actionHref + actionLabel이 주어지면 Link 버튼을, 그렇지 않으면
 * actionSlot으로 전달된 노드를 렌더링한다(클라이언트 상호작용은 호출부에 위임).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionSlot,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && <Icon className="size-10 text-muted-foreground" />}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionHref && actionLabel ? (
        <Button asChild size="sm" className="mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : (
        actionSlot
      )}
    </div>
  );
}
