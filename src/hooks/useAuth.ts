"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  signIn,
  signUp,
  signOut,
  signInWithOAuth,
  checkEmailAvailability,
  getCurrentUser,
  type SignInInput,
  type SignUpInput,
} from "@/lib/api/auth";
import { queryClient } from "@/lib/tanstack/queryClient";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type { Provider } from "@supabase/supabase-js";

/**
 * 현재 사용자 정보 조회
 */
export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5분
    retry: false,
  });
}

/**
 * 이메일/비밀번호 로그인
 */
export function useSignIn() {
  return useMutation({
    mutationFn: (input: SignInInput) => signIn(input),
  });
}

/**
 * 회원가입
 */
export function useSignUp() {
  return useMutation({
    mutationFn: (input: SignUpInput) => signUp(input),
  });
}

/**
 * 로그아웃
 */
export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/**
 * OAuth 로그인 (카카오, 구글)
 */
export function useOAuthSignIn() {
  return useMutation({
    mutationFn: (provider: Provider) => signInWithOAuth(provider),
  });
}

/**
 * 이메일 중복 확인
 */
export function useCheckEmail() {
  return useMutation({
    mutationFn: (email: string) => checkEmailAvailability(email),
  });
}
