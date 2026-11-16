import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Touched daily by a Vercel cron so the free Supabase project never pauses. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, db: false });
  try {
    const r = await fetch(`${url}/rest/v1/posts?select=id&limit=1`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return NextResponse.json({ ok: r.ok, db: true });
  } catch {
    return NextResponse.json({ ok: false, db: true });
  }
}
