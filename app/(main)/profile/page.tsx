import { CalendarPlus, PartyPopper } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import {
  getCurrentUser,
  getMyHostedEvents,
  getMyParticipatingEvents,
} from "@/lib/dummy-data";

export default function ProfilePage() {
  const user = getCurrentUser();
  const hostedEvents = getMyHostedEvents();
  const participatingEvents = getMyParticipatingEvents();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">프로필</h1>

      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">{user.name}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          내가 만든 이벤트 {hostedEvents.length}개
        </h2>

        {hostedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="아직 만든 이벤트가 없어요"
            actionLabel="이벤트 만들기"
            actionHref="/events/new"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {hostedEvents.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          참여한 이벤트 {participatingEvents.length}개
        </h2>

        {participatingEvents.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="아직 참여한 이벤트가 없어요"
            description="초대 링크를 받으면 이벤트에 참여할 수 있어요"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {participatingEvents.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
