"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function AuthCallback() {
  const router = useRouter();
  const qs = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const err = qs.get("error");
      const errCode = qs.get("error_code");
      const errDesc = qs.get("error_description");
      const type = qs.get("type") || "signup";

      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashType = hashParams.get("type");

      if (err || errCode) {
        router.replace(
          `/auth/verified?status=fail${
            errCode ? `&reason=${encodeURIComponent(errCode)}` : ""
          }${errDesc ? `&message=${encodeURIComponent(errDesc)}` : ""}`,
        );
        return;
      }

      // Supabase 클라이언트 생성 (URL hash의 토큰 자동 처리)
      const supabase = createClient();

      // 1) 해시에서 토큰 추출
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let session = null;

      // 2) 해시에 토큰이 있으면 먼저 setSession 해주기
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("setSession error:", error);
        } else {
          session = data.session;
        }
      }

      // 3) 그래도 세션이 없으면 마지막으로 getSession 한 번 더
      if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }
      // 비밀번호 재설정 콜백인 경우 (쿼리 또는 해시에서)
      if (type === "recovery" || hashType === "recovery") {
        if (session) {
          router.replace("/account/reset-password");
        } else {
          router.replace("/account/find/pw?error=invalid_link");
        }
        setChecking(false);
        return;
      }

      if (session) {
        const user = session.user;
        const identities = user.identities || [];

        // 여러 identity가 있는지 확인 (계정 연동 시도)
        if (identities.length > 1) {
          // email identity와 oauth identity가 같이 있는지 확인
          const hasEmailIdentity = identities.some((id) => id.provider === "email");
          const oauthIdentities = identities.filter((id) => id.provider !== "email");

          if (hasEmailIdentity && oauthIdentities.length > 0) {
            // 가장 최근에 추가된 OAuth identity 찾기
            const sortedOAuth = [...oauthIdentities].sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            });
            const latestOAuth = sortedOAuth[0];

            // 최근 10초 이내에 생성된 identity면 계정 연동 시도로 간주
            if (latestOAuth.created_at) {
              const createdAt = new Date(latestOAuth.created_at);
              const now = new Date();
              const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

              if (diffSeconds < 10) {
                // 계정 연동 확인 페이지로
                const params = new URLSearchParams({
                  provider: latestOAuth.provider,
                  email: user.email || "",
                  identity_id: latestOAuth.id,
                });
                router.replace(`/auth/link-account?${params.toString()}`);
                setChecking(false);
                return;
              }
            }
          }
        }

        // 일반 소셜 로그인 성공 → 메인 페이지로
        router.replace("/dashboard");
      } else {
        // 세션이 없으면 이메일 인증 콜백 → verified 페이지로
        router.replace(`/auth/verified?status=ok&type=${encodeURIComponent(type)}`);
      }

      setChecking(false);
    };

    handleCallback();
  }, [qs, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>{checking ? "처리 중…" : "리다이렉트 중…"}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>처리 중…</p>
        </main>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
