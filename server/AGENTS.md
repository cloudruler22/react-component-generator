# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시 서버. `index.ts`가 HTTP 라우팅과 외부 API 호출을, `generator.ts`/`fallback.ts`가 테스트 가능한 순수 로직을 담당한다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). Express 등 별도 HTTP 프레임워크를 추가하지 않는다.
- 외부 호출은 전역 `fetch`만 사용한다 (`index.ts:69,101`). Anthropic/Google SDK나 axios를 추가하지 않는다.
- 서버 파일은 `bun --watch run server/index.ts`로 실행되며 (`package.json` scripts.server), 테스트는 루트의 vitest(jsdom 환경)가 `server/**/*.test.ts`를 실행한다.

## Implementation Patterns

- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`). 새 라우트의 성공/에러 응답과 `OPTIONS` 처리 모두 포함한다.
- 에러 매핑은 `catch` 블록에서 메시지 문자열 포함 여부(`'503'`, `'429'`)로 판별한다 (`index.ts:194,201`). 그래서 프로바이더 에러는 `Error('... API error: ${status}')` 형식을 유지해야 한다.
- 모델 폴백은 `withModelFallback(models, attempt)`를 사용한다. 모델 목록은 우선순위 순서이며 상수로 파일 상단에 둔다 (`index.ts:5`).
- 새 순수 함수는 `generator.ts`에, 같은 이름의 `*.test.ts`와 함께 추가한다.

## Testing Strategy

- 실행: `bun run test server/` 또는 `bun run test server/fallback.test.ts`.
- 테스트는 `describe`/`it` 한국어 설명 패턴을 따른다 (`generator.test.ts`).
- `index.ts`는 import 시 `Bun.serve`가 실행되어 테스트에서 import할 수 없다. 테스트가 필요한 로직은 별도 모듈로 분리한다.

## Local Golden Rules

- Do: Gemini 호출 결과가 `finishReason === 'MAX_TOKENS'`이면 에러로 처리한다 (`index.ts:123`). 잘린 코드는 미리보기를 깨뜨린다.
- Do: `withModelFallback`은 모든 모델 실패 시 마지막 에러를 던진다 (`fallback.ts:19`). 호출부는 이 에러를 그대로 상위 `catch`로 전달한다.
- Don't: `/api/config`에 키 값을 반환하지 않는다 (`index.ts:148-156`, boolean만).
- Don't: 요청 본문의 `apiKey`, Gemini URL(키가 쿼리에 포함, `index.ts:99`)을 `console.log`나 에러 메시지에 포함하지 않는다.
- Don't: 서버 에러 응답 형식 `{ error: string }`을 바꾸지 않는다. 프론트엔드가 `data.error`로 읽는다 (`src/hooks/useComponentGenerator.ts:32`).
