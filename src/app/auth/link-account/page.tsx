"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

export const dynamic = "force-dynamic";

function LinkAccountInner() {
  const router = useRouter();
  const qs = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const provider = qs.get("provider") || "소셜";
  const email = qs.get("email") || "";
  const identityId = qs.get("identity_id") || "";

  const providerNames: Record<string, string> = {
    kakao: "카카오",
    google: "구글",
  };

  const providerName = providerNames[provider] || provider;

  const handleLink = async () => {
    setLoading(true);
    // 이미 연동되어 있으므로 바로 진행
    router.replace("/tasks");
  };

  const handleCancel = async () => {
    setUnlinking(true);
    try {
      const supabase = createClient();

      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        router.replace("/login");
        return;
      }

      // identity 찾기
      const identity = user.identities?.find((id) => id.id === identityId);

      if (!identity) {
        console.error("Identity not found");
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.auth.unlinkIdentity(identity);

      if (error) {
        console.error("Failed to unlink identity:", error);
      } else {
        console.log("Identity unlinked successfully:", data);
      }

      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Cancel linking failed:", err);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-white px-5">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-7 w-7 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-center text-xl font-bold text-gray-900">계정 연동 확인</h1>

        <div className="mb-6 space-y-2 text-center text-sm text-gray-600">
          <p>
            이미 <strong className="text-gray-900">{email}</strong> 계정으로 가입되어 있습니다.
          </p>
          <p>
            <strong className="text-gray-900">{providerName} 계정</strong>과 연동하시겠습니까?
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <p className="font-bold">연동 시 변경사항</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>{providerName} 계정으로도 로그인 가능</li>
            <li>기존 데이터는 모두 유지됨</li>
            <li>하나의 계정으로 통합 관리</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={handleLink} disabled={loading || unlinking}>
            {loading ? <Spinner /> : "네, 연동할게요"}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={handleCancel}
            disabled={loading || unlinking}
          >
            {unlinking ? <Spinner /> : "아니요, 취소할게요"}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          취소하시면 {providerName} 로그인이 해제되고 로그인 페이지로 돌아갑니다.
        </p>
      </div>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-white">
          <p>처리 중…</p>
        </div>
      }
    >
      <LinkAccountInner />
    </Suspense>
  );
}
