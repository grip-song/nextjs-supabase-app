-- users/events/event_participants 3개 테이블 RLS 활성화 및 정책 (shrimp-rules.md 7절 RLS 정책 원칙)
-- 원칙: users는 본인 정보만 수정 가능 / events는 주최자(created_by)만 수정·삭제 가능 /
--       event_participants는 본인만 삽입·삭제 가능 / 관리자(role='admin')는 모든 테이블 전체 접근
--
-- is_admin()은 반드시 public.users.role만 신뢰 소스로 사용한다.
-- 미들웨어(lib/supabase/proxy.ts)가 현재 참조하는 auth user_metadata.role은 클라이언트가 위조할 수 있으므로
-- RLS 판정 기준으로는 절대 사용하지 않는다(미들웨어 자체 수정은 Task 008 범위이므로 이번 태스크에서 건드리지 않음).
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;

-- ── users ─────────────────────────────────────────────────────────────
-- select: 전체 공개. events/participants와 조인해 주최자·참여자 프로필(이름/아바타/이메일)을 노출해야 하므로 제한하지 않는다.
create policy users_select_all
on public.users for select
using (true);

-- update: 본인만 가능하며, role 컬럼은 본인이 스스로 바꿀 수 없다(현재 저장된 role 값과 동일해야 통과).
create policy users_update_own
on public.users for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select role from public.users where id = auth.uid())
);

-- update: 관리자는 role 변경을 포함해 모든 사용자 행을 수정할 수 있다.
create policy users_update_admin
on public.users for update
using (public.is_admin());

-- ── events ────────────────────────────────────────────────────────────
-- select: 전체 공개(비로그인 사용자도 /join/[invite_code] 초대 미리보기를 볼 수 있어야 함).
create policy events_select_all
on public.events for select
using (true);

-- insert/update/delete: 주최자(created_by) 본인만 가능.
create policy events_insert_own
on public.events for insert
with check (auth.uid() = created_by);

create policy events_update_own
on public.events for update
using (auth.uid() = created_by);

create policy events_delete_own
on public.events for delete
using (auth.uid() = created_by);

-- 관리자는 이벤트 전체(조회/삽입/수정/삭제)에 접근 가능.
create policy events_admin_all
on public.events for all
using (public.is_admin());

-- ── event_participants ────────────────────────────────────────────────
-- select: 로그인한 사용자만 참여자 목록을 조회할 수 있다.
create policy participants_select_auth
on public.event_participants for select
to authenticated
using (true);

-- insert/delete: 본인 행만 가능하며, role='participant'만 허용한다.
-- role='host' 행은 public.handle_new_event_host() 트리거(SECURITY DEFINER)로만 생성되므로
-- 클라이언트가 스스로를 host로 등록할 수 없다.
create policy participants_insert_own
on public.event_participants for insert
with check (auth.uid() = user_id and role = 'participant');

create policy participants_delete_own
on public.event_participants for delete
using (auth.uid() = user_id and role = 'participant');

-- 관리자는 참여자 테이블 전체에 접근 가능.
create policy participants_admin_all
on public.event_participants for all
using (public.is_admin());
