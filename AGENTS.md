# AGENTS.md

## Operational Commands

- 패키지 관리자는 `bun` 고정 (`bun.lock` 존재). npm/yarn/pnpm 사용 금지.
- 설치: `bun install`
- 개발 (API 서버 + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (포트 3002)
- 전체 테스트: `bun run test` (vitest run, `src/**`와 `server/**` 모두 포함 — `vite.config.ts:20`)
- 단일 파일 테스트: `bun run test server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 및 타입 검사: `bun run build` (`tsc -b && vite build`)
- 작업 완료 전 `bun run lint`, `bun run test`, `bun run build` 순으로 통과 확인.

## Golden Rules

Immutable:

- API 키를 클라이언트 번들이나 `/api/config` 응답에 노출하지 않는다. 이 엔드포인트는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:148-156`).
- `.env`는 커밋하지 않는다 (`.gitignore:32`). 키 템플릿은 `.env.example`만 수정한다.
- Anthropic/Gemini 호출은 반드시 `server/index.ts`를 거친다. 프론트엔드가 외부 AI API를 직접 호출하지 않는다 (`src/hooks/useComponentGenerator.ts:23`은 `/api/generate`만 호출).

Do's & Don'ts:

- 생성 코드 후처리(`stripCodeFences`, `ensureRenderCall`)는 `server/generator.ts`의 순수 함수로 유지한다. `Bun.serve` 등 부수효과를 넣지 않는다 (파일 상단 주석, 테스트 가능성 유지).
- `LivePreview`는 `react-live`의 `noInline` 모드를 사용하므로 생성 코드에 `render(<Component />)` 호출이 필수다 (`src/components/LivePreview.tsx:14`, `server/generator.ts:12-23`). `noInline`을 제거하면 시스템 프롬프트와 `ensureRenderCall`도 함께 수정해야 한다.
- `SYSTEM_PROMPT`(`server/index.ts:7-49`)는 "import 금지, 인라인 스타일만, TypeScript 문법 금지, 끝에 render 호출"을 요구한다. 이는 react-live 런타임 제약이다. 이 규칙을 완화하려면 미리보기 동작을 먼저 확인한다.
- 프로바이더를 추가하면 `Provider` 타입이 두 곳에 중복 정의되어 있으므로 함께 수정한다: `server/index.ts:57`, `src/types/index.ts:1`.
- 사용자 대면 에러 메시지와 테스트 설명은 한국어로 작성한다 (`server/index.ts:196,203`, `server/*.test.ts`).

Team-specific (코드 근거):

- Asymmetry: Gemini 경로만 `withModelFallback`과 `MAX_TOKENS` 잘림 검사를 가진다 (`server/index.ts:5,123,135`). Anthropic 경로는 폴백이 없고 `max_tokens: 4096`이다 (`server/index.ts:78`). 한쪽을 수정할 때 다른 쪽에 같은 처리가 필요한지 판단한다.
- Test Boundary: 테스트가 있는 곳은 `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 테스트가 없는 곳은 `server/index.ts`(HTTP 라우팅, 외부 API 호출), `useComponentGenerator.ts`, `LivePreview.tsx`. 로직은 테스트 가능한 순수 함수로 분리해 `generator.ts`/`fallback.ts`에 두고, `index.ts`는 얇게 유지한다.
- Hard Constraint: Vite 프록시는 `/api`를 `localhost:3002`로 전달한다 (`vite.config.ts:8-13`). 서버 포트를 바꾸면 `server/index.ts:139`와 `vite.config.ts`를 동시에 수정한다.
- Double Defense: 응답 정규화가 서버(`ensureRenderCall`)와 시스템 프롬프트 두 곳에서 render 호출을 보장한다. 둘 중 하나만 제거하지 않는다.
- Security Boundary: 사용자가 UI에 입력한 `apiKey`는 요청 본문으로 서버에 전달되며 상태(`useState`)에만 보관한다 (`src/App.tsx:14`). localStorage 등에 영속화하지 않는다. Gemini 키는 URL 쿼리로 전달되므로 (`server/index.ts:99`) 해당 URL이나 `fetch` 에러 객체를 로그/응답에 그대로 노출하지 않는다.

## Project Context

- 프롬프트를 받아 AI가 React 컴포넌트를 생성하고 미리보기와 코드를 제공하는 웹 앱.
- Stack: React 19, TypeScript, Vite, Bun(API 서버), react-live, Vitest, Testing Library, ESLint.

## Standards & References

- 프로젝트 소개와 실행 방법은 `README.md` 참조.
- 커밋 메시지: Conventional Commits 접두사 + 한국어 설명 (예: `feat: 컴포넌트 생성기 프론트엔드 UI 추가`, `chore: ...`).
- 서버 코드 규칙은 `server/AGENTS.md` 참조.
- Maintenance Policy: 이 파일의 규칙과 코드가 어긋나면(파일·라인 근거가 바뀌었거나 규칙이 낡았을 때) 작업을 마치기 전에 업데이트를 제안한다.
