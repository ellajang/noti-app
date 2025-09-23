"use client";

import { translateSupabaseAuthError } from "@/lib/errors/translateSupabaseAuthError";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";

export type SignUpInput = {
  email: string;
  password: string;
  nickname: string;
  fullName: string;
  birth: string;
};

async function signUpAndInitProfile(input: SignUpInput) {
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

  if (hasSession && user) {
    const { error: updErr } = await supabase.from("profiles").update({ birth }).eq("id", user.id);
    if (updErr) console.warn("profiles.birth 업데이트 보류:", updErr.message);
  }

  return { user, needsEmailConfirm: !hasSession };
}

export function useSignUp() {
  return useMutation({ mutationFn: signUpAndInitProfile });
}
