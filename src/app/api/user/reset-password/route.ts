import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const norm = (s: string) => (s || "").trim().toLowerCase();

export async function POST(req: Request) {
  try {
    const { email, fullName, birth } = await req.json();
    const emailNorm = norm(email);
    const nameTrim = (fullName || "").trim();

    if (!EMAIL_RE.test(emailNorm) || nameTrim.length < 2) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const hasBirth = typeof birth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(birth);

    // profiles에서 id 찾기 (full_name [+ birth])
    const sel = supabaseAdmin.from("profiles").select("id").eq("full_name", nameTrim).limit(1);

    const { data: profile } = hasBirth
      ? await sel.eq("birth", birth).maybeSingle()
      : await sel.maybeSingle();

    if (!profile) return NextResponse.json({ sent: true });

    // auth.users에서 공식 이메일 확인
    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const officialEmail = userRes?.user?.email?.toLowerCase();
    if (!officialEmail || officialEmail !== emailNorm) {
      return NextResponse.json({ sent: true });
    }

    // 재설정 메일 발송
    const SITE = process.env.NEXT_PUBLIC_SITE_URL!;
    console.log("SITE URL:", SITE);
    console.log("Redirect URL:", `${SITE}/auth/callback?type=recovery`);

    const srv = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await srv.auth.resetPasswordForEmail(emailNorm, {
      redirectTo: `${SITE}/auth/callback?type=recovery`,
    });

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ sent: true });
  }
}
