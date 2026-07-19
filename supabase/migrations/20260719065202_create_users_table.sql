-- public.users 테이블: auth.users 1:1 확장 패턴 (Gather 프로젝트 사용자 프로필)
-- types/user.ts의 User 타입(id, email, name, avatar_url, role, created_at, updated_at)과 1:1 대응
-- email은 auth.users에도 존재하지만, PostgREST 조인으로 주최자 정보를 노출하기 위해 미러링한다.
-- 실제 값 채우기(회원가입 시 auth 트리거로 자동 생성)와 RLS 정책 적용은 이후 태스크 범위이며,
-- 이 마이그레이션은 테이블 구조(컬럼/제약)만 생성한다.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null check (char_length(name) between 1 and 50),
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Gather 프로젝트 사용자 프로필 (auth.users 1:1 확장)';

-- updated_at 자동 갱신 트리거 (public.profiles 마이그레이션에서 생성된 공용 함수 재사용)
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.handle_updated_at();
