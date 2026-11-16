"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CARE_MESSAGE } from "@/lib/poem";
import type { Contrast } from "@/lib/styles";
import { useAuth } from "./useAuth";

const btn =
  "rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

/** Posts the current piece to the Sylph feed. */
export default function PostPanel({
  kind,
  title,
  text,
  template,
  font,
  contrast,
}: {
  kind: "poem" | "story" | "quote";
  title: string;
  text: string;
  template: string;
  font: string;
  contrast: Contrast;
}) {
  const { me, configured } = useAuth();
  const [visibility, setVisibility] = useState<"public" | "spirits">("public");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");

  async function post() {
    const sb = getSupabase();
    if (!sb || !me) return;
    setBusy(true);
    setMsg("");
    const { error } = await sb.from("posts").insert({
      author_id: me.id,
      kind,
      title: kind === "quote" ? "" : title.slice(0, 120),
      body: text.slice(0, 6000),
      template,
      font,
      contrast,
      visibility,
    });
    setBusy(false);
    if (!error) {
      setDone(true);
      return;
    }
    setMsg(error.message.includes("care_needed") ? CARE_MESSAGE : "Couldn't post just now. Please try again.");
  }

  if (!configured) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-stone pt-5">
      <p className="text-sm text-mist">Post to Sylph</p>
      {me === undefined ? null : me === null ? (
        <p className="text-base text-mist">
          <Link href="/login" target="_blank" className="underline underline-offset-4">
            Sign in or join
          </Link>{" "}
          in a new tab to post. Your piece will wait here.
        </p>
      ) : me.needsSetup ? (
        <p className="text-base text-mist">
          <Link href="/login?next=/feed" target="_blank" className="underline underline-offset-4">
            Finish setting up your account
          </Link>{" "}
          in a new tab to post.
        </p>
      ) : done ? (
        <p className="text-base text-mist" role="status">
          Posted as {me.name}.{" "}
          <Link href="/feed" className="underline underline-offset-4">
            See the feed
          </Link>
        </p>
      ) : (
        <>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Who can see this post</legend>
            {(
              [
                ["public", "Everyone"],
                ["spirits", "My spirits only"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={visibility === v}
                onClick={() => setVisibility(v)}
                className={`rounded-full border px-4 py-2 text-sm text-mist ${visibility === v ? "border-glow bg-moss" : "border-stone"}`}
              >
                {label}
              </button>
            ))}
          </fieldset>
          <div>
            <button type="button" className={btn} disabled={busy || !text.trim()} onClick={post}>
              {busy ? "Posting…" : "Post to Sylph"}
            </button>
          </div>
          <p className="text-sm text-sage">Posting as {me.name}. Your real name and email stay private.</p>
        </>
      )}
      {msg && (
        <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">
          {msg}
        </p>
      )}
    </div>
  );
}
