import type { AuthError, PostgrestError } from "@supabase/supabase-js";

type ErrorLike =
  | string
  | {
      code?: unknown;
      message?: unknown;
      error_description?: unknown;
      status?: unknown;
    }
  | AuthError
  | PostgrestError
  | unknown;

export function translateSupabaseAuthError(e: ErrorLike): string {
  const code = getCode(e);

  switch (code) {
    case "email_address_invalid":
      return "사용할 수 없는 이메일이에요. 실제 받는 메일 주소로 입력해 주세요.";
    case "email_address_not_authorized":
      return "이 프로젝트 설정상 해당 이메일로는 메일을 보낼 수 없어요. (SMTP 설정을 확인해 주세요)";
    case "email_exists":
    case "user_already_exists":
      return "이미 가입된 이메일이에요.";
    case "weak_password":
      return "비밀번호가 너무 약해요. 8자 이상으로 설정해 주세요.";
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 올바르지 않아요.";
    case "email_not_confirmed":
      return "계정을 사용하려면 이메일 인증을 먼저 완료해 주세요.";
    default: {
      const raw = getMessage(e).toLowerCase();
      if (/invalid.*email|email.*invalid/.test(raw)) {
        return "올바른 이메일 형식이 아니에요.";
      }
      return "문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
    }
  }
}

/** e에서 code를 안전하게 추출 */
function getCode(e: ErrorLike): string {
  if (typeof e === "string") return "";
  if (e && typeof e === "object" && "code" in e) {
    const val = (e as { code?: unknown }).code;
    if (typeof val === "string" || typeof val === "number") return String(val);
  }
  return "";
}

/** e에서 message / error_description을 안전하게 추출 */
function getMessage(e: ErrorLike): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;

  if (e && typeof e === "object") {
    const obj = e as { message?: unknown; error_description?: unknown };
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error_description === "string") return obj.error_description;
  }
  return "";
}
