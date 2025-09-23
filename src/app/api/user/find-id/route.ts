import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function maskEmailFirst3Last(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const n = local.length;
  if (n <= 1) return `*@${domain}`;
  if (n === 2) return `${local[0]}*${local[1]}@${domain}`;
  if (n === 3) return `${local.slice(0, 2)}*${local[2]}@${domain}`;
  if (n === 4) return `${local.slice(0, 3)}*${local[3]}@${domain}`;

  // n >= 5 → abc***z@...
  return `${local.slice(0, 3)}${"*".repeat(n - 4)}${local[n - 1]}@${domain}`;
}

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
    if (!data?.email) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      maskedEmail: maskEmailFirst3Last(data.email),
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
