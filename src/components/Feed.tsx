"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { POST_COLUMNS, getSupabase, type PostRow } from "@/lib/supabase";
import { fetchReactions, type Reacts } from "@/lib/reactions";
import Loader from "./Loader";
import PostCard, { type Relation } from "./PostCard";
import { useAuth } from "./useAuth";

type Author = { avatar: string | null; bio: string };
type SpiritRow = { requester_id: string; addressee_id: string; status: "pending" | "accepted" };
type Kind = "all" | "poem" | "story" | "quote";

const KIND_LABEL: Record<Kind, string> = { all: "All", poem: "Poems", story: "Stories", quote: "Quotes" };

export default function Feed({ limit = 30 }: { limit?: number }) {
  const { me, configured } = useAuth();
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [spirits, setSpirits] = useState<SpiritRow[]>([]);
  const [failed, setFailed] = useState(false);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [reacts, setReacts] = useState<Record<string, Reacts>>({});
  const [kind, setKind] = useState<Kind>("all");
  const [scope, setScope] = useState<"garden" | "spirits">("garden");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;

    let rows: SpiritRow[] = [];
    if (me) {
      const { data: s } = await sb.from("spirits").select("requester_id,addressee_id,status");
      rows = (s ?? []) as SpiritRow[];
      setSpirits(rows);
    }

    let q = sb.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
    if (kind !== "all") q = q.eq("kind", kind);
    if (scope === "spirits" && me) {
      const ids = new Set<string>([me.id]);
      for (const r of rows) {
        if (r.status !== "accepted") continue;
        ids.add(r.requester_id === me.id ? r.addressee_id : r.requester_id);
      }
      q = q.in("author_id", [...ids]);
    }
    const { data, error } = await q;
    if (error) return setFailed(true);
    const list = data as unknown as PostRow[];
    setPosts(list);

    const authorIds = [...new Set(list.map((x) => x.author_id))];
    if (authorIds.length) {
      const { data: ps } = await sb.from("profiles").select("id,avatar,bio").in("id", authorIds);
      setAuthors(Object.fromEntries((ps ?? []).map((r) => [r.id as string, { avatar: r.avatar as string | null, bio: (r.bio as string) ?? "" }])));
    }
    setReacts(await fetchReactions(list.map((x) => x.id)));
    if (me) {
      const { data: l } = await sb.from("likes").select("post_id").eq("user_id", me.id);
      setLikes(new Set((l ?? []).map((r) => r.post_id as string)));
    }
  }, [me, limit, kind, scope]);

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

  const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-sm text-mist ${on ? "border-glow bg-moss" : "border-stone"}`;
  const controls =
    limit > 6 ? (
      <div className="flex flex-col gap-3">
        {me && (
          <div role="group" aria-label="Whose posts" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={scope === "garden"} onClick={() => setScope("garden")} className={chip(scope === "garden")}>The garden</button>
            <button type="button" aria-pressed={scope === "spirits"} onClick={() => setScope("spirits")} className={chip(scope === "spirits")}>My spirits</button>
          </div>
        )}
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        {controls}
        <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
          {scope === "spirits" ? (
            "Nothing from your spirits yet. Find some in the garden and ask to be their spirit."
          ) : (
            <>
              Nothing here yet. <Link href="/poem" className="underline underline-offset-4">Write the first one.</Link>
            </>
          )}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {controls}
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} me={me} liked={likes.has(p.id)} relation={relation(p.author_id)} author={authors[p.author_id]} reacts={reacts[p.id]} onChange={load} />
        ))}
      </div>
    </div>
  );
}
