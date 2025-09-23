import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const mask = (email: string) => email.replace(/^(.).+(@.*)$/, "$1***$2");

export async function POST(req: Request) {
  try {
    const { fullName, birth } = await req.json();

    if (typeof fullName !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birth || "")) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("full_name", fullName.trim())
      .eq("birth", birth)
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    if (!data) return NextResponse.json({ found: false });

    return NextResponse.json({ found: true, maskedEmail: mask(data.email) });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
