# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## 환경 변수

`.env.local` 파일에 아래 두 변수가 반드시 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`lib/utils.ts`의 `hasEnvVars`는 이 두 변수의 설정 여부를 확인하며, 미설정 시 홈페이지에서 튜토리얼 단계가 다르게 표시됩니다.

## 아키텍처 개요

### Supabase 클라이언트 구조

세 가지 컨텍스트에 맞는 클라이언트를 `lib/supabase/`에서 제공합니다:

- **`lib/supabase/client.ts`** — 브라우저(클라이언트 컴포넌트)용. `createBrowserClient` 사용.
- **`lib/supabase/server.ts`** — 서버 컴포넌트 및 Route Handler용. `createServerClient` + `next/headers`의 쿠키 사용. Fluid Compute 환경에서는 전역 변수에 저장하지 말고 함수 내에서 매번 새로 생성해야 합니다.
- **`lib/supabase/proxy.ts`** — Next.js 미들웨어(`proxy.ts`)용. 요청마다 세션을 갱신합니다.

### 미들웨어 (proxy.ts)

루트의 `proxy.ts`가 Next.js 미들웨어로 동작하며, 정적 파일/이미지를 제외한 모든 경로를 가로채 `lib/supabase/proxy.ts`의 `updateSession()`을 호출합니다. 이 함수는 비로그인 사용자가 `/` 또는 `/auth/*` 이외의 경로에 접근하면 `/auth/login`으로 리다이렉트합니다.

### 인증 흐름

```
로그인/회원가입 → 이메일 인증 → /auth/confirm (OTP 검증) → 목적지 리다이렉트
```

`app/auth/confirm/route.ts`의 GET 핸들러가 이메일 링크의 `token_hash`와 `type` 파라미터를 처리합니다.

인증 상태 확인에는 `getUser()` 대신 `getClaims()`를 사용합니다 (더 빠름).

### 타입 시스템

`types/database.ts`에 Supabase 데이터베이스 타입을 수동으로 정의합니다. 현재 `profiles` 테이블만 정의되어 있으며, 새 테이블 추가 시 이 파일에 타입을 추가해야 합니다. 모든 Supabase 클라이언트는 `createClient<Database>()`로 타입 파라미터를 전달받습니다.

### 컴포넌트

- `components/ui/` — shadcn/ui 기반 기본 UI 컴포넌트 (Button, Input, Card 등). `components.json`으로 관리.
- `components/tutorial/` — 초기 설정 안내용 튜토리얼 컴포넌트. 프로젝트 완성 후 제거 가능.
- `lib/utils.ts`의 `cn()` — clsx + tailwind-merge 조합 유틸리티. 모든 컴포넌트의 className 병합에 사용.
