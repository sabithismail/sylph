"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import GardenPlant from "./GardenPlant";
import JournalList from "./JournalList";
import { AVATARS, CREATOR_ID, parseAvatar } from "@/lib/avatars";
import { CARE_MESSAGE } from "@/lib/poem";

type Row = { requester_id: string; addressee_id: string; status: "pending" | "accepted" };
type Prof = { id: string; display_name: string };

const field = "w-full rounded-xl border border-stone bg-night px-4 py-3 text-base text-mist placeholder:text-sage";
const btn = "rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

export default function Me() {
  const uid = useId();
  const { me, configured } = useAuth();
  const [platform, setPlatform] = useState<"" | "instagram" | "facebook">("");
  const [handle, setHandle] = useState("");
  const [vis, setVis] = useState<"private" | "spirits">("private");
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [confirm, setConfirm] = useState("");
  const [pic, setPic] = useState<string>(AVATARS[0]);
  const [bio, setBio] = useState("");
  const [pmsg, setPmsg] = useState("");
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !me) return;
    const { data: p } = await sb.rpc("my_profile");
    const mine = Array.isArray(p) ? p[0] : null;
    if (mine) {
      setPlatform(mine.handle_platform ?? "");
      setHandle(mine.handle ?? "");
      setVis(mine.handle_visibility ?? "private");
    }
    const { data: prof } = await sb.from("profiles").select("avatar,bio").eq("id", me.id).maybeSingle();
    setPic(parseAvatar(prof?.avatar, me.name));
    setBio(prof?.bio ?? "");
    const { data: s } = await sb.from("spirits").select("requester_id,addressee_id,status");
    const list = (s ?? []) as Row[];
    setRows(list);
    const ids = [...new Set(list.flatMap((r) => [r.requester_id, r.addressee_id]))].filter((i) => i !== me.id);
    if (ids.length) {
      const { data: ps } = await sb.from("profiles").select("id,display_name").in("id", ids);
      setNames(Object.fromEntries(((ps ?? []) as Prof[]).map((x) => [x.id, x.display_name])));
    }
  }, [me]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !me) return;
    const clean = handle.trim().replace(/^@/, "");
    if (clean && !/^[A-Za-z0-9._]{1,40}$/.test(clean)) return setMsg("Handles use letters, numbers, dots and underscores only.");
    if (clean && !platform) return setMsg("Choose Instagram or Facebook for that handle.");
    const { error } = await sb
      .from("profiles")
      .update({ handle_platform: clean ? platform : null, handle: clean || null, handle_visibility: vis })
      .eq("id", me.id);
    setMsg(error ? "Couldn't save. Please try again." : "Saved.");
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !me) return;
    const { error } = await sb.from("profiles").update({ avatar: pic, bio: bio.trim() }).eq("id", me.id);
    setPmsg(error ? (error.message.includes("care_needed") ? CARE_MESSAGE : "Couldn't save. Please try again.") : "Saved.");
  }

  async function accept(from: string) {
    await getSupabase()?.from("spirits").update({ status: "accepted" }).eq("requester_id", from).eq("addressee_id", me!.id);
    void load();
  }
  async function drop(a: string, b: string) {
    await getSupabase()?.from("spirits").delete().eq("requester_id", a).eq("addressee_id", b);
    void load();
  }

  if (!configured) return <p className="text-base text-mist">Accounts aren&apos;t connected on this site yet.</p>;
  if (me === undefined) return <p className="text-base text-sage">One moment…</p>;
  if (me === null) {
    return (
      <p className="text-base text-mist">
        <a href="/login?next=/me" className="underline underline-offset-4">Sign in</a> to see your garden.
      </p>
    );
  }

  const incoming = rows.filter((r) => r.addressee_id === me.id && r.status === "pending");
  const sent = rows.filter((r) => r.requester_id === me.id && r.status === "pending");
  const mine = rows.filter((r) => r.status === "accepted");
  const other = (r: Row) => (r.requester_id === me.id ? r.addressee_id : r.requester_id);
  const nm = (id: string) => names[id] ?? "A spirit";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-4xl text-mist sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
          {me.name}
        </h2>
        <button
          type="button"
          className={`${btn} mt-4`}
          onClick={async () => {
            await getSupabase()?.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </button>
      </div>

      {me.id === CREATOR_ID && (
        <a href="/admin" className="w-fit rounded-full border border-glow px-5 py-2.5 text-sm font-semibold text-glow">
          Garden keeper: review reports
        </a>
      )}

      <GardenPlant />

      <form data-tour="look" onSubmit={saveProfile} className="flex flex-col gap-4">
        <h3 className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Your look</h3>
        <div className="flex items-center gap-4">
          <Avatar id={pic} size={88} label="Your picture preview" />
          <p className="text-sm text-mist">Pick your picture. This is how spirits see you.</p>
        </div>
        <AvatarPicker value={pic} onChange={setPic} userId={me.id} />
        <label htmlFor={`${uid}-bio`} className="text-sm text-mist">Short bio (optional)</label>
        <textarea id={`${uid}-bio`} className={field} rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Writes to the moon. Collects rain sounds." />
        <p className="text-sm text-sage">{bio.length}/160. Everyone can see your avatar and bio.</p>
        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8]">Save look</button>
          <p className="text-sm text-sage" role="status" aria-live="polite">{pmsg}</p>
        </div>
      </form>

      <form data-tour="handle" onSubmit={save} className="flex flex-col gap-4">
        <h3 className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Where spirits can find you</h3>
        <p className="text-sm text-mist">Add an Instagram or Facebook handle if you want to be found. Nobody sees it unless you choose to share it, and then only your spirits do.</p>
        <div className="flex gap-2">
          {(["instagram", "facebook"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={platform === p} onClick={() => setPlatform(p)} className={`${btn} ${platform === p ? "border-glow bg-moss" : ""}`}>
              {p === "instagram" ? "Instagram" : "Facebook"}
            </button>
          ))}
        </div>
        <label htmlFor={`${uid}-h`} className="sr-only">Handle</label>
        <input id={`${uid}-h`} className={field} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your_handle" maxLength={41} />
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Who can see my handle</legend>
          {(
            [
              ["private", "Private"],
              ["spirits", "Visible to my spirits"],
            ] as const
          ).map(([v, label]) => (
            <button key={v} type="button" aria-pressed={vis === v} onClick={() => setVis(v)} className={`${btn} ${vis === v ? "border-glow bg-moss" : ""}`}>
              {label}
            </button>
          ))}
        </fieldset>
        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8]">Save</button>
          <p className="text-sm text-sage" role="status" aria-live="polite">{msg}</p>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h3 className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Spirit requests</h3>
        {incoming.length === 0 && <p className="text-base text-sage">No new requests.</p>}
        {incoming.map((r) => (
          <div key={r.requester_id} className="flex flex-wrap items-center gap-3">
            <a href={`/spirit/${encodeURIComponent(nm(r.requester_id))}`} className="text-base text-mist underline underline-offset-4">{nm(r.requester_id)}</a>
            <button type="button" className={btn} onClick={() => accept(r.requester_id)}>Accept</button>
            <button type="button" className={btn} onClick={() => drop(r.requester_id, me.id)}>Decline</button>
          </div>
        ))}
        {sent.length > 0 && <p className="text-sm text-sage">Waiting on: {sent.map((r) => nm(r.addressee_id)).join(", ")}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Your spirits</h3>
        {mine.length === 0 && <p className="text-base text-sage">No spirits yet.</p>}
        {mine.map((r) => (
          <div key={r.requester_id + r.addressee_id} className="flex flex-wrap items-center gap-3">
            <a href={`/spirit/${encodeURIComponent(nm(other(r)))}`} className="text-base text-mist underline underline-offset-4">{nm(other(r))}</a>
            <button type="button" className={btn} onClick={() => drop(r.requester_id, r.addressee_id)}>Remove</button>
          </div>
        ))}
      </section>

      <JournalList me={me} />

      <section className="flex flex-col gap-3 border-t border-stone pt-8">
        <h3 className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>Delete my account</h3>
        <p className="text-sm text-mist">This removes your profile, posts, likes and spirits for good. Type <strong>delete</strong> to confirm.</p>
        <div className="flex flex-wrap gap-3">
          <label htmlFor={`${uid}-d`} className="sr-only">Type delete to confirm</label>
          <input id={`${uid}-d`} className={`${field} max-w-48`} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button
            type="button"
            className={btn}
            disabled={confirm.trim().toLowerCase() !== "delete"}
            onClick={async () => {
              const sb = getSupabase();
              if (!sb) return;
              const { error } = await sb.rpc("delete_my_account");
              if (error) return setMsg("Couldn't delete the account. Please try again.");
              await sb.auth.signOut();
              window.location.href = "/";
            }}
          >
            Delete forever
          </button>
        </div>
      </section>
    </div>
  );
}
