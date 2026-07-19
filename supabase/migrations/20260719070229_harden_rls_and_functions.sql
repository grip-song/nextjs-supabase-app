-- 최종 검증(get_advisors) 결과 발견된, 이번 마이그레이션 시리즈에서 우리가 직접 만든 객체에 대한
-- 안전하게 수정 가능한 보안/성능 경고를 정리한다. (스타터킷 잔재 public.profiles, 계정 전역 설정인
-- Leaked Password Protection, RLS 정책에서 필연적으로 필요한 is_admin()의 anon/authenticated 실행 권한,
-- 그리고 own/admin 정책을 분리해 둔 구조(코드 가독성을 위한 의도적 설계, Task 6에서 승인된 pseudocode)로 인한
-- multiple_permissive_policies 경고는 이번 정리 범위에서 제외한다.)

-- 1) function_search_path_mutable: 함수 검색 경로를 고정해 search_path 조작 공격을 차단한다.
alter function public.handle_updated_at() set search_path = public;
alter function public.handle_new_event_host() set search_path = public;

-- 2) auth_rls_initplan: auth.uid() 호출을 (select auth.uid())로 감싸 쿼리당 1회만 평가되도록 최적화한다.
--    (동작은 완전히 동일, 대량 조회 시 재평가 비용만 제거)
alter policy users_update_own
on public.users
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (select role from public.users where id = (select auth.uid()))
);

alter policy events_insert_own
on public.events
with check ((select auth.uid()) = created_by);

alter policy events_update_own
on public.events
using ((select auth.uid()) = created_by);

alter policy events_delete_own
on public.events
using ((select auth.uid()) = created_by);

alter policy participants_insert_own
on public.event_participants
with check ((select auth.uid()) = user_id and role = 'participant');

alter policy participants_delete_own
on public.event_participants
using ((select auth.uid()) = user_id and role = 'participant');

-- 3) public_bucket_allows_listing: event-covers는 public 버킷이라 getPublicUrl()로 직접 접근 시
--    RLS를 거치지 않으므로, 오브젝트 목록 조회(listing)까지 허용하는 광범위한 SELECT 정책은 불필요하다.
--    (앱은 항상 공개 URL로만 커버 이미지를 조회하며 storage.objects 목록 조회 기능을 쓰지 않는다.)
drop policy covers_select_public on storage.objects;
