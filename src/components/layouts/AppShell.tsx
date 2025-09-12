"use client";

import { usePathname } from "next/navigation";
import Header from "../common/Header";

const HIDE_HEADER_ROUTES = ["/", "/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = HIDE_HEADER_ROUTES.includes(pathname);

  return (
    <div className="min-h-dvh bg-white text-gray-900">
      {!hideHeader && <Header />}
      <main>{children}</main>
    </div>
  );
}
