"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function AuthCallback() {
  const router = useRouter();
  const qs = useSearchParams();

  useEffect(() => {
    const err = qs.get("error");
    const errCode = qs.get("error_code");
    const errDesc = qs.get("error_description");
    const type = qs.get("type") || "signup";

    if (err || errCode) {
      router.replace(
        `/auth/verified?status=fail${
          errCode ? `&reason=${encodeURIComponent(errCode)}` : ""
        }${errDesc ? `&message=${encodeURIComponent(errDesc)}` : ""}`,
      );
      return;
    }

    router.replace(`/auth/verified?status=ok&type=${encodeURIComponent(type)}`);
  }, [qs, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>처리 중…</p>
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
