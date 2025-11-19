// validation.ts의 EMAIL_REGEX를 re-export
export { EMAIL_REGEX as EMAIL_RE } from "@/lib/utils/validation";

export const LOGIN_AUTH_MESSAGES = {
  emailFormat: "올바른 이메일 주소를 입력해주세요.",
  passwordEmpty: "비밀번호를 입력해 주세요.",
  credential: "이메일 또는 비밀번호가 올바르지 않습니다.",
  unconfirmed: "계정을 사용하려면 이메일 인증을 먼저 완료해 주세요.",
  server: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  badResponse: "서버 응답이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.",
  network: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.",
} as const;
