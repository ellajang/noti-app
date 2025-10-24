"use client";

import { usePathname } from "next/navigation";
import Header from "../common/Header";

const HIDE_HEADER_ROUTES = ["/", "/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = HIDE_HEADER_ROUTES.includes(pathname);

  // 헤더가 있는 경우와 없는 경우를 구분하여 인증 관련 페이지도 포함
  const isAuthPage = pathname?.startsWith("/auth/") || pathname?.startsWith("/account/");

  return (
    <div className="min-h-dvh bg-white text-gray-900">
      {!hideHeader && <Header />}
      <main className={hideHeader || isAuthPage ? "" : "min-h-[calc(100dvh-4rem)]"}>
        {children}
      </main>
    </div>
  );
}
