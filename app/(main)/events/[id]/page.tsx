import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ImageOff, MapPin } from "lucide-react";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventDetailActions } from "@/components/events/event-detail-actions";
import { ParticipantsRealtimeList } from "@/components/participants/participants-realtime-list";
import { LeaveEventButton } from "@/components/participants/leave-event-button";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/events/queries";
import { getParticipantsWithUser } from "@/lib/participants/queries";
import { formatEventDateTime } from "@/lib/events/datetime";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims?.sub;

  const participants = await getParticipantsWithUser(id);
  const isHost = event.created_by === currentUserId;
  const isParticipating = participants.some(
    (participant) =>
      participant.user_id === currentUserId &&
      participant.role === "participant",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
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
            <span>
              {formatEventDateTime(event.event_date, { withYear: true })}
            </span>
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

      {!isHost && isParticipating && <LeaveEventButton eventId={event.id} />}

      <ParticipantsRealtimeList
        eventId={event.id}
        initialParticipants={participants}
        currentUserId={currentUserId}
      />
    </div>
  );
}
