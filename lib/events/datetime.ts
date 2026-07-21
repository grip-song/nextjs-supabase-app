/**
 * <input type="datetime-local"> 값 <-> DB timestamptz(UTC) 간 변환.
 * 이 프로젝트는 한국 사용자만 대상으로 하고(DST 없음), 별도 타임존 선택 UI가 없으므로
 * "YYYY-MM-DDTHH:mm" 입력값은 항상 KST(UTC+9)로 고정 해석한다.
 */

/** datetime-local 입력값(KST 기준)을 DB에 저장할 UTC ISO 문자열로 변환한다. */
export function localInputToUtcIso(localDatetimeLocal: string): string {
  return new Date(`${localDatetimeLocal}:00+09:00`).toISOString();
}

/** DB의 UTC ISO 문자열을 datetime-local input이 요구하는 KST 기준 'YYYY-MM-DDTHH:mm'으로 변환한다. */
export function utcIsoToLocalInput(utcIso: string): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const shifted = new Date(new Date(utcIso).getTime() + KST_OFFSET_MS);
  return shifted.toISOString().slice(0, 16);
}

/**
 * event_date(UTC ISO)를 "(YYYY년) M월 D일 오전/오후 H:mm" 형식으로 표시용 포맷한다.
 * toLocaleString("ko-KR", ...)은 서버(Node ICU)와 클라이언트(브라우저 ICU)의 오전/오후 vs AM/PM
 * dayPeriod 표기가 달라져 React hydration mismatch를 일으키므로, 대신 UTC getter + 고정 KST(+9)
 * 오프셋으로 직접 계산해 환경에 관계없이 항상 동일한 문자열이 나오도록 한다.
 */
export function formatEventDateTime(
  isoDate: string,
  options?: { withYear?: boolean },
): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(new Date(isoDate).getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const period = kst.getUTCHours() < 12 ? "오전" : "오후";
  const hours = kst.getUTCHours() % 12 || 12;
  const minutes = String(kst.getUTCMinutes()).padStart(2, "0");

  const datePart = options?.withYear
    ? `${year}년 ${month}월 ${day}일`
    : `${month}월 ${day}일`;

  return `${datePart} ${period} ${hours}:${minutes}`;
}
