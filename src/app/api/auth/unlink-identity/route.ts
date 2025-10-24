import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { identityId } = await request.json();

    if (!identityId) {
      return NextResponse.json({ error: "Identity ID is required" }, { status: 400 });
    }

    const supabase = await createServer();

    // 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자의 identity 목록에서 해당 identity 찾기
    const identity = user.identities?.find((id) => id.id === identityId);

    if (!identity) {
      return NextResponse.json({ error: "Identity not found" }, { status: 404 });
    }

    // Supabase Auth API의 unlinkIdentity 사용
    const { data, error: unlinkError } = await supabase.auth.unlinkIdentity(identity);

    if (unlinkError) {
      console.error("Failed to unlink identity:", unlinkError);
      return NextResponse.json(
        { error: "Failed to unlink identity", details: unlinkError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in unlink-identity API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
