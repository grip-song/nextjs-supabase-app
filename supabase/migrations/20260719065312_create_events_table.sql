-- public.events 테이블: types/event.ts의 Event 타입 및 lib/schemas/event.ts의 zod 검증 규칙과 1:1 대응
-- title/location: 1~100자 (eventFormSchema와 동일), description: 선택, 최대 1000자
-- invite_code: 8자 고정 UNIQUE 초대 코드 (인덱스 태스크에서 별도 인덱스를 만들 필요 없이 이 UNIQUE 제약이 대신함)
-- created_by: public.users(id) 참조, 주최자 계정 삭제 시 이벤트도 함께 삭제(CASCADE)
-- RLS 정책은 이번 태스크 범위가 아니며, 이후 'RLS 정책 마이그레이션' 태스크에서 users/events/event_participants를 함께 처리한다.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  description text check (description is null or char_length(description) <= 1000),
  location text not null check (char_length(location) between 1 and 100),
  event_date timestamptz not null,
  cover_image_url text,
  invite_code text not null unique check (char_length(invite_code) = 8),
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'ended')),
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.events is 'Gather 프로젝트 이벤트 (주최자: created_by -> public.users)';

-- updated_at 자동 갱신 트리거 (public.handle_updated_at 공용 함수 재사용)
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.handle_updated_at();

-- 참고: created_by 단독 인덱스는 별도 태스크(인덱스 마이그레이션)에서 생성 예정이므로 여기서는 생성하지 않는다.
