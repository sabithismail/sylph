import { getSupabase } from "./supabase";

/** Which of these people have shared an Instagram/Facebook handle this visitor may see. */
export async function fetchFindable(ids: string[]): Promise<Set<string>> {
  const sb = getSupabase();
  if (!sb || ids.length === 0) return new Set();
  const { data } = await sb.rpc("handle_available", { ids: ids.slice(0, 100) });
  return new Set(((data ?? []) as { id: string }[]).map((r) => r.id));
}
