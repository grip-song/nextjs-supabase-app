import { EventsTable } from "@/components/admin/events-table";
import { getAdminEventsOverview } from "@/lib/admin/queries";
import type { AdminEventListParams, EventStatusFilter } from "@/types";

const PAGE_SIZE = 20;

interface AdminEventsPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

/**
 * 관리자 이벤트 관리 페이지.
 * searchParams(Promise, Next.js 15)를 파싱해 서버 사이드 검색/필터/페이지네이션 파라미터를 만들고
 * getAdminEventsOverview로 실제 조회한 결과를 EventsTable(프레젠테이셔널 컴포넌트)에 전달한다.
 */
export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const sp = await searchParams;

  const params: AdminEventListParams = {
    search: sp.search ?? "",
    status: (sp.status as EventStatusFilter | undefined) ?? "all",
    page: Number(sp.page ?? 0) || 0,
    pageSize: PAGE_SIZE,
  };

  const { events, totalCount } = await getAdminEventsOverview(params);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">이벤트 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 이벤트를 검색·필터링하고 필요 시 삭제할 수 있어요.
        </p>
      </div>

      <EventsTable events={events} totalCount={totalCount} filter={params} />
    </div>
  );
}
