-- event-covers Storage 버킷 생성 + storage.objects RLS 정책 + event_participants Realtime publication 등록
--
-- 버킷: events.cover_image_url이 공개 조회 가능해야 하므로(events_select_all과 일관되게) public=true로 생성.
-- 허용 확장자(jpg/png/webp)와 최대 5MB 제한은 shrimp-rules.md 7절 Storage 규칙을 그대로 반영.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-covers',
  'event-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- 업로드 경로 규칙: {user_id}/{event_id}/{파일명} (shrimp-rules.md 7절).
-- 정책은 경로의 첫 세그먼트(user_id)만 검증하고, event_id 존재 여부 검증은 애플리케이션 로직(Task 009) 몫이다.
create policy covers_select_public
on storage.objects for select
using (bucket_id = 'event-covers');

create policy covers_insert_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'event-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy covers_update_own
on storage.objects for update
using (
  bucket_id = 'event-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy covers_delete_own
on storage.objects for delete
using (
  bucket_id = 'event-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- event_participants 테이블을 Realtime publication에 등록 (Postgres Changes 구독용).
-- 클라이언트 구독 코드 작성은 Task 010 범위이며, 이번 태스크는 서버측 publication 등록까지만 한다.
alter publication supabase_realtime add table public.event_participants;
