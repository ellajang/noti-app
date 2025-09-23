import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, fullName, birth } = await req.json();
    const emailNorm = (email || "").trim().toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm) ||
      typeof fullName !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birth || "")
    ) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", emailNorm)
      .eq("full_name", fullName.trim())
      .eq("birth", birth)
      .limit(1)
      .maybeSingle();

    const ok = NextResponse.json({ sent: true });

    if (!data) return ok;
    const SITE = process.env.NEXT_PUBLIC_SITE_URL!;
    const supabaseSrv = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await supabaseSrv.auth.resetPasswordForEmail(emailNorm, {
      redirectTo: `${SITE}/auth/callback?next=/reset-password`,
    });

    return ok;
  } catch {
    return NextResponse.json({ sent: true });
  }
}
