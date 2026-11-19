"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { CARE_MESSAGE } from "@/lib/poem";
import type { Contrast } from "@/lib/styles";
import StyledCard from "./StyledCard";
import type { Me } from "./useAuth";

type Entry = {
  id: string;
  kind: "poem" | "story" | "quote";
  title: string;
  body: string;
  template: string;
  font: string;
  contrast: Contrast;
  created_at: string;
};

const btn =
  "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50";

/** The signed-in user's private journal of saved pieces. */
export default function JournalList({ me }: { me: NonNullable<Me> }) {
  const [items, setItems] = useState<Entry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("journal")
      .select("id,kind,title,body,template,font,contrast,created_at")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Entry[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    await getSupabase()?.from("journal").delete().eq("id", id);
    setOpen(null);
    void load();
  }

  async function post(e: Entry, visibility: "public" | "spirits") {
    const sb = getSupabase();
    if (!sb) return;
    setNote("");
    const { error } = await sb.from("posts").insert({
      author_id: me.id,
      kind: e.kind,
      title: e.title,
      body: e.body,
      template: e.template,
      font: e.font,
      contrast: e.contrast,
      visibility,
    });
    setNote(error ? (error.message.includes("care_needed") ? CARE_MESSAGE : "Couldn't post just now.") : "Posted to the garden.");
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="journal-h">
      <h3 id="journal-h" className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        My journal
      </h3>
      <p className="text-sm text-sage">Pieces you kept for yourself. Only you can see them.</p>
      {items === null ? (
        <p className="text-base text-sage">One moment…</p>
      ) : items.length === 0 ? (
        <p className="text-base text-sage">Nothing kept yet. After you write something, choose &ldquo;Keep in my journal&rdquo;.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((e) => {
            const isOpen = open === e.id;
            return (
              <li key={e.id} className="flex flex-col gap-3 rounded-2xl border border-stone bg-deep p-4">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  className="flex flex-col gap-1 text-left"
                >
                  <span className="text-lg font-semibold text-mist">{e.title || e.body.slice(0, 40) + (e.body.length > 40 ? "…" : "")}</span>
                  <span className="text-sm text-sage">
                    {e.kind} · {new Date(e.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </button>
                {isOpen && (
                  <>
                    <StyledCard title={e.title} text={e.body} kind={e.kind} template={e.template} font={e.font} contrast={e.contrast} compact />
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btn} onClick={() => post(e, "public")}>Post to everyone</button>
                      <button type="button" className={btn} onClick={() => post(e, "spirits")}>Post to spirits</button>
                      <button type="button" className={btn} onClick={() => remove(e.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {note && <p role="status" className="text-sm text-sage">{note}</p>}
    </section>
  );
}
