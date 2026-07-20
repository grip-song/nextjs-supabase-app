import type { ReactNode } from "react";
import { Activity, CalendarDays, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import {
  getAdminDashboardStats,
  getRecentEventsWithHost,
} from "@/lib/admin/queries";

/** 통계 카드 한 항목의 데이터 형태 */
interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
}

/** 이벤트 생성일을 "YYYY년 M월 D일" 형식으로 표시 */
function formatCreatedAt(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const [
    { totalEvents, totalUsers, totalParticipants, eventsByStatus },
    recentEvents,
  ] = await Promise.all([getAdminDashboardStats(), getRecentEventsWithHost(5)]);

  const stats: StatItem[] = [
    {
      label: "전체 이벤트",
      value: totalEvents,
      icon: <CalendarDays className="size-5 text-muted-foreground" />,
    },
    {
      label: "전체 사용자",
      value: totalUsers,
      icon: <Users className="size-5 text-muted-foreground" />,
    },
    {
      label: "전체 참여자",
      value: totalParticipants,
      icon: <UserCheck className="size-5 text-muted-foreground" />,
    },
    {
      label: "진행 중인 이벤트",
      value: eventsByStatus.ongoing,
      icon: <Activity className="size-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-sm text-muted-foreground">
          전체 이벤트와 사용자 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 이벤트 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 이벤트</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <ul className="divide-y">
              {recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      주최자 {event.host.name} ·{" "}
                      {formatCreatedAt(event.created_at)}
                    </p>
                  </div>
                  <EventStatusBadge
                    status={event.status}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              등록된 이벤트가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
