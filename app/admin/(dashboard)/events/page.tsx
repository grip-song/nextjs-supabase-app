import { EventsTable } from "@/components/admin/events-table";
import { getAdminEventsOverview } from "@/lib/dummy-data/helpers";

export default function AdminEventsPage() {
  const events = getAdminEventsOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">이벤트 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 이벤트를 검색·필터링하고 필요 시 삭제할 수 있어요.
        </p>
      </div>

      <EventsTable initialEvents={events} />
    </div>
  );
}
