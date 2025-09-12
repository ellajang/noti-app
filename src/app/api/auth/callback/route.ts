import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = createServer();
    await (await supabase).auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/tasks", req.url));
}
