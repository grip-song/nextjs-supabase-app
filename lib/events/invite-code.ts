import { randomBytes } from "crypto";

const INVITE_CODE_LENGTH = 8;
// 혼동하기 쉬운 문자(0/O, 1/I/l 등) 없이 8자 코드를 만들기 위한 커스텀 알파벳 대신,
// events.invite_code 컬럼이 이미 "8자 고정, 영숫자"라는 것 외 다른 제약이 없으므로
// 대소문자+숫자 전체를 사용해 충돌 확률을 최소화한다.
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Postgres unique_violation 에러 코드 (events.invite_code UNIQUE 제약 위반 시 사용) */
export const UNIQUE_VIOLATION_CODE = "23505";

/** Node 내장 crypto로 8자리 영숫자 초대 코드를 생성한다. */
export function generateInviteCode(): string {
  const bytes = randomBytes(INVITE_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/**
 * 초대 코드 충돌(unique_violation) 시 재시도하는 헬퍼.
 * tryInsert는 새로 생성한 코드로 실제 insert를 시도하고 Postgrest 응답 형태
 * ({ data, error })를 반환해야 한다. error.code가 23505(unique_violation)가 아니면
 * 즉시 결과를 반환하고, 23505인 경우에만 새 코드로 재시도한다(최대 maxAttempts회).
 */
export async function withInviteCodeRetry<T>(
  tryInsert: (
    inviteCode: string,
  ) => Promise<{ data: T | null; error: { code?: string } | null }>,
  maxAttempts = 5,
): Promise<{ data: T | null; error: { code?: string } | null }> {
  let result: { data: T | null; error: { code?: string } | null } = {
    data: null,
    error: null,
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    result = await tryInsert(generateInviteCode());

    if (!result.error || result.error.code !== UNIQUE_VIOLATION_CODE) {
      return result;
    }
  }

  return result;
}
