"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { POST_COLUMNS, getSupabase, type PostRow } from "@/lib/supabase";
import Avatar from "./Avatar";
import Loader from "./Loader";
import PostCard from "./PostCard";
import { useAuth } from "./useAuth";

type Prof = { id: string; display_name: string; avatar: string | null; bio: string };

export default function SpiritProfile({ name }: { name: string }) {
  const { me, configured } = useAuth();
  const [prof, setProf] = useState<Prof | null | undefined>(undefined);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [rel, setRel] = useState<"none" | "requested" | "incoming" | "spirit">("none");
  const [handle, setHandle] = useState<{ platform: string; handle: string } | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    (async () => {
      const safe = name.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data } = await sb.from("profiles").select("id,display_name,avatar,bio").ilike("display_name", safe).maybeSingle();
      if (!alive) return;
      if (!data) return setProf(null);
      setProf(data as Prof);
      const { data: ps } = await sb.from("posts").select(POST_COLUMNS).eq("author_id", data.id).order("created_at", { ascending: false }).limit(30);
      if (alive) setPosts((ps ?? []) as PostRow[]);
      if (me && me.id !== data.id) {
        const { data: sp } = await sb.from("spirits").select("requester_id,addressee_id,status");
        const row = (sp ?? []).find(
          (x) => (x.requester_id === me.id && x.addressee_id === data.id) || (x.addressee_id === me.id && x.requester_id === data.id),
        );
        if (alive) setRel(!row ? "none" : row.status === "accepted" ? "spirit" : row.requester_id === me.id ? "requested" : "incoming");
      }
    })();
    return () => {
      alive = false;
    };
  }, [name, me]);

  if (!configured) return <p className="text-base text-mist">Profiles aren&apos;t connected on this site yet.</p>;
  if (prof === undefined) return <Loader size={52} phrases={["Finding this spirit…"]} />;
  if (prof === null) {
    return (
      <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
        No spirit by that name. <Link href="/feed" className="underline underline-offset-4">Back to the garden</Link>
      </p>
    );
  }

  async function request() {
    const sb = getSupabase();
    if (!sb || !me || !prof) return setNote("Sign in to become a spirit.");
    const { error } = await sb.from("spirits").insert({ requester_id: me.id, addressee_id: prof.id });
    if (error && error.code !== "23505") return setNote("Couldn't send the request.");
    setRel("requested");
    setNote("Request sent. They'll see it in their spirits.");
  }

  async function showHandle() {
    const sb = getSupabase();
    if (!sb || !prof) return;
    const { data } = await sb.rpc("get_handle", { target: prof.id });
    const row = Array.isArray(data) ? data[0] : null;
    if (row) setHandle({ platform: row.platform, handle: row.handle });
    else setNote("They haven't shared a handle with their spirits.");
  }

  const isMe = me?.id === prof.id;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <Avatar id={prof.avatar} name={prof.display_name} size={96} label={`${prof.display_name}'s avatar`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl text-mist sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
            {prof.display_name}
          </h1>
          {isMe && <Link href="/me" className="text-sm text-mist underline underline-offset-4">Edit my garden</Link>}
        </div>
      </div>
      {!isMe && (
        <div className="flex flex-wrap items-center gap-3">
          {rel === "none" && (
            <button type="button" onClick={request} className="rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]">
              Become a spirit
            </button>
          )}
          {rel === "requested" && <span className="text-sm text-sage">Request sent</span>}
          {rel === "incoming" && <Link href="/me" className="rounded-full border border-stone px-4 py-2 text-sm text-mist">Wants to be your spirit</Link>}
          {rel === "spirit" && (
            <button type="button" onClick={showHandle} className="rounded-full border border-stone px-4 py-2 text-sm text-mist">Spirit ✦ Find them</button>
          )}
          {handle && (
            <a href={`https://${handle.platform === "instagram" ? "instagram.com" : "facebook.com"}/${handle.handle}`} target="_blank" rel="noopener noreferrer" className="text-base text-mist underline underline-offset-4">
              {handle.platform === "instagram" ? "Instagram" : "Facebook"}: {handle.handle}
            </a>
          )}
          {note && <span role="status" className="text-sm text-sage">{note}</span>}
        </div>
      )}
      {prof.bio && (
        <p className="text-2xl leading-snug text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
          {prof.bio}
        </p>
      )}
      {posts.length === 0 ? (
        <p className="rounded-2xl border border-stone bg-deep p-5 text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
          {isMe
            ? "You haven't posted anything yet."
            : rel === "spirit"
              ? "Nothing new here yet."
              : "This spirit's words are shared only with their spirits. Become one to read them."}
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} me={me} liked={false} relation="none" author={{ avatar: prof.avatar, bio: prof.bio }} onChange={() => undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
