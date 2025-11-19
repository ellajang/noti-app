"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { EMAIL_RE, LOGIN_AUTH_MESSAGES } from "../constants/auth";
import { Spinner } from "@/components/ui/Spinner";
import SocialLoginButtons from "@/components/features/auth/SocialLoginButtons";
import { ROUTES } from "@/lib/constants/routes";
import { Input } from "@/components/ui/Input";

type ErrType = "format" | "credential" | "server" | "unconfirmed" | "";

function validateEmail(email: string) {
  return EMAIL_RE.test(email);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [errType, setErrType] = useState<ErrType>("");
  const router = useRouter();

  const raise = (type: ErrType, message: string) => {
    setErrType(type);
    setErrMsg(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    setErrType("");

    if (!validateEmail(email)) {
      raise("format", LOGIN_AUTH_MESSAGES.emailFormat);
      setLoading(false);
      return;
    }
    if (!password) {
      raise("credential", LOGIN_AUTH_MESSAGES.passwordEmpty);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const code = error.code || "";
        const raw = (error.message || "").toLowerCase();
        const isCredential =
          error.status === 400 ||
          /invalid (login )?credentials/.test(raw) ||
          /invalid email or password/.test(raw);
        if (code === "email_not_confirmed") {
          raise("unconfirmed", "계정을 사용하려면 이메일 인증을 먼저 완료해 주세요.");
          setLoading(false);
          return;
        }
        if (isCredential) {
          raise("credential", LOGIN_AUTH_MESSAGES.credential);
        } else {
          raise("server", LOGIN_AUTH_MESSAGES.server);
        }
        setLoading(false);
        return;
      }
      if (data?.user) {
        // 성공 시 페이지 전환될 때까지 spinner 유지
        router.push(ROUTES.DASHBOARD);
      } else {
        raise("server", LOGIN_AUTH_MESSAGES.badResponse);
        setLoading(false);
      }
    } catch {
      raise("server", LOGIN_AUTH_MESSAGES.network);
      setLoading(false);
    }
  };

  // SNS 로그인 핸들러
  const snsSignIn = async (provider: "kakao" | "google") => {
    try {
      setErrMsg("");
      setErrType("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        raise("server", `${provider === "kakao" ? "카카오" : "구글"} 로그인에 실패했습니다. 다시 시도해 주세요.`);
      }
    } catch {
      raise("server", "SNS 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-5">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-emerald-500">NOTI</h1>
          <h2 className="text-[24px] font-bold tracking-tight text-gray-800">로그인</h2>
        </div>

        {/* 카드 */}
        <div className="rounded-2xl bg-white">
          {/* 폼 */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 이메일 */}
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errType === "format" ? errMsg : undefined}
            />

            {/* 비밀번호 */}
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errType === "credential" ? errMsg : undefined}
            />

            {/* 서버 에러 메시지 */}
            {errMsg && (errType === "server" || errType === "unconfirmed") && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  errType === "server"
                    ? "border border-amber-300 bg-amber-50 text-amber-800"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {errMsg}
              </div>
            )}

            <Button type="submit">{loading ? <Spinner /> : "로그인"}</Button>
          </form>

          {/* 보조 링크 라인 */}
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
            <Link href={ROUTES.ACCOUNT.FIND_ID} className="hover:underline">
              아이디 찾기
            </Link>
            <span className="text-gray-300">|</span>
            <Link href={ROUTES.ACCOUNT.FIND_PW} className="hover:underline">
              비밀번호 찾기
            </Link>
            <span className="text-gray-300">|</span>
            <Link href={ROUTES.SIGNUP} className="hover:underline">
              회원가입
            </Link>
          </div>

          {/* 구분선 + 캡션 */}
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="shrink-0 text-xs text-gray-500">SNS 계정으로 로그인</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* SNS 버튼 */}
          <div className="mt-4">
            <SocialLoginButtons type="login" onSocialLogin={snsSignIn} />
          </div>
        </div>
      </section>
    </main>
  );
}
