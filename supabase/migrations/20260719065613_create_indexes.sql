-- ROADMAP Task 007이 명시한 4개 인덱스 중 나머지 3개.
-- invite_code UNIQUE(events_invite_code_key)와 event_participants(event_id,user_id) UNIQUE(event_participants_event_id_user_id_key)는
-- 이전 태스크의 테이블 제약(UNIQUE)에서 이미 자동 생성되었으므로 여기서는 생성하지 않는다.
-- Postgres는 FK 컬럼을 자동으로 인덱싱하지 않으므로, 조회 성능을 위해 명시적으로 생성한다.

-- 주최자별 이벤트 목록 조회 최적화 (getMyHostedEvents 등)
create index idx_events_created_by on public.events (created_by);

-- 이벤트별 참여자 목록 조회 최적화 (getParticipantsWithUser 등)
create index idx_event_participants_event_id on public.event_participants (event_id);

-- 사용자별 참여 이벤트 목록 조회 최적화 (getMyParticipatingEvents 등)
create index idx_event_participants_user_id on public.event_participants (user_id);
