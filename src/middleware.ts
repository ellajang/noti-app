import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 안 된 상태에서 /tasks 접근 → 로그인 페이지로 리다이렉트
  if (url.pathname.startsWith("/tasks") && !user) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*"],
};
