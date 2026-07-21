import Image from "next/image";
import Link from "next/link";
import { Calendar, ImageOff, MapPin, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { formatEventDateTime } from "@/lib/events/datetime";
import type { EventWithParticipantCount, User } from "@/types";

interface EventCardProps {
  event: EventWithParticipantCount;
  host?: Pick<User, "name" | "avatar_url">;
  href?: string;
  variant?: "default" | "compact";
  className?: string;
}

/**
 * 이벤트 카드 컴포넌트.
 * 주최자 뷰(내 이벤트 목록)와 참여자 뷰(참여한 이벤트 목록) 양쪽에서 공용으로 사용한다.
 */
export function EventCard({
  event,
  host,
  href,
  variant = "default",
  className,
}: EventCardProps) {
  const isCompact = variant === "compact";

  return (
    <Link href={href ?? `/events/${event.id}`} className="block">
      <Card
        className={cn(
          "overflow-hidden transition-colors hover:bg-accent/50",
          className,
        )}
      >
        {!isCompact && (
          <div className="relative aspect-video w-full bg-muted">
            {event.cover_image_url ? (
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageOff className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        <CardHeader className={cn("gap-2", isCompact && "p-4")}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 leading-none font-semibold tracking-tight">
              {event.title}
            </h3>
            <EventStatusBadge status={event.status} className="shrink-0" />
          </div>
        </CardHeader>

        <CardContent
          className={cn("flex flex-col gap-1.5", isCompact && "px-4 pt-0 pb-4")}
        >
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-4 shrink-0" />
            <span className="line-clamp-1">
              {formatEventDateTime(event.event_date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" />
            <span>참여자 {event.participant_count}명</span>
          </div>
        </CardContent>

        {host && (
          <CardFooter className={cn("gap-2", isCompact && "px-4 pt-0 pb-4")}>
            <UserAvatar user={host} size="sm" />
            <span className="text-sm text-muted-foreground">{host.name}</span>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
