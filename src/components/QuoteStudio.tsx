"use client";

import { useId, useState } from "react";
import Stylist from "./Stylist";
import { QUOTES } from "@/lib/quotes";

type Tab = "random" | "past";

const btnPrimary =
  "rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
const btnGhost =
  "rounded-full border border-stone px-5 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

function pick(not?: number) {
  let i = Math.floor(Math.random() * QUOTES.length);
  if (QUOTES.length > 1 && i === not) i = (i + 1) % QUOTES.length;
  return i;
}

export default function QuoteStudio() {
  const uid = useId();
  const [tab, setTab] = useState<Tab>("random");

  const [idx, setIdx] = useState(0);
  const [shuffled, setShuffled] = useState(false);

  const [past, setPast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [care, setCare] = useState("");
  const [mine, setMine] = useState<{ text: string; demo: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const randomText = shuffled ? QUOTES[idx] : QUOTES[0];
  const shown = tab === "random" ? randomText : (mine?.text ?? "");

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy isn't available here. Select the quote and copy it by hand.");
    }
  }

  async function write() {
    setLoading(true);
    setError("");
    setCare("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ past }),
      });
      const data = await res.json();
      if (data.care) setCare(data.message as string);
      else if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setMine({ text: data.quote, demo: Boolean(data.demo) });
    } catch {
      setError("Sylph couldn't connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === t}
      onClick={() => {
        setTab(t);
        setError("");
      }}
      className={`flex-1 rounded-full px-4 py-2.5 text-base transition-colors duration-150 ${tab === t ? "bg-moss font-semibold text-[#f1f3e8]" : "text-mist"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      <h2
        className="text-4xl text-mist sm:text-5xl"
        style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
      >
        Find a quote
      </h2>

      <div role="tablist" aria-label="Quote type" className="flex gap-1 rounded-full border border-stone bg-deep p-1">
        {tabBtn("random", "Random")}
        {tabBtn("past", "From my past")}
      </div>

      {tab === "past" && (
        <div className="flex flex-col gap-4">
          <p className="text-2xl text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
            Share one hard moment. Sylph will turn it into a line or two, with a touch of nature.
          </p>
          {care && (
            <div role="alert" className="rounded-2xl border border-glow bg-deep p-5 text-base leading-relaxed text-mist">
              {care}
            </div>
          )}
          <label htmlFor={`${uid}-past`} className="text-sm text-mist">Your moment</label>
          <textarea
            id={`${uid}-past`}
            value={past}
            onChange={(e) => setPast(e.target.value)}
            maxLength={1200}
            rows={5}
            placeholder="The day I…"
            className="w-full resize-y rounded-2xl border border-stone bg-night p-4 leading-relaxed text-mist placeholder:text-sage"
            style={{ fontFamily: "var(--font-hand)", fontSize: "1.4rem" }}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-sage" role="status" aria-live="polite">
              {loading ? "Sylph is listening…" : `${past.trim().length}/1200`}
            </p>
            <button type="button" className={btnPrimary} disabled={loading || past.trim().length < 10} onClick={write}>
              {loading ? "Writing…" : mine ? "Write another" : "Write my quote"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">{error}</p>
      )}

      {(tab === "random" || mine) && (
        <div className="flex flex-col gap-5">
          {tab === "past" && mine?.demo && (
            <p className="rounded-xl border border-stone bg-deep p-4 text-sm text-mist">
              This is a sample quote. Sylph&apos;s writing key isn&apos;t connected yet.
            </p>
          )}
          {tab === "random" ? (
            <blockquote
              key={idx + String(shuffled)}
              className="sy-home-in rounded-2xl border border-stone bg-deep p-6 text-3xl leading-snug text-mist sm:p-8 sm:text-4xl"
              style={{ fontFamily: "var(--font-hand)", fontWeight: 600 }}
            >
              {shown}
            </blockquote>
          ) : (
            <textarea
              aria-label="Your quote. You can edit it."
              value={mine?.text ?? ""}
              onChange={(e) => mine && setMine({ ...mine, text: e.target.value })}
              rows={4}
              className="w-full resize-y rounded-2xl border border-stone bg-deep p-6 text-3xl leading-snug text-mist"
              style={{ fontFamily: "var(--font-hand)", fontWeight: 600 }}
            />
          )}
          <div className="flex flex-wrap gap-3">
            {tab === "random" && (
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  setIdx(pick(shuffled ? idx : 0));
                  setShuffled(true);
                }}
              >
                Another quote
              </button>
            )}
            <button type="button" className={tab === "random" ? btnGhost : btnPrimary} onClick={() => copy(shown)}>
              {copied ? "Copied" : "Copy quote"}
            </button>
          </div>
        </div>
      )}
      {shown && (tab === "random" || mine) && <Stylist text={shown} kind="quote" />}
    </div>
  );
}
