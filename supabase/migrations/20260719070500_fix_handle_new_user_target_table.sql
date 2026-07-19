-- Task 007에서 public.profiles(스타터킷 잔재)를 대체하는 public.users 스키마를 새로 만들었지만,
-- auth.users INSERT 시 실행되는 public.handle_new_user() 함수는 여전히 옛 public.profiles 테이블에
-- INSERT하고 있어 신규 가입자가 public.users에 전혀 등록되지 않는 문제가 있었다.
-- 트리거(on_auth_user_created)는 이미 auth.users에 부착되어 함수 이름으로 실행되므로,
-- 함수 본문만 재정의하면 되고 트리거를 다시 만들 필요는 없다.
--
-- public.users.name은 NOT NULL(길이 1~50) 제약이 있으므로,
-- raw_user_meta_data의 full_name -> name -> 이메일 앞부분 순으로 폴백한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 백필: 기존 handle_new_user()가 public.profiles만 채우던 기간에 가입한 auth.users 레코드 중
-- public.users에는 아직 없는 레거시 사용자를 1회성으로 채운다.
insert into public.users (id, email, name, avatar_url)
select
  au.id,
  au.email,
  coalesce(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url'
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;
