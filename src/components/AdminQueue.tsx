"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CREATOR_ID } from "@/lib/avatars";
import type { Contrast } from "@/lib/styles";
import StyledCard from "./StyledCard";
import { useAuth } from "./useAuth";

type Item = {
  id: string;
  author_id: string;
  author_name: string;
  kind: "poem" | "story" | "quote";
  title: string;
  body: string;
  visibility: "public" | "spirits";
  report_count: number;
  hidden: boolean;
  created_at: string;
};

const btn =
  "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50";

/** The garden keeper's list of reported and hidden posts. Only the creator can open it. */
export default function AdminQueue() {
  const { me, configured } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [sure, setSure] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data, error: err } = await sb.rpc("admin_queue");
    if (err) return setError("Couldn't load the queue.");
    setItems((data ?? []) as Item[]);
  }, []);

  useEffect(() => {
    if (me?.id === CREATOR_ID) void load();
  }, [me, load]);

  async function review(id: string, action: "restore" | "hide" | "delete") {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(id);
    setError("");
    const { error: err } = await sb.rpc("admin_review", { pid: id, action });
    setBusy(null);
    setSure(null);
    if (err) return setError("That didn't go through. Please try again.");
    void load();
  }

  if (!configured) return <p className="text-base text-mist">Accounts aren&apos;t connected on this site yet.</p>;
  if (me === undefined) return <p className="text-base text-sage">One moment…</p>;
  if (me?.id !== CREATOR_ID) {
    return (
      <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>
        This corner is only for the garden keeper. <Link href="/" className="underline underline-offset-4">Back home</Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-base text-mist">
        Posts with at least one report, and posts that were hidden. Three reports hide a post automatically. Reporters stay anonymous.
      </p>
      {error && <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">{error}</p>}
      {items === null ? (
        <p className="text-base text-sage">Loading the queue…</p>
      ) : items.length === 0 ? (
        <p className="text-xl text-mist" style={{ fontFamily: "var(--font-hand)" }}>Nothing reported. The garden is calm.</p>
      ) : (
        <ul className="flex flex-col gap-8">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-full border px-3 py-1 ${p.hidden ? "border-glow text-glow" : "border-stone text-mist"}`}>
                  {p.hidden ? "Hidden" : "Visible"}
                </span>
                <span className="rounded-full border border-stone px-3 py-1 text-mist">
                  {p.report_count} {p.report_count === 1 ? "report" : "reports"}
                </span>
                {p.visibility === "spirits" && <span className="rounded-full border border-stone px-3 py-1 text-mist">spirits only</span>}
                <Link href={`/spirit/${encodeURIComponent(p.author_name)}`} className="text-mist underline underline-offset-4">
                  {p.author_name}
                </Link>
                <span className="text-sage">{new Date(p.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
              </div>
              <StyledCard title={p.title} text={p.body} kind={p.kind} template="midnight" font="caveat" contrast={"normal" as Contrast} compact />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} disabled={busy === p.id} onClick={() => review(p.id, "restore")}>
                  Keep visible
                </button>
                {!p.hidden && (
                  <button type="button" className={btn} disabled={busy === p.id} onClick={() => review(p.id, "hide")}>
                    Hide
                  </button>
                )}
                {sure === p.id ? (
                  <>
                    <button type="button" className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-[#f1f3e8]" disabled={busy === p.id} onClick={() => review(p.id, "delete")}>
                      Yes, delete forever
                    </button>
                    <button type="button" className={btn} onClick={() => setSure(null)}>Cancel</button>
                  </>
                ) : (
                  <button type="button" className={btn} onClick={() => setSure(p.id)}>Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
