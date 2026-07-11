import { ParticipantCardSkeleton } from "@/components/participants/participant-card-skeleton";

interface ParticipantListSkeletonProps {
  count?: number;
}

/** ParticipantCardSkeleton을 count개만큼 렌더링하는 리스트 로딩 스켈레톤 */
export function ParticipantListSkeleton({
  count = 3,
}: ParticipantListSkeletonProps) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <ParticipantCardSkeleton key={index} />
      ))}
    </div>
  );
}
