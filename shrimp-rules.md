# Development Guidelines — Gather (Next.js + Supabase)

## 1. Project Overview

- **서비스**: 초대 링크 기반 소규모(5~30명) 일회성 이벤트 관리 플랫폼
- **스택**: Next.js 15 App Router · TypeScript · Supabase (Auth/DB/Storage/Realtime) · Tailwind CSS v3 · shadcn/ui (new-york) · next-themes
- **PRD 위치**: `docs/PRD.md` — 기능 추가 전 반드시 참조
- **로드맵 위치**: `docs/ROADMAP.md` — 현재 Phase 2 (더미 데이터 기반 UI/UX 완성) 진행 중

---

## 2. Project Architecture

```
app/
  auth/                      # 인증 관련 (login, sign-up, sign-up-success, forgot-password,
                              # update-password, error, confirm/route.ts, callback/route.ts)
  (main)/                    # 모바일 메인 라우트 그룹 (BottomNav 포함 레이아웃)
    layout.tsx                # max-w-md 모바일 컨테이너 + BottomNav
    events/page.tsx
    events/new/page.tsx
    events/[id]/page.tsx
    events/[id]/edit/page.tsx
    profile/page.tsx
  admin/
    login/page.tsx            # 사이드바 없는 독립 로그인 페이지
    (dashboard)/               # AdminSidebar 포함 레이아웃
      layout.tsx
      dashboard/page.tsx
      events/page.tsx
      users/page.tsx
      analytics/page.tsx
  join/[invite_code]/page.tsx # 초대 링크 참여 페이지 (독립, 내비게이션 없음)
components/
  ui/                        # shadcn/ui 컴포넌트만 위치 (직접 편집 금지)
  navigation/                # 하단 내비게이션 등 네비게이션 도메인
  admin/                     # 관리자 사이드바 등 admin 도메인
  events/                    # 이벤트 카드/배지/스켈레톤 등 이벤트 도메인
  participants/              # 참여자 카드/스켈레톤 등 참여자 도메인
  tutorial/                  # MVP 완성 후 삭제 예정 임시 컴포넌트
  *.tsx                      # 도메인 무관 컴포넌트는 루트 평면 파일 (hero.tsx, theme-switcher.tsx,
                              # login-form.tsx, user-avatar.tsx, empty-state.tsx 등)
lib/
  supabase/
    client.ts                # 브라우저(클라이언트 컴포넌트) 전용
    server.ts                # 서버 컴포넌트·Route Handler 전용
    proxy.ts                 # 미들웨어(proxy.ts) 전용
  dummy-data/                 # Phase 2 더미 데이터 (users.ts, events.ts, participants.ts,
                              # helpers.ts, index.ts) — Task 007+ 실제 DB 연동 전까지 사용
  utils.ts                   # cn(), hasEnvVars
types/
  database.ts                # Supabase DB 타입 수동 정의 (현재 profiles만 보유,
                              # Supabase 클라이언트 제네릭 파라미터용)
  user.ts / event.ts / participant.ts / api.ts / filter.ts  # 프론트엔드 도메인 타입
  index.ts                   # 위 도메인 타입 barrel export
hooks/                       # 커스텀 훅 필요 시에만 생성 (현재 미생성)
proxy.ts                     # Next.js 미들웨어 진입점 (middleware.ts 아님)
docs/
  PRD.md / ROADMAP.md / LEANCANVAS.md
  guides/                    # component-patterns.md, styling-guide.md, forms-react-hook-form.md 등
```

---

## 3. Critical File Rules

### 미들웨어 파일

- **진입점은 `proxy.ts` (루트)**. `middleware.ts` 파일을 생성하지 않는다.
- 라우트 보호 로직은 `lib/supabase/proxy.ts`의 `updateSession()`에만 작성한다.
- **현재 보호 규칙**: `/`, `/login`, `/auth/*` 외 모든 경로 → 비로그인 시 `/auth/login` 리다이렉트.
- `/join/*`은 아직 비로그인 예외 처리가 되어 있지 않다 — 추가 시 `updateSession()`의 조건문에 `!request.nextUrl.pathname.startsWith("/join")`을 포함시킨다.
- `/admin/*` role 체크 로직은 아직 없다 — 추가 시 `updateSession()`에서 `user`의 role claim을 확인하고 `admin`이 아니면 `/admin/login`으로 리다이렉트한다 (단, `/admin/login` 자체는 예외 처리하여 무한 리다이렉트를 방지한다).

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

