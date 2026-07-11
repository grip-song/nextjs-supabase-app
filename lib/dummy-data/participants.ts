import type { EventParticipant } from "@/types";

/**
 * 더미 참여자 목록
 * 이벤트마다 role: 'host' 1명(주최자, event.created_by와 동일한 user_id) +
 * 'participant' 여러 명으로 구성했다.
 */
export const dummyParticipants: EventParticipant[] = [
  // event-1 (host: user-1) — 5명
  {
    id: "participant-1",
    event_id: "event-1",
    user_id: "user-1",
    role: "host",
    joined_at: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "participant-2",
    event_id: "event-1",
    user_id: "user-2",
    role: "participant",
    joined_at: "2026-06-21T10:15:00.000Z",
  },
  {
    id: "participant-3",
    event_id: "event-1",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-06-21T11:00:00.000Z",
  },
  {
    id: "participant-4",
    event_id: "event-1",
    user_id: "user-4",
    role: "participant",
    joined_at: "2026-06-22T08:30:00.000Z",
  },
  {
    id: "participant-5",
    event_id: "event-1",
    user_id: "user-5",
    role: "participant",
    joined_at: "2026-06-23T13:20:00.000Z",
  },

  // event-2 (host: user-1) — 4명
  {
    id: "participant-6",
    event_id: "event-2",
    user_id: "user-1",
    role: "host",
    joined_at: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "participant-7",
    event_id: "event-2",
    user_id: "user-6",
    role: "participant",
    joined_at: "2026-06-26T09:00:00.000Z",
  },
  {
    id: "participant-8",
    event_id: "event-2",
    user_id: "user-7",
    role: "participant",
    joined_at: "2026-06-26T09:30:00.000Z",
  },
  {
    id: "participant-9",
    event_id: "event-2",
    user_id: "user-8",
    role: "participant",
    joined_at: "2026-06-27T15:00:00.000Z",
  },

  // event-3 (host: user-2) — 4명, user-1 참여
  {
    id: "participant-10",
    event_id: "event-3",
    user_id: "user-2",
    role: "host",
    joined_at: "2026-06-28T08:30:00.000Z",
  },
  {
    id: "participant-11",
    event_id: "event-3",
    user_id: "user-1",
    role: "participant",
    joined_at: "2026-06-29T09:00:00.000Z",
  },
  {
    id: "participant-12",
    event_id: "event-3",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-06-29T10:00:00.000Z",
  },
  {
    id: "participant-13",
    event_id: "event-3",
    user_id: "user-4",
    role: "participant",
    joined_at: "2026-06-30T11:00:00.000Z",
  },

  // event-4 (host: user-3) — 6명
  {
    id: "participant-14",
    event_id: "event-4",
    user_id: "user-3",
    role: "host",
    joined_at: "2026-06-15T07:00:00.000Z",
  },
  {
    id: "participant-15",
    event_id: "event-4",
    user_id: "user-2",
    role: "participant",
    joined_at: "2026-06-16T08:00:00.000Z",
  },
  {
    id: "participant-16",
    event_id: "event-4",
    user_id: "user-5",
    role: "participant",
    joined_at: "2026-06-16T09:00:00.000Z",
  },
  {
    id: "participant-17",
    event_id: "event-4",
    user_id: "user-6",
    role: "participant",
    joined_at: "2026-06-17T10:00:00.000Z",
  },
  {
    id: "participant-18",
    event_id: "event-4",
    user_id: "user-7",
    role: "participant",
    joined_at: "2026-06-17T11:00:00.000Z",
  },
  {
    id: "participant-19",
    event_id: "event-4",
    user_id: "user-8",
    role: "participant",
    joined_at: "2026-06-18T12:00:00.000Z",
  },

  // event-5 (host: user-4) — 4명, user-1 참여 (종료된 이벤트)
  {
    id: "participant-20",
    event_id: "event-5",
    user_id: "user-4",
    role: "host",
    joined_at: "2026-05-30T09:00:00.000Z",
  },
  {
    id: "participant-21",
    event_id: "event-5",
    user_id: "user-1",
    role: "participant",
    joined_at: "2026-05-31T10:00:00.000Z",
  },
  {
    id: "participant-22",
    event_id: "event-5",
    user_id: "user-2",
    role: "participant",
    joined_at: "2026-06-01T11:00:00.000Z",
  },
  {
    id: "participant-23",
    event_id: "event-5",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-06-02T12:00:00.000Z",
  },

  // event-6 (host: user-2) — 3명
  {
    id: "participant-24",
    event_id: "event-6",
    user_id: "user-2",
    role: "host",
    joined_at: "2026-05-25T06:00:00.000Z",
  },
  {
    id: "participant-25",
    event_id: "event-6",
    user_id: "user-5",
    role: "participant",
    joined_at: "2026-05-26T07:00:00.000Z",
  },
  {
    id: "participant-26",
    event_id: "event-6",
    user_id: "user-6",
    role: "participant",
    joined_at: "2026-05-27T08:00:00.000Z",
  },

  // event-7 (host: user-5) — 7명, user-1 참여
  {
    id: "participant-27",
    event_id: "event-7",
    user_id: "user-5",
    role: "host",
    joined_at: "2026-07-01T05:00:00.000Z",
  },
  {
    id: "participant-28",
    event_id: "event-7",
    user_id: "user-1",
    role: "participant",
    joined_at: "2026-07-02T06:00:00.000Z",
  },
  {
    id: "participant-29",
    event_id: "event-7",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-07-02T07:00:00.000Z",
  },
  {
    id: "participant-30",
    event_id: "event-7",
    user_id: "user-4",
    role: "participant",
    joined_at: "2026-07-03T08:00:00.000Z",
  },
  {
    id: "participant-31",
    event_id: "event-7",
    user_id: "user-6",
    role: "participant",
    joined_at: "2026-07-03T09:00:00.000Z",
  },
  {
    id: "participant-32",
    event_id: "event-7",
    user_id: "user-7",
    role: "participant",
    joined_at: "2026-07-04T10:00:00.000Z",
  },
  {
    id: "participant-33",
    event_id: "event-7",
    user_id: "user-8",
    role: "participant",
    joined_at: "2026-07-04T11:00:00.000Z",
  },

  // event-8 (host: user-6) — 8명, user-1 참여 (종료된 이벤트)
  {
    id: "participant-34",
    event_id: "event-8",
    user_id: "user-6",
    role: "host",
    joined_at: "2026-05-10T04:00:00.000Z",
  },
  {
    id: "participant-35",
    event_id: "event-8",
    user_id: "user-1",
    role: "participant",
    joined_at: "2026-05-11T05:00:00.000Z",
  },
  {
    id: "participant-36",
    event_id: "event-8",
    user_id: "user-2",
    role: "participant",
    joined_at: "2026-05-11T06:00:00.000Z",
  },
  {
    id: "participant-37",
    event_id: "event-8",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-05-12T07:00:00.000Z",
  },
  {
    id: "participant-38",
    event_id: "event-8",
    user_id: "user-4",
    role: "participant",
    joined_at: "2026-05-12T08:00:00.000Z",
  },
  {
    id: "participant-39",
    event_id: "event-8",
    user_id: "user-5",
    role: "participant",
    joined_at: "2026-05-13T09:00:00.000Z",
  },
  {
    id: "participant-40",
    event_id: "event-8",
    user_id: "user-7",
    role: "participant",
    joined_at: "2026-05-13T10:00:00.000Z",
  },
  {
    id: "participant-41",
    event_id: "event-8",
    user_id: "user-8",
    role: "participant",
    joined_at: "2026-05-14T11:00:00.000Z",
  },

  // event-9 (host: user-7) — 3명
  {
    id: "participant-42",
    event_id: "event-9",
    user_id: "user-7",
    role: "host",
    joined_at: "2026-06-18T03:00:00.000Z",
  },
  {
    id: "participant-43",
    event_id: "event-9",
    user_id: "user-2",
    role: "participant",
    joined_at: "2026-06-19T04:00:00.000Z",
  },
  {
    id: "participant-44",
    event_id: "event-9",
    user_id: "user-3",
    role: "participant",
    joined_at: "2026-06-19T05:00:00.000Z",
  },
];
