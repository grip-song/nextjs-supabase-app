import type { User } from "./user";

export type ParticipantRole = "host" | "participant";

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
};

export type ParticipantWithUser = EventParticipant & { user: User };
