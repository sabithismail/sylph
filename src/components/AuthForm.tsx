"use client";

import { useEffect, useId, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

const field =
  "w-full rounded-xl border border-stone bg-night px-4 py-3 text-base text-mist placeholder:text-sage";
const btnPrimary =
  "rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50";

export default function AuthForm() {
  const uid = useId();
  const { me, configured } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (me) {
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.replace(next && next.startsWith("/") ? next : "/feed");
    }
  }, [me]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setError("");
    setInfo("");
    if (mode === "up" && !age) return setError("Please confirm that you are 13 or older.");
    if (mode === "up" && name.trim().length < 2) return setError("Choose a display name of at least 2 letters.");
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    setBusy(true);
    if (mode === "in") {
      const { error: err } = await sb.auth.signInWithPassword({ email, password });
      if (err) setError("That email and password don't match.");
    } else {
      const { data, error: err } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim(), agreed_13: "true" } },
      });
      if (err) setError(err.message.includes("registered") ? "That email already has an account. Try signing in." : "Couldn't create the account. Please try again.");
      else if (!data.session) setInfo("Almost there. Check your email for a link to confirm, then sign in.");
    }
    setBusy(false);
  }

  if (!configured) {
    return <p className="text-base text-mist">Accounts aren&apos;t connected on this site yet.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div role="tablist" aria-label="Sign in or join" className="flex gap-1 rounded-full border border-stone bg-deep p-1">
        {(
          [
            ["in", "Sign in"],
            ["up", "Join Sylph"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError("");
              setInfo("");
            }}
            className={`flex-1 rounded-full px-4 py-2.5 text-base ${mode === m ? "bg-moss font-semibold text-[#f1f3e8]" : "text-mist"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "up" && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-n`} className="text-sm text-mist">Display name (shown on your posts, not your real name)</label>
          <input id={`${uid}-n`} className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={26} placeholder="Moon Fern" autoComplete="nickname" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-e`} className="text-sm text-mist">Email</label>
        <input id={`${uid}-e`} className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-p`} className="text-sm text-mist">Password (8+ characters)</label>
        <input id={`${uid}-p`} className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
      </div>

      {mode === "up" && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone bg-deep p-4">
          <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-1 size-5 accent-[#e6eda0]" />
          <span className="text-sm text-mist">I am 13 or older.</span>
        </label>
      )}

      {error && <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">{error}</p>}
      {info && <p role="status" className="rounded-xl border border-glow bg-deep p-4 text-base text-mist">{info}</p>}

      <div>
        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? "One moment…" : mode === "in" ? "Sign in" : "Join Sylph"}
        </button>
      </div>
    </form>
  );
}
