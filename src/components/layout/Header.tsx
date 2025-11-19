// src/components/Header.tsx
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Spinner } from "../ui/Spinner";

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const current = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) setUser(user);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  const goLogin = useCallback(() => {
    router.push(`/login?redirect=${encodeURIComponent(current)}`);
  }, [router, current]);

  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "";

  return (
    <header className="sticky top-0 z-50 w-full bg-emerald-500 shadow-md">
      <div className="flex h-16 w-full items-center justify-between px-6">
        <h1
          onClick={() => {
            if (user) {
              router.push("/dashboard");
            } else {
              router.push("/");
            }
          }}
          className="cursor-pointer text-2xl font-bold text-white select-none"
        >
          NOTI
        </h1>

        {/* 우측: 유저/버튼 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-white/90">{nickname}</span>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="h-9 rounded-md bg-white px-3 text-sm text-emerald-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                {loggingOut ? <Spinner /> : "로그아웃"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={goLogin}
              className="h-9 rounded-md bg-white px-3 text-xs text-emerald-600 transition-colors hover:bg-gray-100"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-16 w-full animate-pulse bg-gray-100" />}>
      <HeaderContent />
    </Suspense>
  );
}
