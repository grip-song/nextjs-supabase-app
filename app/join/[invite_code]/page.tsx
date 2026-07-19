import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ImageOff, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { JoinEventAction } from "@/components/join/join-event-action";
import {
  CURRENT_USER_ID,
  getEventByInviteCode,
  getParticipantsWithUser,
  getUserById,
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

export default async function JoinEventPage({
  params,
}: {
  params: Promise<{ invite_code: string }>;
}) {
  const { invite_code } = await params;
  const event = getEventByInviteCode(invite_code);

  if (!event) {
    notFound();
  }

  const host = getUserById(event.created_by);
  const participants = getParticipantsWithUser(event.id);
  const alreadyJoined = participants.some(
    (participant) => participant.user_id === CURRENT_USER_ID,
  );

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-bold text-foreground">이벤트 초대</h1>
        <p className="text-sm text-muted-foreground">
          아래 이벤트에 초대되었어요
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full bg-muted">
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

        <CardHeader className="gap-2">
          <h2 className="leading-none font-semibold tracking-tight">
            {event.title}
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
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
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4 shrink-0" />
              <span>참여자 {participants.length}명</span>
            </div>
          </div>

          {host && (
            <div className="flex items-center gap-2 border-t pt-3">
              <UserAvatar user={host} size="sm" />
              <span className="text-sm text-muted-foreground">
                {host.name}님이 주최해요
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <JoinEventAction eventId={event.id} alreadyJoined={alreadyJoined} />
    </div>
  );
}
