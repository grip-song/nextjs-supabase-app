import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import {
  getAdminDashboardStats,
  getEventsCreatedByMonth,
} from "@/lib/admin/queries";

export default async function AdminAnalyticsPage() {
  const [{ eventsByStatus }, monthlyEvents] = await Promise.all([
    getAdminDashboardStats(),
    getEventsCreatedByMonth(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">통계 분석</h1>
        <p className="text-sm text-muted-foreground">
          월별 신규 이벤트 추이와 상태별 분포를 확인하세요.
        </p>
      </div>

      <AnalyticsCharts
        monthlyEvents={monthlyEvents}
        eventsByStatus={eventsByStatus}
      />
    </div>
  );
}
