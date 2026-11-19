"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { POST_COLUMNS, getSupabase, type PostRow } from "@/lib/supabase";
import Loader from "./Loader";
import PostCard, { type Relation } from "./PostCard";
import { useAuth } from "./useAuth";

type Author = { avatar: string | null; bio: string };
type SpiritRow = { requester_id: string; addressee_id: string; status: "pending" | "accepted" };

export default function Feed({ limit = 30 }: { limit?: number }) {
  const { me, configured } = useAuth();
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [spirits, setSpirits] = useState<SpiritRow[]>([]);
  const [failed, setFailed] = useState(false);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [kind, setKind] = useState<"all" | "poem" | "story" | "quote">("all");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    let q = sb.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
    if (kind !== "all") q = q.eq("kind", kind);
    const { data, error } = await q;
    if (error) return setFailed(true);
    setPosts(data as PostRow[]);
    const ids = [...new Set((data as PostRow[]).map((x) => x.author_id))];
    if (ids.length) {
      const { data: ps } = await sb.from("profiles").select("id,avatar,bio").in("id", ids);
      setAuthors(Object.fromEntries((ps ?? []).map((r) => [r.id as string, { avatar: r.avatar as string | null, bio: (r.bio as string) ?? "" }])));
    }
    if (me) {
      const [l, s] = await Promise.all([
        sb.from("likes").select("post_id").eq("user_id", me.id),
        sb.from("spirits").select("requester_id,addressee_id,status"),
      ]);
      setLikes(new Set((l.data ?? []).map((r) => r.post_id as string)));
      setSpirits((s.data ?? []) as SpiritRow[]);
    }
  }, [me, limit, kind]);

  useEffect(() => {
    if (me !== undefined) void load();
  }, [me, load]);

  function relation(author: string): Relation {
    if (!me) return "none";
    const s = spirits.find(
      (x) => (x.requester_id === me.id && x.addressee_id === author) || (x.addressee_id === me.id && x.requester_id === author),
    );
    if (!s) return "none";
    if (s.status === "accepted") return "spirit";
    return s.requester_id === me.id ? "requested" : "incoming";
  }

  if (!configured) return null;
  if (failed) return <p className="text-base text-mist">The garden is quiet right now. Please try again soon.</p>;
  if (posts === null) return <Loader size={52} phrases={["Gathering poems…", "Walking the garden paths…"]} />;
  const chips = limit > 6 && (
    <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
      {(["all", "poem", "story", "quote"] as const).map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={kind === k}
          onClick={() => setKind(k)}
          className={`rounded-full border px-4 py-1.5 text-sm text-mist ${kind === k ? "border-glow bg-moss" : "border-stone"}`}
        >
          {k === "all" ? "All" : k === "poem" ? "Poems" : k === "story" ? "Stories" : "Quotes"}
        </button>
      ))}
    </div>
  );
  if (posts.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        {chips}
        <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
          Nothing here yet. <Link href="/poem" className="underline underline-offset-4">Write the first one.</Link>
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
    {chips}
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} me={me} liked={likes.has(p.id)} relation={relation(p.author_id)} author={authors[p.author_id]} onChange={load} />
      ))}
    </div>
    </div>
  );
}
