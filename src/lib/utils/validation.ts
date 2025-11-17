/**
 * Validation 유틸리티 함수들
 */

// 이메일 정규식
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * 비밀번호 검증 (8자 이상)
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * 비밀번호 확인 일치 검증
 */
export function validatePasswordMatch(password: string, confirm: string): boolean {
  return password === confirm;
}

/**
 * 필수 입력 검증
 */
export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * 닉네임 검증 (2-20자)
 */
export function validateNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20;
}
