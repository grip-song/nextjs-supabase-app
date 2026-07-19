import { redirect } from "next/navigation";
import { EventListTabs } from "@/components/events/event-list-tabs";
import { createClient } from "@/lib/supabase/server";
import { getMyHostedEvents } from "@/lib/events/queries";
import { getUserById } from "@/lib/users/queries";
import { getMyParticipatingEvents } from "@/lib/participants/queries";
import type { User } from "@/types";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // 미들웨어가 비로그인 접근을 이미 /auth/login으로 리다이렉트하지만,
  // 서버 컴포넌트 자체에서도 방어적으로 재확인한다.
  if (!claims) {
    redirect("/auth/login");
  }

  const [hostedEvents, currentUser] = await Promise.all([
    getMyHostedEvents(claims.sub),
    getUserById(claims.sub),
  ]);

  if (!currentUser) {
    redirect("/auth/login");
  }

  const participatingEvents = await getMyParticipatingEvents(claims.sub);

  // 참여 중인 이벤트들의 주최자를 created_by 기준으로 dedupe해 병렬 조회한 뒤 id -> User 맵으로 구성한다.
  const hostIds = [
    ...new Set(participatingEvents.map((event) => event.created_by)),
  ];
  const hosts = await Promise.all(hostIds.map((id) => getUserById(id)));
  const hostUsersById = hostIds.reduce<Record<string, User>>(
    (acc, id, index) => {
      const host = hosts[index];
      if (host) acc[id] = host;
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-foreground">내 이벤트</h1>

      <EventListTabs
        hostedEvents={hostedEvents}
        participatingEvents={participatingEvents}
        hostUsersById={hostUsersById}
        currentUser={currentUser}
      />
    </div>
  );
}
