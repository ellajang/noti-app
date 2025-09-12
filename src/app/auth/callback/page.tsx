"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("session:", session);
      console.log("error:", error);
      if (error) {
        console.error("Session error:", error);
        router.replace("/login");
        return;
      }

      if (session) {
        router.replace("/tasks");
      } else {
        router.replace("/login");
      }
    };

    handleOAuthRedirect();
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>로그인 처리 중...</p>
    </div>
  );
}
