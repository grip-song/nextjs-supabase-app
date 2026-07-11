import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">새 이벤트 만들기</h1>
      <EventForm mode="create" />
    </div>
  );
}
