---
name: project_event_participants_includes_host
description: event_participants 테이블에는 참여자뿐 아니라 주최자(host)도 role='host'로 포함되어야 한다는 더미데이터 기반 계약
metadata:
  type: project
---

`lib/dummy-data/helpers.ts`의 `getEventsWithParticipantCount()`는 `event_participants`에서
`event_id`가 일치하는 모든 행(role 무관)을 세어 `participant_count`를 만든다. 그리고
`getAdminUsersOverview()`는 `hostedEventCount`를 `event_participants`에서 `role === 'host'`인
행으로 집계한다.

**Why:** 이는 dummy-data 구조상 이벤트 생성 시 주최자도 `event_participants`에
`role: 'host'`인 행으로 함께 들어가 있다는 것을 전제한다. 즉 "참여자 수"에는 주최자 본인도 포함된다.

**How to apply:** 실제 스키마/구현에서도 이벤트 생성 시(Task 007 트리거 또는 Task 009 API 로직)
`created_by` 사용자를 `event_participants`에 `role='host'`로 자동 삽입해야 dummy-data와 동일한
집계 결과가 나온다. 이 규칙을 빠뜨리면 `participant_count`와 `hostedEventCount` 집계가 더미데이터
시절과 달라져 UI 표시가 어긋난다. [[project_docs_location]]
