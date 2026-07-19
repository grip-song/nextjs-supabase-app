import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventDetailActions } from "@/components/events/event-detail-actions";
import { ParticipantCard } from "@/components/participants/participant-card";
import {
  CURRENT_USER_ID,
  getEventById,
  getParticipantsWithUser,
} from "@/lib/dummy-data";

function formatEventDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const participants = getParticipantsWithUser(id);
  const isHost = event.created_by === CURRENT_USER_ID;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-foreground">{event.title}</h1>
          <EventStatusBadge status={event.status} className="shrink-0" />
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-4 shrink-0" />
            <span>{formatEventDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {isHost && (
        <EventDetailActions eventId={event.id} inviteCode={event.invite_code} />
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          참여자 {participants.length}명
        </h2>
        <div className="flex flex-col gap-2">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              isCurrentUser={participant.user_id === CURRENT_USER_ID}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
