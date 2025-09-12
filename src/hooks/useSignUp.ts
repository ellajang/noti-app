"use client";

import { translateSupabaseAuthError } from "@/lib/errors/translateSupabaseAuthError";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";

export type SignUpInput = {
  email: string;
  password: string;
  nickname: string;
  fullName: string;
  birth: string; // YYYY-MM-DD
};

async function signUpAndInitProfile(input: SignUpInput) {
  const supabase = createClient();
  const { email, password, nickname, fullName, birth } = input;

  // 1) Auth 회원가입 + 메타데이터 전달 (트리거가 profiles 자동 생성)
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

  // 이메일 인증을 요구하는 설정이면 session이 없을 수 있음
  const user = data.user;
  const hasSession = !!data.session;

  // 2) 세션이 이미 있다면(바로 로그인된 경우) birth 반영 시도
  if (hasSession && user) {
    const { error: updErr } = await supabase.from("profiles").update({ birth }).eq("id", user.id);
    if (updErr) console.warn("profiles.birth 업데이트 보류:", updErr.message);
  }

  return { user, needsEmailConfirm: !hasSession };
}

export function useSignUp() {
  return useMutation({ mutationFn: signUpAndInitProfile });
}
