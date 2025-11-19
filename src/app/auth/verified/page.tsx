"use client";
import { Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function VerifiedInner() {
  const qs = useSearchParams();
  const router = useRouter();

  const status = qs.get("status");
  const type = qs.get("type");
  const reason = qs.get("reason");
  const message = qs.get("message");

  const isFail = status === "fail";
  const failMsg =
    reason === "otp_expired"
      ? "인증 링크가 만료되었어요. 새 링크로 다시 시도해 주세요."
      : message || "링크가 만료되었거나 이미 사용되었을 수 있어요.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="max-w-md p-6">
        {!isFail ? (
          <>
            <h1 className="mb-4 text-xl font-bold">인증이 완료되었습니다 : )</h1>
            <p className="mb-6 text-sm">
              {type === "recovery"
                ? "비밀번호 재설정 인증이 완료되었어요. 로그인 후 새 비밀번호를 사용하세요."
                : "이메일 인증이 완료되었어요. 이제 로그인할 수 있습니다."}
            </p>
            <Button fullWidth onClick={() => router.push(ROUTES.LOGIN)}>
              로그인하러 가기
            </Button>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-xl font-bold">인증에 실패했어요 :(</h1>
            <p className="mb-6 text-sm">{failMsg}</p>
            <Button fullWidth onClick={() => router.push(ROUTES.LOGIN)}>
              로그인으로 돌아가기
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p>처리 중…</p>
        </main>
      }
    >
      <VerifiedInner />
    </Suspense>
  );
}
