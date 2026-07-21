/**
 * Supabase Auth가 반환하는 영문 원문 에러 메시지를 한국어로 매핑한다.
 * login-form.tsx/sign-up-form.tsx는 error.message를 그대로 노출하고 있어
 * 나머지 한글 UI 사이에서 "Invalid login credentials" 같은 영문이 그대로 보이던 문제를 고친다.
 * 매핑에 없는 메시지는 원문 대신 안전한 기본 문구로 대체한다(알 수 없는 원문을 그대로 보여주지 않기 위함).
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않아요",
  "Email not confirmed": "이메일 인증이 필요해요. 받은 편지함을 확인해주세요",
  "User already registered": "이미 가입된 이메일이에요",
};

export function mapAuthErrorMessage(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? "로그인 중 오류가 발생했어요";
}
