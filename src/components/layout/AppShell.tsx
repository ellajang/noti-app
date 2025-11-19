"use client";

import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants/routes";
import Header from "./Header";

const HIDE_HEADER_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.SIGNUP] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname
    ? (HIDE_HEADER_ROUTES as readonly string[]).includes(pathname)
    : false;

  // 헤더가 표시되는 페이지에서만 여백 추가
  const shouldAddPadding =
    !hideHeader && pathname && !pathname.startsWith("/auth/") && !pathname.startsWith("/account/");

  return (
    <div className="min-h-dvh bg-white text-gray-900">
      {!hideHeader && <Header />}
      <main className={shouldAddPadding ? "min-h-[calc(100dvh-4rem)]" : ""}>{children}</main>
    </div>
  );
}
