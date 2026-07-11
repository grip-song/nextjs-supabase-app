import { CalendarPlus } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/empty-state";
import { getCurrentUser, getMyHostedEvents } from "@/lib/dummy-data";

export default function EventsPage() {
  const events = getMyHostedEvents();
  const host = getCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-foreground">내 이벤트</h1>

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="아직 만든 이벤트가 없어요"
          actionLabel="이벤트 만들기"
          actionHref="/events/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} host={host} />
          ))}
        </div>
      )}
    </div>
  );
}
