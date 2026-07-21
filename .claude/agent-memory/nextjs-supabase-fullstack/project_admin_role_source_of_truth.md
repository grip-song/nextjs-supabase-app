---
name: project_admin_role_source_of_truth
description: 관리자 권한 판정 기준이 미들웨어(user_metadata)와 향후 RLS(public.users.role) 사이에서 불일치할 위험이 있다는 설계 이슈
metadata:
  type: project
---

`lib/supabase/proxy.ts`의 `updateSession()`은 `/admin/*` 경로 보호 시 관리자 여부를
`user?.user_metadata?.role === "admin"`으로 판정한다 (JWT claims의 user_metadata 사용).

**Why:** `user_metadata`는 클라이언트가 `supabase.auth.updateUser()`로 직접 수정할 수 있는 값이라
서버 신뢰 기준으로 부적절하다 (위조 가능). 반면 Task 007에서 설계하는 `public.users.role` 컬럼은
RLS UPDATE 정책으로 본인 수정이 차단되므로 신뢰 가능한 소스다. 두 기준이 다르면 미들웨어 통과 여부와
실제 DB 접근 권한(RLS)이 어긋나는 보안 허점이 생길 수 있다.

**How to apply:** Task 007에서 RLS의 관리자 판정은 반드시 `public.users.role`을 기준으로 하는
`is_admin()` 헬퍼 함수를 사용하도록 설계하고, Task 008(인증 시스템)에서 미들웨어의 판정 기준도
`user_metadata.role` 대신 `public.users.role`(또는 최소한 서버 전용 `app_metadata.role`)을 조회하는
방식으로 함께 정리해야 한다는 점을 상기시킬 것. [[project_supabase_db_connection_timeout]]
