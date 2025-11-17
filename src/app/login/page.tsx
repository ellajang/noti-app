"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { RiKakaoTalkFill } from "react-icons/ri";
import Button from "@/components/common/Button";
import { EMAIL_RE, LOGIN_AUTH_MESSAGES } from "../constants/auth";
import { Spinner } from "@/components/common/Spinner";

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
  const supabase = createClient();

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
          return;
        }
        if (isCredential) {
          raise("credential", LOGIN_AUTH_MESSAGES.credential);
        } else {
          raise("server", LOGIN_AUTH_MESSAGES.server);
        }
        return;
      }
      if (data?.user) {
        router.push("/dashboard");
      } else {
        raise("server", LOGIN_AUTH_MESSAGES.badResponse);
      }
    } catch {
      raise("server", LOGIN_AUTH_MESSAGES.network);
    } finally {
      setLoading(false);
    }
  };

  // SNS 로그인 핸들러
  const snsSignIn = async (provider: "kakao" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  // 공통 인풋 스타일
  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[15px] outline-none ring-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-200 autofill:bg-white autofill:text-gray-900";
  const borderNormal = "border-gray-300 focus:border-emerald-500";
  const borderError = "border-red-400 focus:border-red-500 focus:ring-red-200";

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
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} ${errType === "format" ? borderError : borderNormal}`}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} ${errType === "credential" ? borderError : borderNormal}`}
              />
            </div>

            {/* 에러 메시지 */}
            {errMsg && (
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
            <Link href="/account/find/id" className="hover:underline">
              아이디 찾기
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/account/find/pw" className="hover:underline">
              비밀번호 찾기
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/signup" className="hover:underline">
              회원가입
            </Link>
          </div>

          {/* 구분선 + 캡션 */}
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="shrink-0 text-xs text-gray-500">SNS 계정으로 로그인</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* SNS 버튼 3종 */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* 카카오 */}
            <button
              type="button"
              onClick={() => snsSignIn("kakao")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-[#FEE500] hover:brightness-95"
              aria-label="카카오 로그인"
            >
              <RiKakaoTalkFill size={24} color="#3C1E1E" />
            </button>

            {/* 구글 */}
            <button
              type="button"
              onClick={() => snsSignIn("google")}
              aria-label="구글로 로그인"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 hover:brightness-95"
            >
              <Image src="/images/icons/google.svg" alt="" width={30} height={30} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
