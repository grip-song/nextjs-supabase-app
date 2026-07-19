"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventStatus } from "@/types";

/** 월별 신규 이벤트 추이 차트 하나의 데이터 포인트 */
interface MonthlyEventDatum {
  month: string;
  count: number;
}

interface AnalyticsChartsProps {
  /** getEventsCreatedByMonth()의 반환값 (최근 6개월, 월 오름차순) */
  monthlyEvents: MonthlyEventDatum[];
  /** getAdminDashboardStats().eventsByStatus */
  eventsByStatus: Record<EventStatus, number>;
  className?: string;
}

/**
 * 이벤트 상태별 라벨과 차트 색상 매핑.
 * 색상은 globals.css에 정의된 --chart-1~5 CSS 변수(다크모드 대응 완료)를 사용한다.
 */
const STATUS_CHART_CONFIG: Record<
  EventStatus,
  { label: string; color: string }
> = {
  upcoming: { label: "예정", color: "hsl(var(--chart-1))" },
  ongoing: { label: "진행 중", color: "hsl(var(--chart-2))" },
  ended: { label: "종료", color: "hsl(var(--chart-4))" },
};

/** "YYYY-MM" 형식의 월 문자열을 "M월" 형식의 축 라벨로 변환 */
function formatMonthLabel(month: string): string {
  const [, monthPart] = month.split("-");
  return `${Number(monthPart)}월`;
}

/** 공통 축 눈금 스타일 (다크모드에서도 읽히도록 muted-foreground CSS 변수 사용) */
const AXIS_TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

/**
 * 두 차트가 공유하는 커스텀 툴팁.
 * shadcn Card/Popover 톤과 맞춰 배경/테두리를 CSS 변수 기반 Tailwind 토큰으로 구성한다.
 */
function ChartTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((entry) => (
        <p
          key={`${entry.dataKey ?? entry.name}`}
          className="text-muted-foreground"
        >
          {entry.name}:{" "}
          <span className="font-medium text-popover-foreground">
            {entry.value}건
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * 관리자 통계 분석 페이지의 차트 영역.
 * Recharts는 SSR을 지원하지 않으므로 반드시 클라이언트 컴포넌트에서만 렌더링한다.
 * - 좌측: 월별 신규 이벤트 추이 (막대 그래프)
 * - 우측: 이벤트 상태별 분포 (막대 그래프, 상태별 색상 구분)
 */
export function AnalyticsCharts({
  monthlyEvents,
  eventsByStatus,
  className,
}: AnalyticsChartsProps) {
  const monthlyChartData = monthlyEvents.map((item) => ({
    ...item,
    label: formatMonthLabel(item.month),
  }));

  const statusChartData = (
    Object.keys(STATUS_CHART_CONFIG) as EventStatus[]
  ).map((status) => ({
    status,
    label: STATUS_CHART_CONFIG[status].label,
    count: eventsByStatus[status],
    color: STATUS_CHART_CONFIG[status].color,
  }));

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${className ?? ""}`}>
      {/* 월별 신규 이벤트 추이 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 신규 이벤트 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="h-72 w-full"
            role="img"
            aria-label="월별 신규 이벤트 수 막대 그래프"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tick={AXIS_TICK_STYLE}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK_STYLE}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="count"
                  name="신규 이벤트"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    className="fill-foreground text-xs"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 이벤트 상태별 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>이벤트 상태별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="h-72 w-full"
            role="img"
            aria-label="이벤트 상태별 분포 막대 그래프"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusChartData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tick={AXIS_TICK_STYLE}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK_STYLE}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="count"
                  name="이벤트 수"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={64}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    className="fill-foreground text-xs"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