- **`types/database.ts`는 Supabase 테이블의 Row/Insert/Update 타입만 정의한다** (Supabase 클라이언트 제네릭 파라미터용). 현재 `profiles`만 존재.
- **프론트엔드에서 사용하는 도메인 타입(Event, User, EventParticipant 등)은 `types/database.ts`에 넣지 않고 `types/[도메인].ts`로 분리한다** (예: `types/event.ts`, `types/participant.ts`). 새 도메인 타입 추가 시 이 패턴을 따른다.
- 새 도메인 타입 파일은 반드시 `types/index.ts`에 `export * from "./[파일명]"`으로 재노출한다.
- `supabase gen types` 자동 생성 파일로 `types/database.ts`를 덮어쓰지 않는다.

---

## 4. Multi-File Coordination Rules

### 새 DB 테이블 추가 시 동시 수정 파일

1. `types/database.ts` — Row/Insert/Update 타입 추가
2. Supabase 대시보드 또는 마이그레이션 SQL 실행
3. RLS 정책 설정 확인
4. 해당 테이블을 프론트에서 쓰는 도메인 타입이 있다면 `types/[도메인].ts`도 함께 갱신

### 새 페이지 추가 시

1. 모바일 사용자 페이지는 `app/(main)/[경로]/page.tsx`, 관리자 페이지는 `app/admin/(dashboard)/[경로]/page.tsx`에 생성한다. 독립 페이지(내비게이션 없음)는 라우트 그룹 밖에 생성한다(`app/join/[invite_code]/page.tsx`, `app/admin/login/page.tsx`가 그 예).
2. 보호된 경로라면 `lib/supabase/proxy.ts`의 리다이렉트 조건 확인
3. 관리자 경로(`/admin/(dashboard)/*`)라면 role 체크 로직 추가 필요 여부 확인

### shadcn/ui 컴포넌트 추가 시

- `npx shadcn@latest add [컴포넌트명]` 명령어로만 추가한다.
- 추가된 파일은 `components/ui/`에 위치한다. **직접 편집하지 않는다.**
- `components.json`이 자동 업데이트된다.
- **Toast는 사용하지 않는다** — shadcn 레지스트리에서 deprecated 처리되어 `sonner`로 대체되었다. 알림이 필요하면 `npx shadcn@latest add sonner`로 설치하고 `sonner`의 `toast()` 함수를 직접 호출한다. 루트 레이아웃(`app/layout.tsx`)의 `<ThemeProvider>` 내부에 `<Toaster />`(`@/components/ui/sonner`)가 배선되어 있어야 동작한다.
- `Form` 컴포넌트 설치 시 `react-hook-form`, `zod`, `@hookform/resolvers`가 함께 설치된다 — 별도로 `npm install`하지 않는다.

### 도메인 컴포넌트 추가 시

- 특정 도메인(이벤트, 참여자 등)에 속하는 컴포넌트는 `components/[도메인]/` 하위에 kebab-case로 생성한다(예: `components/events/event-card.tsx`).
- 도메인에 속하지 않는 범용 컴포넌트는 `components/` 루트에 평면 파일로 생성한다(예: `components/user-avatar.tsx`).
- **`components/common/`, `components/shared/`, `components/misc/` 같은 의미 없는 폴더명을 만들지 않는다.**

### 더미 데이터 추가/수정 시

- `lib/dummy-data/` 하위에 관심사별 파일로 분리한다(`users.ts`, `events.ts`, `participants.ts`, `helpers.ts`).
- 조회/조합 함수는 `helpers.ts`에 작성하고 실제 DB 연동(Task 007+) 시 동일한 함수 시그니처를 유지한 채 내부만 비동기 쿼리로 교체할 수 있도록 이름을 짓는다(예: `getEventById`, `getMyHostedEvents`).
- 새로 추가한 더미 데이터/헬퍼는 반드시 `lib/dummy-data/index.ts`에서 재노출한다.
- 더미 이벤트의 `cover_image_url`에 외부 URL(picsum 등)을 사용하지 않는다 — `next.config.ts`에 `images.remotePatterns`가 설정되어 있지 않아 `next/image`가 에러를 낸다. 로컬 `public/` 자산을 사용하거나 `null`로 둔다.

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

