import { redirect } from "next/navigation";
import { CalendarPlus, PartyPopper } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { getMyHostedEvents } from "@/lib/events/queries";
import { getUserById } from "@/lib/users/queries";
import { getMyParticipatingEvents } from "@/lib/participants/queries";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // 미들웨어가 비로그인 접근을 이미 /auth/login으로 리다이렉트하지만,
  // 서버 컴포넌트 자체에서도 방어적으로 재확인한다.
  if (!claims) {
    redirect("/auth/login");
  }

  const [user, hostedEvents] = await Promise.all([
    getUserById(claims.sub),
    getMyHostedEvents(claims.sub),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const participatingEvents = await getMyParticipatingEvents(claims.sub);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">프로필</h1>

      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">{user.name}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          내가 만든 이벤트 {hostedEvents.length}개
        </h2>

        {hostedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="아직 만든 이벤트가 없어요"
            actionLabel="이벤트 만들기"
            actionHref="/events/new"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {hostedEvents.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          참여한 이벤트 {participatingEvents.length}개
        </h2>

        {participatingEvents.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="아직 참여한 이벤트가 없어요"
            description="초대 링크를 받으면 이벤트에 참여할 수 있어요"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {participatingEvents.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
