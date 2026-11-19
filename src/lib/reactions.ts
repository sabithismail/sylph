import { getSupabase } from "./supabase";

export const REACTIONS = [
  { id: "felt", label: "Felt this", icon: "🌙" },
  { id: "needed", label: "Needed this", icon: "🌱" },
  { id: "held", label: "Held me", icon: "🕯️" },
] as const;
export type ReactionId = (typeof REACTIONS)[number]["id"];
export type Reacts = Record<ReactionId, { n: number; mine: boolean }>;

export const noReacts = (): Reacts => ({
  felt: { n: 0, mine: false },
  needed: { n: 0, mine: false },
  held: { n: 0, mine: false },
});

/** Reaction counts for a set of posts the caller is allowed to see. */
export async function fetchReactions(ids: string[]): Promise<Record<string, Reacts>> {
  const sb = getSupabase();
  const out: Record<string, Reacts> = {};
  if (!sb || ids.length === 0) return out;
  const { data } = await sb.rpc("reaction_counts", { ids: ids.slice(0, 100) });
  for (const r of (data ?? []) as { post_id: string; kind: ReactionId; n: number; mine: boolean }[]) {
    (out[r.post_id] ??= noReacts())[r.kind] = { n: r.n, mine: r.mine };
  }
  return out;
}