- 서버 컴포넌트가 기본값. 클라이언트 상태/이벤트 핸들러가 필요할 때만 `'use client'` 추가.
- 순수 표시 컴포넌트(카드, 배지, 스켈레톤, 빈 상태 등)는 상호작용이 없는 한 반드시 Server Component로 작성한다. shadcn이 자동 생성하는 `components/ui/*.tsx`(avatar, dialog, select, sonner, form 등)에 이미 `"use client"` 경계가 있으므로, 이를 조합하는 상위 컴포넌트까지 `"use client"`로 만들 필요는 없다.
- className 병합은 반드시 `cn()` (`@/lib/utils`) 사용.
- 아이콘은 `lucide-react`만 사용한다 (개별 import, `size` prop으로 크기 지정, 기존 `bottom-nav.tsx`/`admin/sidebar.tsx` 관례상 16~22 범위).

### 스타일링

- **Tailwind CSS v3** 사용. `tailwind.config.ts`(다크모드: `class`, `tailwindcss-animate` 플러그인)와 `postcss.config.mjs`가 설정 진입점이다. 이 파일들을 삭제하거나 v4 방식(`@theme` 전용)으로 바꾸지 않는다.
- 색상 CSS 변수는 `app/globals.css`의 `:root`/`.dark` 블록에서 정의하며, `tailwind.config.ts`의 `theme.extend.colors`가 이를 참조한다. 새 시맨틱 색상 추가 시 두 파일을 함께 수정한다.
- 다크 모드: `next-themes`(`app/layout.tsx`의 `<ThemeProvider attribute="class">`) + Tailwind `dark:` 클래스 조합. 상태 강조색(배지 등)을 하드코딩할 때도 반드시 `dark:` variant를 짝지어 지정한다.

### Next.js 설정

- `next.config.ts`에 `cacheComponents: true`가 설정되어 있다 — 이 설정을 임의로 제거하지 않는다.
- 외부 이미지 도메인을 사용해야 하면 `next.config.ts`에 `images.remotePatterns`를 추가한다(현재 미설정).

---

## 6. Routing Patterns

### 인증 흐름

```
로그인 → Google OAuth → /auth/callback → /auth/confirm (OTP) → 목적지
```

- OAuth 콜백: `app/auth/callback/route.ts`
- OTP 처리: `app/auth/confirm/route.ts`

### 보호된 라우트

- 로그인 필수 페이지: `app/(main)/*` — `lib/supabase/proxy.ts`의 기본 리다이렉트 규칙으로 보호됨(비로그인 시 `/auth/login`)
- 관리자 전용: `app/admin/(dashboard)/*` — role 체크는 아직 `lib/supabase/proxy.ts`에 구현되어 있지 않다. 구현 시 각 페이지 서버 컴포넌트에서도 이중 검증한다.
- `app/admin/login`은 비로그인 접근을 항상 허용해야 하며, role 체크 로직 추가 시 무한 리다이렉트가 발생하지 않도록 예외 처리한다.

### 초대 링크

- 경로: `app/join/[invite_code]/page.tsx`
- 비로그인 사용자 허용 필요 (이벤트 미리보기 후 Google 로그인 유도) — 현재 `lib/supabase/proxy.ts`에 `/join/*` 예외 처리가 아직 없으므로, 이 경로에 대한 인증 플로우 작업 시 반드시 추가한다.

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

필수 환경 변수 (`.env.local`):

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
- shadcn `toast` 컴포넌트 설치/사용 금지 — deprecated. `sonner`를 사용한다
- `components/common/`, `components/shared/`, `components/misc/` 등 의미 없는 폴더명 생성 금지
- 프론트엔드 도메인 타입을 `types/database.ts`에 추가 금지 — `types/[도메인].ts`로 분리
- 더미 데이터의 `cover_image_url`에 외부 이미지 URL 사용 금지 — `next.config.ts`에 `images.remotePatterns` 미설정 상태이므로 로컬 자산 또는 `null` 사용
- `tailwind.config.ts`, `postcss.config.mjs` 삭제 금지 — 이 프로젝트는 Tailwind v3 파이프라인을 사용한다
- Supabase 클라이언트를 모듈 전역 변수에 저장 금지 — 함수 내부에서 매번 생성
- `types/database.ts`를 자동 생성 파일로 덮어쓰기 금지 — 수동 유지
- `--no-verify` 플래그로 git 훅 우회 금지 — Husky 훅 실패 시 원인 수정
- `components/tutorial/` 파일 수정 금지 — MVP 완성 후 전체 삭제 예정
