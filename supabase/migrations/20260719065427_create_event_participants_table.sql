-- public.event_participants 테이블: types/participant.ts의 EventParticipant 타입과 1:1 대응
-- (id, event_id, user_id, role, joined_at)
-- event_id/user_id는 각각 events/users 삭제 시 함께 삭제(CASCADE)
-- event_id+user_id UNIQUE 제약으로 동일 사용자의 중복 참여를 방지(인덱스 태스크가 언급한 UNIQUE 요구사항 충족)
create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('host', 'participant')),
  joined_at timestamptz not null default now(),
  unique (event_id, user_id)
);

comment on table public.event_participants is 'Gather 프로젝트 이벤트 참여자 (role: host/participant)';

-- 새 이벤트가 INSERT될 때 created_by 사용자를 role='host'로 자동 참여시키는 함수/트리거.
-- 애플리케이션 레이어에서 host 행을 별도로 INSERT하지 않아도 DB가 정합성을 보장한다
-- (lib/dummy-data/helpers.ts의 getAdminUsersOverview 등 role='host' 집계 로직과 실제 쿼리 결과를 일치시키기 위함).
create function public.handle_new_event_host()
returns trigger as $$
begin
  insert into public.event_participants (event_id, user_id, role)
  values (new.id, new.created_by, 'host');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_event_created
after insert on public.events
for each row
execute function public.handle_new_event_host();
