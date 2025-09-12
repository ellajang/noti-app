import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parse = Body.safeParse(json);

  if (!parse.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { title, date, time } = parse.data;
  return NextResponse.json({ ok: true, title, date, time });
}
