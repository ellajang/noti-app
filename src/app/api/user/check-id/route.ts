/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("email");
    if (!raw) {
      return NextResponse.json({ message: "email이 필요합니다." }, { status: 400 });
    }
    const email = raw.trim().toLowerCase();

    let exists = false;

    const maybeGetByEmail = (supabaseAdmin as any).auth?.admin?.getUserByEmail;

    if (typeof maybeGetByEmail === "function") {
      const { data, error } = await maybeGetByEmail.call(supabaseAdmin.auth.admin, email);
      if (error && !/not\s*found/i.test(error.message)) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
      exists = !!data?.user;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200, page: 1 });
      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
      exists = !!data.users?.some((u) => (u.email ?? "").toLowerCase() === email);
    }

    return NextResponse.json({ exists }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
