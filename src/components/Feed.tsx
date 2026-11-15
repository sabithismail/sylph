"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { POST_COLUMNS, getSupabase, type PostRow } from "@/lib/supabase";
import PostCard, { type Relation } from "./PostCard";
import { useAuth } from "./useAuth";

type SpiritRow = { requester_id: string; addressee_id: string; status: "pending" | "accepted" };

export default function Feed({ limit = 30 }: { limit?: number }) {
  const { me, configured } = useAuth();
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [spirits, setSpirits] = useState<SpiritRow[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
    if (error) return setFailed(true);
    setPosts(data as PostRow[]);
    if (me) {
      const [l, s] = await Promise.all([
        sb.from("likes").select("post_id").eq("user_id", me.id),
        sb.from("spirits").select("requester_id,addressee_id,status"),
      ]);
      setLikes(new Set((l.data ?? []).map((r) => r.post_id as string)));
      setSpirits((s.data ?? []) as SpiritRow[]);
    }
  }, [me, limit]);

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
  if (posts === null) return <p className="text-base text-sage" role="status">Gathering poems…</p>;
  if (posts.length === 0) {
    return (
      <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
        Nothing here yet. <Link href="/poem" className="underline underline-offset-4">Write the first one.</Link>
      </p>
    );
  }
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} me={me} liked={likes.has(p.id)} relation={relation(p.author_id)} onChange={load} />
      ))}
    </div>
  );
}
