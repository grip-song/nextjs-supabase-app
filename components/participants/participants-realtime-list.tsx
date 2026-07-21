"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ParticipantCard } from "@/components/participants/participant-card";
import type { EventParticipantsRow, UsersRow } from "@/types/database";
import type { ParticipantRole, ParticipantWithUser } from "@/types";

interface ParticipantsRealtimeListProps {
  eventId: string;
  initialParticipants: ParticipantWithUser[];
  currentUserId?: string;
}

/**
 * DB Row(EventParticipantsRow + UsersRow) -> ParticipantWithUser 변환.
 * lib/participants/queries.ts의 getParticipantsWithUser(toParticipant)와 동일한 로직이다.
 * 그 파일은 next/headers를 사용하는 서버 전용 lib/supabase/server를 import하고 있어
 * 클라이언트 컴포넌트에서 직접 재사용할 수 없으므로 부득이 복제한다 - event_participants/users
 * 컬럼이 바뀌면 두 곳을 함께 수정해야 한다.
 */
function toParticipant(
  row: EventParticipantsRow,
  user: UsersRow,
): ParticipantWithUser {
  const role: ParticipantRole = row.role === "host" ? "host" : "participant";

  return {
    id: row.id,
    event_id: row.event_id,
    user_id: row.user_id,
    role,
    joined_at: row.joined_at,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role === "admin" ? "admin" : "user",
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
}

/**
 * 이벤트 상세 페이지의 참여자 목록 컴포넌트.
 * 프로젝트 최초의 Supabase Realtime(postgres_changes) 구독 구현으로, 이후 다른 Realtime
 * 기능을 추가할 때 참고 구현이 된다. event_participants 테이블만, 그리고 이 이벤트(event_id)
 * 로 필터링된 변경만 구독하며, 언마운트 시 반드시 channel.unsubscribe()를 호출한다.
 * 최초 렌더링은 서버에서 fetch한 initialParticipants로 깜빡임 없이 표시하고,
 * 이후 참여/나가기 등 변경이 발생하면 refetch로 목록 전체를 다시 조회해 갱신한다.
 */
export function ParticipantsRealtimeList({
  eventId,
  initialParticipants,
  currentUserId,
}: ParticipantsRealtimeListProps) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    const supabase = createClient();

    async function refetch() {
      const { data: rows } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .order("joined_at");

      if (!rows || rows.length === 0) {
        setParticipants([]);
        return;
      }

      const userIds = [...new Set(rows.map((row) => row.user_id))];
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);

      const userById = new Map((users ?? []).map((user) => [user.id, user]));

      setParticipants(
        rows.flatMap((row) => {
          const user = userById.get(row.user_id);
          return user ? [toParticipant(row, user)] : [];
        }),
      );
    }

    const channel = supabase
      .channel(`event_participants:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        refetch,
      )
      .subscribe();

    // 원인 불명의 Supabase Realtime 결함으로 이 프로젝트에서 event_participants의 INSERT
    // 이벤트가 postgres_changes 구독에 전달되지 않는 경우가 있음을 raw 프로브로 확인함
    // (DELETE는 정상 전달됨; RLS/publication/REPLICA IDENTITY 모두 정상 설정 확인됨).
    // realtime이 이벤트를 놓쳐도 몇 초 내에는 최신 상태가 되도록 폴링을 안전망으로 병행한다.
    const pollTimer = setInterval(refetch, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollTimer);
    };
  }, [eventId]);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">
        참여자 {participants.length}명
      </h2>
      <div className="flex flex-col gap-2">
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            isCurrentUser={participant.user_id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
