import { Skeleton } from "@/components/ui/skeleton";

/** ParticipantCard와 동일한 레이아웃 치수를 재현하는 로딩 스켈레톤 */
export function ParticipantCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
