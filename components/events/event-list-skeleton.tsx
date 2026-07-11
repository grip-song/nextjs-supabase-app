import { EventCardSkeleton } from "@/components/events/event-card-skeleton";

interface EventListSkeletonProps {
  count?: number;
}

/** EventCardSkeleton을 count개만큼 렌더링하는 리스트 로딩 스켈레톤 */
export function EventListSkeleton({ count = 3 }: EventListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
