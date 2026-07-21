---
name: project_supabase_db_connection_timeout
description: Supabase MCP의 DB 직접 연결 도구가 반복적으로 타임아웃되는 알려진 이슈
metadata:
  type: project
---

2026-07-19 기준, 이 프로젝트의 Supabase MCP 연동 상태:

- `mcp__supabase__get_project_url` → 성공 (`https://cxwtufhclhcaspduvolq.supabase.co`)
- `mcp__supabase__get_advisors` (security/performance) → 성공하지만 `{"lints": []}`로 빈 결과 반환
- `mcp__supabase__list_tables`, `list_migrations`, `list_extensions` → 여러 차례 재시도해도 매번
  `"Connection terminated due to connection timeout"` 에러로 실패

**Why:** Management API(HTTPS) 경로는 정상 응답하지만 실제 Postgres 커넥션 풀러를 거치는 도구만 실패하는 패턴이라, 무료 티어 프로젝트의 자동 일시정지(Paused) 상태이거나 DB 컴퓨트 자체가 내려가 있을 가능성이 높음. `get_advisors`의 빈 결과는 "이슈 없음"이 아니라 DB에 실제로 접근하지 못해 빈 값을 반환했을 가능성도 배제할 수 없어 신뢰하기 어려움.

**How to apply:** 실제 마이그레이션(`apply_migration`, `execute_sql`)을 시도하기 전에 반드시 `list_tables`를 먼저 재시도해서 여전히 타임아웃이면, 사용자에게 Supabase 대시보드에서 프로젝트가 Paused 상태인지 직접 확인하고 Resume 시켜달라고 요청할 것. 이 문제가 해결되지 않은 채로 마이그레이션을 적용하면 실패하거나 상태가 불명확해질 수 있음.
