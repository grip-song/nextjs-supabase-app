# Development Guidelines — Gather (Next.js + Supabase)

## 1. Project Overview

- **서비스**: 초대 링크 기반 소규모(5~30명) 일회성 이벤트 관리 플랫폼
- **스택**: Next.js 15 App Router · TypeScript · Supabase (Auth/DB/Storage/Realtime) · Tailwind CSS v4 · shadcn/ui (new-york)
- **PRD 위치**: `docs/PRD.md` — 기능 추가 전 반드시 참조

---

## 2. Project Architecture

```
app/                   # Next.js App Router 페이지·라우트
  auth/                # 인증 관련 페이지 (login, sign-up, confirm 등)
  protected/           # 로그인 필수 페이지
  admin/               # 관리자 전용 (role: admin 체크)
  join/[invite_code]/  # 초대 링크 참여 페이지 (향후 구현)
components/
  ui/                  # shadcn/ui 컴포넌트만 위치 (직접 편집 금지)
  tutorial/            # MVP 완성 후 삭제 예정 임시 컴포넌트
lib/
  supabase/
    client.ts          # 브라우저(클라이언트 컴포넌트) 전용
    server.ts          # 서버 컴포넌트·Route Handler 전용
    proxy.ts           # 미들웨어(proxy.ts) 전용
  utils.ts             # cn(), hasEnvVars
types/
  database.ts          # Supabase DB 타입 수동 정의
proxy.ts               # Next.js 미들웨어 진입점 (middleware.ts 아님)
docs/
  PRD.md               # 기능 명세
  ROADMAP.md           # 개발 로드맵
  LEANCANVAS.md        # 린캔버스
```

---

## 3. Critical File Rules

### 미들웨어 파일

- **진입점은 `proxy.ts` (루트)**. `middleware.ts` 파일을 생성하지 않는다.
- 라우트 보호 로직은 `lib/supabase/proxy.ts`의 `updateSession()`에만 작성한다.
- 현재 보호 규칙: `/`, `/auth/*` 외 모든 경로 → 비로그인 시 `/auth/login` 리다이렉트.
- `/admin/*` 경로 보호 추가 시 `lib/supabase/proxy.ts`에 role 체크 로직을 추가한다.

### Supabase 클라이언트 선택

| 컨텍스트                             | 사용 파일   | import 경로             |
| ------------------------------------ | ----------- | ----------------------- |
| 클라이언트 컴포넌트 (`'use client'`) | `client.ts` | `@/lib/supabase/client` |
| 서버 컴포넌트 / Route Handler        | `server.ts` | `@/lib/supabase/server` |
| 미들웨어 (`proxy.ts`)                | `proxy.ts`  | `@/lib/supabase/proxy`  |

- `server.ts`의 `createClient()`는 **반드시 함수 내부에서 호출**한다. 전역 변수에 저장 금지 (Fluid Compute 호환).
- 세 파일 모두 `createClient<Database>()`로 타입 파라미터를 전달한다.

### 인증 상태 확인

- **`getClaims()` 사용** — `getUser()`는 사용하지 않는다.
- 서버 사이드: `const { data } = await supabase.auth.getClaims(); const user = data?.claims;`
- `getClaims()`와 클라이언트 생성 사이에 다른 코드를 삽입하지 않는다.

### 타입 정의

- 새 Supabase 테이블 추가 시 **`types/database.ts`에 수동으로 타입을 추가**한다.
- `supabase gen types` 자동 생성 파일로 덮어쓰지 않는다.
- 타입 구조:
  ```ts
  export type Database = {
    public: {
      Tables: {
        테이블명: { Row: ...; Insert: ...; Update: ... };
      };
    };
  };
  ```

---

## 4. Multi-File Coordination Rules

### 새 DB 테이블 추가 시 동시 수정 파일

1. `types/database.ts` — Row/Insert/Update 타입 추가
2. Supabase 대시보드 또는 마이그레이션 SQL 실행
3. RLS 정책 설정 확인

### 새 페이지 추가 시

1. `app/[경로]/page.tsx` 생성
2. 보호된 경로라면 `lib/supabase/proxy.ts`의 matcher 또는 리다이렉트 조건 확인
3. 관리자 경로(`/admin/*`)라면 role 체크 로직 추가

### shadcn/ui 컴포넌트 추가 시

