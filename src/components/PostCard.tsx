"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabase, type PostRow } from "@/lib/supabase";
import { CREATOR_ID } from "@/lib/avatars";
import { CARE_MESSAGE } from "@/lib/poem";
import { REACTIONS, noReacts, type ReactionId, type Reacts } from "@/lib/reactions";
import StyledCard from "./StyledCard";
import Tilt from "./Tilt";
import Avatar from "./Avatar";
import OwnerMark from "./OwnerMark";
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
  reacts,
  onChange,
}: {
  post: PostRow;
  me: Me | undefined;
  liked: boolean;
  relation: Relation;
  author?: { avatar: string | null; bio: string };
  reacts?: Reacts;
  onChange: () => void;
}) {
  const [likes, setLikes] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(liked);
  const [note, setNote] = useState("");
  const [handle, setHandle] = useState<{ platform: string; handle: string } | null>(null);
  const mine = me?.id === post.author_id;

  // What is shown can change after an edit, so keep it in local state.
  const [view, setView] = useState({ title: post.title, body: post.body, edited: Boolean(post.edited_at) });
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [saving, setSaving] = useState(false);

  // Reactions beyond the heart
  const [rx, setRx] = useState<Reacts>(reacts ?? noReacts());
  const [rxOpen, setRxOpen] = useState(false);
  useEffect(() => {
    if (reacts) setRx(reacts);
  }, [reacts]);

  // Collapse long pieces behind "Read more"
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
  }, [editing]);
  const long = full > 300; // short pieces show in full
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

  async function react(kind: ReactionId) {
    const sb = getSupabase();
    if (!sb || !me) return void needLogin();
    const was = rx[kind].mine;
    const bump = (d: number) =>
      setRx((r) => ({ ...r, [kind]: { n: Math.max(0, r[kind].n + d), mine: d > 0 } }));
    bump(was ? -1 : 1);
    const { error } = was
      ? await sb.from("reactions").delete().eq("post_id", post.id).eq("user_id", me.id).eq("kind", kind)
      : await sb.from("reactions").insert({ post_id: post.id, user_id: me.id, kind });
    if (error && error.code !== "23505") {
      setRx((r) => ({ ...r, [kind]: { n: Math.max(0, r[kind].n + (was ? 1 : -1)), mine: was } }));
      setNote("Couldn't save that.");
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

  function startEdit() {
    setDraftTitle(view.title);
    setDraftBody(view.body);
    setNote("");
    setEditing(true);
  }

  async function saveEdit() {
    const sb = getSupabase();
    if (!sb || !mine) return;
    const body = draftBody.trim();
    if (!body) return setNote("A post can't be empty.");
    setSaving(true);
    setNote("");
    const { error } = await sb
      .from("posts")
      .update({ title: post.kind === "quote" ? "" : draftTitle.trim().slice(0, 120), body: body.slice(0, 6000) })
      .eq("id", post.id);
    setSaving(false);
    if (error) {
      setNote(error.message.includes("care_needed") ? CARE_MESSAGE : "Couldn't save the edit. Please try again.");
      return;
    }
    setView({ title: post.kind === "quote" ? "" : draftTitle.trim().slice(0, 120), body: body.slice(0, 6000), edited: true });
    setEditing(false);
    setOpen(false);
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
  const total = REACTIONS.reduce((n, r) => n + rx[r.id].n, 0);
  const used = REACTIONS.filter((r) => rx[r.id].n > 0);

  return (
    <article className="flex flex-col gap-2.5">
      {editing ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-glow bg-deep p-4">
          {post.kind !== "quote" && (
            <input
              aria-label="Title"
              value={draftTitle}
              maxLength={120}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full rounded-xl border border-stone bg-night px-4 py-2.5 text-lg text-mist"
            />
          )}
          <textarea
            aria-label="Your words"
            value={draftBody}
            maxLength={6000}
            rows={Math.min(14, Math.max(6, draftBody.split("\n").length + 1))}
            onChange={(e) => setDraftBody(e.target.value)}
            className="w-full resize-y rounded-xl border border-stone bg-night p-4 text-lg leading-relaxed text-mist"
            style={{ fontFamily: "var(--font-hand)", fontSize: "1.35rem" }}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveEdit} disabled={saving} className="rounded-full bg-moss px-5 py-2 text-sm font-semibold text-[#f1f3e8] disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving} className={act}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
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
                  <StyledCard title={view.title} text={view.body} kind={post.kind} template={post.template} font={post.font} contrast={post.contrast} compact />
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
        </>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Link href={`/spirit/${encodeURIComponent(post.author_name)}`} className="mr-1 flex max-w-[11rem] items-center gap-2 text-base text-mist">
          <Avatar id={author?.avatar} name={post.author_name} size={28} />
          <span className="truncate">{post.author_name}</span>
          {post.author_id === CREATOR_ID && <OwnerMark size={16} />}
          {post.visibility === "spirits" && <span className="ml-1 shrink-0 text-xs text-sage">spirits</span>}
        </Link>
        {view.edited && <span className="text-xs text-sage">edited</span>}
        <button type="button" className={act} onClick={like} aria-pressed={isLiked}>
          {isLiked ? "♥" : "♡"} {likes}
        </button>
        <button type="button" className={act} onClick={() => setRxOpen((v) => !v)} aria-expanded={rxOpen} aria-label="React with a feeling">
          {used.length ? used.map((r) => r.icon).join("") : "✦"}
          {total > 0 ? ` ${total}` : ""}
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
          <>
            {!editing && <button type="button" className={act} onClick={startEdit}>Edit</button>}
            <button type="button" className={act} onClick={remove}>Delete</button>
          </>
        ) : (
          <button type="button" className="px-1 py-1 text-sm text-sage underline underline-offset-4" onClick={report}>Report</button>
        )}
      </div>
      {rxOpen && (
        <div role="group" aria-label="Reactions" className="flex flex-wrap gap-1.5">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={rx[r.id].mine}
              onClick={() => react(r.id)}
              className={`rounded-full border px-3 py-1 text-sm text-mist ${rx[r.id].mine ? "border-glow bg-moss" : "border-stone"}`}
            >
              {r.icon} {r.label}
              {rx[r.id].n > 0 ? ` · ${rx[r.id].n}` : ""}
            </button>
          ))}
        </div>
      )}
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
