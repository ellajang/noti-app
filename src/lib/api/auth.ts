import { createClient } from "@/lib/supabase/client";
import { translateSupabaseAuthError } from "@/lib/errors/translateSupabaseAuthError";
import type { Provider, User } from "@supabase/supabase-js";

/**
 * 회원가입 입력 타입
 */
export type SignUpInput = {
  email: string;
  password: string;
  nickname: string;
  fullName: string;
  birth: string;
};

/**
 * 회원가입 결과 타입
 */
export type SignUpResult = {
  user: User | null;
  needsEmailConfirm: boolean;
};

/**
 * 로그인 입력 타입
 */
export type SignInInput = {
  email: string;
  password: string;
};

/**
 * 이메일/비밀번호 회원가입
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const supabase = createClient();
  const { email, password, nickname, fullName, birth } = input;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, full_name: fullName, birth },
      emailRedirectTo:
        typeof window !== "undefined" ? `${location.origin}/auth/callback` : undefined,
    },
  });

  if (error) throw new Error(translateSupabaseAuthError(error));

  const user = data.user;
  const hasSession = !!data.session;

  // 세션이 있으면 profiles 테이블 업데이트
  if (hasSession && user) {
    const { error: updErr } = await supabase.from("profiles").update({ birth }).eq("id", user.id);
    if (updErr) console.warn("profiles.birth 업데이트 보류:", updErr.message);
  }

  return { user, needsEmailConfirm: !hasSession };
}

/**
 * 이메일/비밀번호 로그인
 */
export async function signIn(input: SignInInput) {
  const supabase = createClient();
  const { email, password } = input;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

/**
 * OAuth 로그인 (카카오, 구글)
 */
export async function signInWithOAuth(provider: Provider) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: typeof window !== "undefined" ? `${location.origin}/auth/callback` : undefined,
    },
  });

  if (error) throw error;
}

/**
 * 이메일 중복 확인
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  const res = await fetch(`/api/user/check-id?email=${encodeURIComponent(email)}`, {
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.message || `중복 확인 실패 (HTTP ${res.status})`);
  }

  return !data?.exists; // exists가 false면 사용 가능
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}
