import { notFound } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/dummy-data";

/** ISO 문자열을 <input type="datetime-local">이 요구하는 'YYYY-MM-DDTHH:mm' 포맷으로 변환한다. */
function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">이벤트 수정</h1>
      <EventForm
        mode="edit"
        eventId={id}
        defaultValues={{
          title: event.title,
          location: event.location,
          event_date: toDatetimeLocal(event.event_date),
          description: event.description ?? "",
          cover_image_url: event.cover_image_url ?? "",
        }}
      />
    </div>
  );
}
