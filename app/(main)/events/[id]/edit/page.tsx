import { notFound } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/events/queries";
import { utcIsoToLocalInput } from "@/lib/events/datetime";
import { createClient } from "@/lib/supabase/server";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  // updateEvent 서버 액션이 created_by를 사전 체크해 실제 저장은 막아주지만,
  // 뷰 자체는 아무 체크 없이 렌더링되고 있었다(참여자가 URL로 직접 접근 시 폼이 그대로 노출됨).
  // 방어 심층화를 위해 페이지 레벨에서도 소유자 여부를 확인한다.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims?.sub;

  if (event.created_by !== currentUserId) {
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
          event_date: utcIsoToLocalInput(event.event_date),
          description: event.description ?? "",
        }}
        defaultCoverImageUrl={event.cover_image_url}
      />
    </div>
  );
}
