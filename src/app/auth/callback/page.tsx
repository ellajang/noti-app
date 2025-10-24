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

      // URL 해시에서 type 확인 (Supabase가 #type=recovery로 전달)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashType = hashParams.get("type");

      // 디버깅 로그
      console.log("Callback Debug:", {
        queryType: type,
        hashType: hashType,
        fullHash: hash,
        fullURL: window.location.href,
      });

      if (err || errCode) {
        router.replace(
          `/auth/verified?status=fail${
            errCode ? `&reason=${encodeURIComponent(errCode)}` : ""
          }${errDesc ? `&message=${encodeURIComponent(errDesc)}` : ""}`,
        );
        return;
      }

      // 비밀번호 재설정 콜백인 경우 (쿼리 또는 해시에서)
      if (type === "recovery" || hashType === "recovery") {
        console.log("Redirecting to reset-password page");
        router.replace("/account/reset-password");
        setChecking(false);
        return;
      }

      // 소셜 로그인 콜백인지 확인 (세션이 있는지 체크)
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
        router.replace("/tasks");
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
