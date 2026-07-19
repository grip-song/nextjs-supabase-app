import { EventListTabs } from "@/components/events/event-list-tabs";
import {
  getCurrentUser,
  getMyHostedEvents,
  getMyParticipatingEvents,
  getUserById,
} from "@/lib/dummy-data";
import type { User } from "@/types";

export default function EventsPage() {
  const hostedEvents = getMyHostedEvents();
  const participatingEvents = getMyParticipatingEvents();
  const currentUser = getCurrentUser();

  // 참여 중인 이벤트들의 주최자를 미리 조회해 id -> User 맵으로 구성한다.
  const hostUsersById = participatingEvents.reduce<Record<string, User>>(
    (acc, event) => {
      const host = getUserById(event.created_by);
      if (host) acc[event.created_by] = host;
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-foreground">내 이벤트</h1>

      <EventListTabs
        hostedEvents={hostedEvents}
        participatingEvents={participatingEvents}
        hostUsersById={hostUsersById}
        currentUser={currentUser}
      />
    </div>
  );
}
