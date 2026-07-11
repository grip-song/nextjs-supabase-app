import type { User } from "./user";

export type EventStatus = "upcoming" | "ongoing" | "ended";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EventWithHost = Event & { host: User };

export type EventWithParticipantCount = Event & { participant_count: number };
