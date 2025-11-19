import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants/routes";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 인증이 필요한 경로들 (로그인 안 하면 접근 불가)
  const protectedPaths = [
    ROUTES.DASHBOARD,
    ROUTES.TASKS.LIST,
    ROUTES.TASKS.ADD,
    ROUTES.ACCOUNT.SETTING,
  ];

  // 게스트 전용 경로들 (로그인 하면 접근 불가)
  const guestOnlyPaths = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.ACCOUNT.FIND_ID,
    ROUTES.ACCOUNT.FIND_PW,
  ];

  const isProtectedRoute = protectedPaths.some((path) => url.pathname.startsWith(path));
  const isGuestOnlyRoute = guestOnlyPaths.some((path) => url.pathname === path);

  // 로그인 안 한 사용자가 보호된 경로 접근 시 → 로그인 페이지로
  if (isProtectedRoute && !user) {
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // 로그인 한 사용자가 게스트 전용 경로 접근 시 → 대시보드로
  if (isGuestOnlyRoute && user) {
    url.pathname = ROUTES.DASHBOARD;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/account/find/:path*",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/account/setting/:path*",
  ],
};
