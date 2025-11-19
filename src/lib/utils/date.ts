/**
 * Date 유틸리티 함수들
 */

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export function formatToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns 오늘 날짜 (YYYY-MM-DD)
 */
export function getTodayYYYYMMDD(): string {
  return formatToYYYYMMDD(new Date());
}