- `npx shadcn@latest add [컴포넌트명]` 명령어로만 추가한다.
- 추가된 파일은 `components/ui/`에 위치한다. **직접 편집하지 않는다.**
- `components.json`이 자동 업데이트된다.

---

## 5. Code Standards

### 명명 규칙

- **변수·함수**: 영어 camelCase (`createEvent`, `inviteCode`)
- **컴포넌트**: PascalCase (`EventCard`, `InviteLink`)
- **파일명**: kebab-case (`event-card.tsx`, `invite-link.tsx`)
- **DB 컬럼**: snake_case (`event_id`, `created_at`)

### 언어 규칙

- **UI 텍스트**: 한국어
- **코드 주석**: 한국어 (WHY가 명확하지 않을 때만 작성)
- **커밋 메시지**: 이모지 + 한국어 (`✨ feat: 이벤트 생성 기능 추가`)

### 컴포넌트 작성

- 서버 컴포넌트가 기본값. 클라이언트 상태가 필요할 때만 `'use client'` 추가.
- className 병합은 반드시 `cn()` (`@/lib/utils`) 사용.
- 아이콘은 `lucide-react`만 사용한다.

### 스타일링

- Tailwind CSS v4 사용 (설정 파일 없음, `app/globals.css`에 CSS 변수 정의).
- `tailwind.config.*` 파일을 생성하지 않는다.
- 색상 커스텀은 `app/globals.css`의 `@theme` 또는 CSS 변수로만 정의.
- 다크 모드: `next-themes` + Tailwind `dark:` 클래스 조합.

---

## 6. Routing Patterns

### 인증 흐름

```
로그인 → Google OAuth → /auth/callback → /auth/confirm (OTP) → 목적지
```

- OAuth 콜백: `app/auth/callback/route.ts`
- OTP 처리: `app/auth/confirm/route.ts`

### 보호된 라우트

- 로그인 필수 페이지: `app/protected/` 또는 `lib/supabase/proxy.ts`에서 리다이렉트 처리
- 관리자 전용: `/admin/*` — role 체크는 `lib/supabase/proxy.ts` + 각 페이지 서버 컴포넌트에서 이중 검증

### 초대 링크

- 경로: `/join/[invite_code]`
- 비로그인 사용자 허용 (이벤트 미리보기 후 Google 로그인 유도)
- `lib/supabase/proxy.ts`의 예외 경로에 `/join/*` 추가 필요

---

## 7. Supabase-Specific Rules

### Realtime

- `event_participants` 테이블에만 Realtime 구독 설정
- 클라이언트 컴포넌트에서 `createClient()` (`lib/supabase/client.ts`) 사용
- 컴포넌트 언마운트 시 반드시 구독 해제 (`channel.unsubscribe()`)

### Storage

- 버킷명: `event-covers`
- 허용 확장자: jpg, png, webp
- 최대 크기: 5MB
- 업로드 경로: `{user_id}/{event_id}/{파일명}`

### RLS 정책 원칙

- `users`: 본인 정보만 수정 가능
- `events`: 주최자(`created_by`)만 수정·삭제 가능
- `event_participants`: 본인만 삽입·삭제 가능
- 관리자(`role = 'admin'`): 모든 테이블 전체 접근

---

## 8. Environment Variables

필수 환경 변수 (`env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- `lib/utils.ts`의 `hasEnvVars`가 설정 여부를 확인한다.
- 미설정 시 홈페이지에서 튜토리얼 UI가 표시된다.

---

## 9. Prohibited Actions

- `middleware.ts` 파일 생성 금지 — 미들웨어는 `proxy.ts`만 사용
- `supabase.auth.getUser()` 사용 금지 — 반드시 `getClaims()` 사용
- `components/ui/` 파일 직접 편집 금지 — shadcn CLI로만 추가·관리
- `tailwind.config.*` 파일 생성 금지 — Tailwind v4는 CSS-only 설정
- Supabase 클라이언트를 모듈 전역 변수에 저장 금지 — 함수 내부에서 매번 생성
- `types/database.ts`를 자동 생성 파일로 덮어쓰기 금지 — 수동 유지
- `--no-verify` 플래그로 git 훅 우회 금지 — Husky 훅 실패 시 원인 수정
- `components/tutorial/` 파일 수정 금지 — MVP 완성 후 전체 삭제 예정
