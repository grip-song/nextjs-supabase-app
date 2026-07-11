import type {
  Event,
  EventWithHost,
  EventWithParticipantCount,
  ParticipantWithUser,
  User,
} from "@/types";
import { dummyUsers } from "./users";
import { dummyEvents } from "./events";
import { dummyParticipants } from "./participants";

/**
 * 현재 로그인한 것으로 간주하는 데모 사용자 ID.
 * 실제 인증 연동(Task 007+) 전까지 "내 이벤트" 등 화면에서 사용한다.
 */
export const CURRENT_USER_ID = dummyUsers[0].id;

/**
 * 모든 조회 함수는 동기 순수 함수로 작성한다.
 * 추후 실제 Supabase 연동 시 동일한 함수 시그니처를 유지한 채
 * 내부만 비동기 쿼리로 교체할 수 있도록 이름과 반환 타입을 맞춘다.
 */

export function getUserById(id: string): User | undefined {
  return dummyUsers.find((user) => user.id === id);
}

export function getEventById(id: string): Event | undefined {
  return dummyEvents.find((event) => event.id === id);
}

export function getEventByInviteCode(inviteCode: string): Event | undefined {
  return dummyEvents.find((event) => event.invite_code === inviteCode);
}

function getParticipantCount(eventId: string): number {
  return dummyParticipants.filter(
    (participant) => participant.event_id === eventId,
  ).length;
}

export function getEventsWithParticipantCount(): EventWithParticipantCount[] {
  return dummyEvents.map((event) => ({
    ...event,
    participant_count: getParticipantCount(event.id),
  }));
}

export function getEventsWithHost(): EventWithHost[] {
  return dummyEvents.flatMap((event) => {
    const host = getUserById(event.created_by);
    if (!host) return [];
    return [{ ...event, host }];
  });
}

export function getParticipantsWithUser(
  eventId: string,
): ParticipantWithUser[] {
  return dummyParticipants
    .filter((participant) => participant.event_id === eventId)
    .flatMap((participant) => {
      const user = getUserById(participant.user_id);
      if (!user) return [];
      return [{ ...participant, user }];
    });
}

export function getCurrentUser(): User {
  const user = getUserById(CURRENT_USER_ID);
  if (!user) {
    throw new Error(
      "CURRENT_USER_ID에 해당하는 더미 사용자를 찾을 수 없습니다.",
    );
  }
  return user;
}

/** 현재 사용자가 주최자(created_by)인 이벤트 목록 */
export function getMyHostedEvents(): EventWithParticipantCount[] {
  return getEventsWithParticipantCount().filter(
    (event) => event.created_by === CURRENT_USER_ID,
  );
}

/** 현재 사용자가 참여자(role: 'participant')로 참여 중인 이벤트 목록 */
export function getMyParticipatingEvents(): EventWithParticipantCount[] {
  const participatingEventIds = new Set(
    dummyParticipants
      .filter(
        (participant) =>
          participant.user_id === CURRENT_USER_ID &&
          participant.role === "participant",
      )
      .map((participant) => participant.event_id),
  );

  return getEventsWithParticipantCount().filter((event) =>
    participatingEventIds.has(event.id),
  );
}
