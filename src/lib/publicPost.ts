import { createClient } from "@supabase/supabase-js";
import { POST_COLUMNS, type PostRow } from "./supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server-side: one public post, or null (private, hidden, missing or malformed id). RLS decides what is visible. */
export async function getPublicPost(id: string): Promise<PostRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key || !UUID.test(id)) return null;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await sb.from("posts").select(POST_COLUMNS).eq("id", id).eq("visibility", "public").maybeSingle();
    return (data as PostRow | null) ?? null;
  } catch {
    return null;
  }
}

export function excerpt(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}
