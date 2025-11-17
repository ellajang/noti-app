"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Button from "@/components/common/Button";

export default function IntroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-center bg-white px-5 text-center">
      {/* 로고 */}
      <h1 className="mb-4 text-2xl font-bold text-emerald-500">NOTI</h1>

      {/* 메인 카피 */}
      <h2 className="text-2xl leading-snug font-bold text-gray-900">
        잊지 않게,
        <br />
        대신 챙겨줘.
      </h2>

      {/* 서브 카피 */}
      <p className="mt-4 mb-4 text-base text-sm leading-relaxed text-gray-600">
        공과금 납부, 약 복용, 중요한 일정 등 <br />
        놓치지 않도록 다른 사람에게 알림을 위임하거나, <br />
        실행 여부에 따라 다시 알려주는 <br />
        실행 중심 알림 앱입니다.
      </p>

      {/* 시작 버튼 */}
      <Button onClick={handleStart} disabled={loading}>
        {loading ? "확인 중..." : "시작하기"}
      </Button>
    </div>
  );
}
