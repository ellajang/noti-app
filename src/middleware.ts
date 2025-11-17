import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (url.pathname.startsWith("/dashboard") && !user) {
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
