"use client";

import { CalendarPlus, PartyPopper } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventWithParticipantCount, User } from "@/types";

interface EventListTabsProps {
  hostedEvents: EventWithParticipantCount[];
  participatingEvents: EventWithParticipantCount[];
  /** 참여 중인 이벤트의 주최자 조회용 맵 (created_by -> User) */
  hostUsersById: Record<string, User>;
  /** 만든 이벤트 카드에 표시할 현재 사용자(주최자 본인) */
  currentUser: User;
}

/**
 * "만든 이벤트"와 "참여 중인 이벤트"를 탭으로 전환해 보여주는 컴포넌트.
 * 참여 중인 이벤트 카드에는 주최자 정보를 함께 표시한다.
 */
export function EventListTabs({
  hostedEvents,
  participatingEvents,
  hostUsersById,
  currentUser,
}: EventListTabsProps) {
  return (
    <Tabs defaultValue="hosted">
      <TabsList className="w-full">
        <TabsTrigger value="hosted">만든 이벤트</TabsTrigger>
        <TabsTrigger value="participating">참여 중인 이벤트</TabsTrigger>
      </TabsList>

      <TabsContent value="hosted" className="mt-4">
        {hostedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="아직 만든 이벤트가 없어요"
            actionLabel="이벤트 만들기"
            actionHref="/events/new"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hostedEvents.map((event) => (
              <EventCard key={event.id} event={event} host={currentUser} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="participating" className="mt-4">
        {participatingEvents.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="아직 참여한 이벤트가 없어요"
            description="초대 링크를 받으면 이벤트에 참여할 수 있어요"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {participatingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                host={hostUsersById[event.created_by]}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
