"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase, type PostRow } from "@/lib/supabase";
import StyledCard from "./StyledCard";
import Tilt from "./Tilt";
import type { Me } from "./useAuth";

export type Relation = "none" | "requested" | "incoming" | "spirit";

const act =
  "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50";

export default function PostCard({
  post,
  me,
  liked,
  relation,
  onChange,
}: {
  post: PostRow;
  me: Me | undefined;
  liked: boolean;
  relation: Relation;
  onChange: () => void;
}) {
  const [likes, setLikes] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(liked);
  const [note, setNote] = useState("");
  const [handle, setHandle] = useState<{ platform: string; handle: string } | null>(null);
  const mine = me?.id === post.author_id;
  const needLogin = () => {
    setNote("Sign in to do that.");
    return true;
  };

  async function like() {
    const sb = getSupabase();
    if (!sb || !me) return void needLogin();
    const next = !isLiked;
    setIsLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    const q = next
      ? sb.from("likes").insert({ post_id: post.id, user_id: me.id })
      : sb.from("likes").delete().eq("post_id", post.id).eq("user_id", me.id);
    const { error } = await q;
    if (error) {
      setIsLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    }
  }

  async function report() {
    const sb = getSupabase();
    if (!sb || !me) return void needLogin();
    const { error } = await sb.from("reports").insert({ post_id: post.id, reporter_id: me.id });
    setNote(error && error.code !== "23505" ? "Couldn't send the report." : "Thank you. We'll look at it.");
  }

  async function remove() {
    const sb = getSupabase();
    if (!sb || !mine) return;
    const { error } = await sb.from("posts").delete().eq("id", post.id);
    if (error) setNote("Couldn't delete it.");
    else onChange();
  }

  async function request() {
    const sb = getSupabase();
    if (!sb || !me) return void needLogin();
    const { error } = await sb.from("spirits").insert({ requester_id: me.id, addressee_id: post.author_id });
    if (error && error.code !== "23505") setNote("Couldn't send the request.");
    else {
      setNote("Request sent. They'll see it in their spirits.");
      onChange();
    }
  }

  async function showHandle() {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.rpc("get_handle", { target: post.author_id });
    const row = Array.isArray(data) ? data[0] : null;
    if (row) setHandle({ platform: row.platform, handle: row.handle });
    else setNote("They haven't shared a handle with their spirits.");
  }

  const link = handle
    ? `https://${handle.platform === "instagram" ? "instagram.com" : "facebook.com"}/${handle.handle}`
    : "";

  return (
    <article className="flex flex-col gap-3">
      <Tilt className="rounded-3xl" max={5}>
        <StyledCard title={post.title} text={post.body} kind={post.kind} template={post.template} font={post.font} contrast={post.contrast} compact />
      </Tilt>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-base text-mist">
          {post.author_name}
          {post.visibility === "spirits" && <span className="ml-2 text-sm text-sage">spirits only</span>}
        </span>
        <button type="button" className={act} onClick={like} aria-pressed={isLiked}>
          {isLiked ? "♥" : "♡"} {likes}
        </button>
        {!mine && relation === "none" && (
          <button type="button" className={act} onClick={request}>Become a spirit</button>
        )}
        {!mine && relation === "requested" && <span className="text-sm text-sage">Request sent</span>}
        {!mine && relation === "incoming" && (
          <Link href="/me" className={act}>Wants to be your spirit</Link>
        )}
        {!mine && relation === "spirit" && (
          <button type="button" className={act} onClick={showHandle}>Spirit ✦ Find them</button>
        )}
        {mine ? (
          <button type="button" className={act} onClick={remove}>Delete</button>
        ) : (
          <button type="button" className={act} onClick={report}>Report</button>
        )}
      </div>
      {handle && (
        <p className="text-base text-mist">
          {handle.platform === "instagram" ? "Instagram" : "Facebook"}:{" "}
          <a href={link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {handle.handle}
          </a>
        </p>
      )}
      {note && <p className="text-sm text-sage" role="status">{note}</p>}
    </article>
  );
}
