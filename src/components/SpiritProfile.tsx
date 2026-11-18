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
    })();
    return () => {
      alive = false;
    };
  }, [name]);

  if (!configured) return <p className="text-base text-mist">Profiles aren&apos;t connected on this site yet.</p>;
  if (prof === undefined) return <Loader size={52} phrases={["Finding this spirit…"]} />;
  if (prof === null) {
    return (
      <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
        No spirit by that name. <Link href="/feed" className="underline underline-offset-4">Back to the garden</Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <Avatar id={prof.avatar} name={prof.display_name} size={96} label={`${prof.display_name}'s avatar`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl text-mist sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
            {prof.display_name}
          </h1>
          {me?.id === prof.id && (
            <Link href="/me" className="text-sm text-mist underline underline-offset-4">Edit my garden</Link>
          )}
        </div>
      </div>
      {prof.bio && (
        <p className="text-2xl leading-snug text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
          {prof.bio}
        </p>
      )}
      {posts.length === 0 ? (
        <p className="text-base text-sage">Nothing to show yet.</p>
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
