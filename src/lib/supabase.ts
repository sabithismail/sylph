import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser Supabase client, or null when the site has no Supabase settings. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export type PostRow = {
  id: string;
  author_id: string;
  author_name: string;
  kind: "poem" | "story" | "quote";
  title: string;
  body: string;
  template: string;
  font: string;
  contrast: "soft" | "normal" | "high";
  visibility: "public" | "spirits";
  like_count: number;
  created_at: string;
  edited_at: string | null;
};

export const POST_COLUMNS =
  "id,author_id,author_name,kind,title,body,template,font,contrast,visibility,like_count,created_at,edited_at";
