import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** EventCard와 동일한 레이아웃 치수를 재현하는 로딩 스켈레톤 */
export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>

      <CardFooter className="gap-2">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}
