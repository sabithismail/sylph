"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabase, type PostRow } from "@/lib/supabase";
import StyledCard from "./StyledCard";
import Tilt from "./Tilt";
import Avatar from "./Avatar";
import OwnerMark from "./OwnerMark";
import { CREATOR_ID } from "@/lib/avatars";
import type { Me } from "./useAuth";

export type Relation = "none" | "requested" | "incoming" | "spirit";

const COLLAPSED = 150; // px of the card shown before "Read more"

const act =
  "rounded-full border border-stone px-3 py-1 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50";

export default function PostCard({
  post,
  me,
  liked,
  relation,
  author,
  onChange,
}: {
  post: PostRow;
  me: Me | undefined;
  liked: boolean;
  relation: Relation;
  author?: { avatar: string | null; bio: string };
  onChange: () => void;
}) {
  const [likes, setLikes] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(liked);
  const [note, setNote] = useState("");
  const [handle, setHandle] = useState<{ platform: string; handle: string } | null>(null);
  const mine = me?.id === post.author_id;
  const inner = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setFull(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const long = full > COLLAPSED + 40;
  const shut = long && !open;
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
    <article className="flex flex-col gap-2.5">
      <Tilt className="rounded-3xl" max={5}>
        <div className="relative">
          <div
            className="overflow-hidden rounded-3xl transition-[max-height] duration-500 ease-out motion-reduce:transition-none"
            style={{
              maxHeight: long ? (open ? full : COLLAPSED) : undefined,
              WebkitMaskImage: shut ? "linear-gradient(to bottom, #000 55%, transparent 100%)" : undefined,
              maskImage: shut ? "linear-gradient(to bottom, #000 55%, transparent 100%)" : undefined,
            }}
          >
            <div ref={inner}>
              <StyledCard title={post.title} text={post.body} kind={post.kind} template={post.template} font={post.font} contrast={post.contrast} compact />
            </div>
          </div>
          {shut && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={false}
              className="absolute bottom-2 right-3 rounded-full border border-glow bg-night/80 px-4 py-1.5 text-sm font-semibold text-glow backdrop-blur-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Read more ✦
            </button>
          )}
        </div>
      </Tilt>
      {long && open && (
        <button type="button" onClick={() => setOpen(false)} aria-expanded className="self-center text-sm text-sage underline underline-offset-4">
          Fold it back
        </button>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Link href={`/spirit/${encodeURIComponent(post.author_name)}`} className="mr-1 flex max-w-[11rem] items-center gap-2 text-base text-mist">
          <Avatar id={author?.avatar} name={post.author_name} size={28} />
          <span className="truncate">{post.author_name}</span>
          {post.author_id === CREATOR_ID && <OwnerMark size={16} />}
          {post.visibility === "spirits" && <span className="ml-1 shrink-0 text-xs text-sage">spirits</span>}
        </Link>
        <button type="button" className={act} onClick={like} aria-pressed={isLiked}>
          {isLiked ? "♥" : "♡"} {likes}
        </button>
        {!mine && relation === "none" && (
          <button type="button" className={act} onClick={request}>Be a spirit</button>
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
          <button type="button" className="px-1 py-1 text-sm text-sage underline underline-offset-4" onClick={report}>Report</button>
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
