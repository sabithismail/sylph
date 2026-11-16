"use client";

import { useId, useState } from "react";
import { authedPost } from "@/lib/api";
import Stylist from "./Stylist";
import { GRAMMAR } from "@/lib/poem";
import { PRESETS, VOICES, WORDS_MAX, WORDS_MIN, type StoryVoice } from "@/lib/story";

type Step = "past" | "shape" | "voice" | "result";
type Result = { title: string; story: string; demo: boolean };

const btnPrimary =
  "rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
const btnGhost =
  "rounded-full border border-stone px-5 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";
const card =
  "flex cursor-pointer flex-col gap-1 rounded-xl border border-stone bg-deep p-4 transition-transform duration-150 ease-out hover:-translate-y-0.5 has-[:checked]:border-glow has-[:checked]:bg-moss has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow";
const h2 = "text-4xl text-mist sm:text-5xl";
const script = { fontFamily: "var(--font-script)", fontWeight: 700 } as const;

export default function StoryWizard() {
  const uid = useId();
  const [step, setStep] = useState<Step>("past");
  const [past, setPast] = useState("");
  const [words, setWords] = useState(400);
  const [voice, setVoice] = useState<StoryVoice>("me");
  const [grammar, setGrammar] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [oldEnglish, setOldEnglish] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [care, setCare] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const pastOk = past.trim().length >= 10;
  const stepNo = step === "past" ? 1 : step === "shape" ? 2 : 3;

  async function write() {
    setLoading(true);
    setError("");
    setCare("");
    try {
      const res = await authedPost("/api/story", { past, words, grammar, voice, oldEnglish });
      const data = await res.json();
      if (data.care) {
        setCare(data.message as string);
        setStep("past");
      } else if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult({ title: data.title, story: data.story, demo: Boolean(data.demo) });
        setStep("result");
      }
    } catch {
      setError("Sylph couldn't connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.title}\n\n${result.story}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy isn't available here. Select the story and copy it by hand.");
    }
  }

  function startOver() {
    setResult(null);
    setPast("");
    setError("");
    setCare("");
    setStep("past");
  }

  const count = result ? result.story.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-8">
      {step !== "result" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-sage">Step {stepNo} of 3</p>
          <div className="flex gap-2" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`h-1 flex-1 rounded-full ${n <= stepNo ? "bg-glow" : "bg-stone"}`} />
            ))}
          </div>
        </div>
      )}

      {step === "past" && (
        <section className="flex flex-col gap-5">
          <h2 className={h2} style={script}>Tell me what happened</h2>
          <p className="text-2xl text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
            Share a piece of your past. Write only what you want to.
          </p>
          {care && (
            <div role="alert" className="rounded-2xl border border-glow bg-deep p-5 text-base leading-relaxed text-mist">
              {care}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-past`} className="text-sm text-mist">Your past</label>
            <textarea
              id={`${uid}-past`}
              value={past}
              onChange={(e) => setPast(e.target.value)}
              maxLength={2000}
              rows={8}
              placeholder="It started when…"
              className="w-full resize-y rounded-2xl border border-stone bg-night p-4 leading-relaxed text-mist placeholder:text-sage"
              style={{ fontFamily: "var(--font-hand)", fontSize: "1.4rem" }}
            />
            <p className="text-sm text-sage">{past.trim().length}/2000</p>
          </div>
          <div className="flex justify-end">
            <button type="button" className={btnPrimary} disabled={!pastOk} onClick={() => setStep("shape")}>
              Next: shape the story
            </button>
          </div>
        </section>
      )}

      {step === "shape" && (
        <section className="flex flex-col gap-6">
          <h2 className={h2} style={script}>Shape the story</h2>

          <div className="flex flex-col gap-3">
            <label htmlFor={`${uid}-words`} className="text-base text-mist">
              Length: about {words} words
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setWords(p.words)}
                  aria-pressed={words === p.words}
                  className={`rounded-full border px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 ${words === p.words ? "border-glow bg-moss" : "border-stone"}`}
                >
                  {p.label} · {p.words}
                </button>
              ))}
            </div>
            <input
              id={`${uid}-words`}
              type="range"
              min={WORDS_MIN}
              max={WORDS_MAX}
              step={50}
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
              className="w-full accent-[#e6eda0]"
            />
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-base text-mist">Who tells it?</legend>
            {VOICES.map((v) => (
              <label key={v.id} className={card}>
                <input
                  type="radio"
                  name={`${uid}-voice`}
                  checked={voice === v.id}
                  onChange={() => setVoice(v.id)}
                  className="sr-only"
                />
                <span className="text-lg font-semibold text-mist">{v.name}</span>
                <span className="text-sm text-mist">{v.blurb}</span>
              </label>
            ))}
          </fieldset>

          <div className="flex justify-between gap-3">
            <button type="button" className={btnGhost} onClick={() => setStep("past")}>Back</button>
            <button type="button" className={btnPrimary} onClick={() => setStep("voice")}>Next: set the voice</button>
          </div>
        </section>
      )}

      {step === "voice" && (
        <section className="flex flex-col gap-6">
          <h2 className={h2} style={script}>Set the voice</h2>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-base text-mist">Grammar level</legend>
            <div className="grid grid-cols-5 gap-2">
              {GRAMMAR.map((g) => (
                <label
                  key={g.level}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-stone bg-deep px-1 py-3 text-center transition-transform duration-150 ease-out hover:-translate-y-0.5 has-[:checked]:border-glow has-[:checked]:bg-moss has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow"
                >
                  <input
                    type="radio"
                    name={`${uid}-grammar`}
                    checked={grammar === g.level}
                    onChange={() => setGrammar(g.level)}
                    className="sr-only"
                  />
                  <span className="text-xl font-semibold text-mist">{g.level}</span>
                  <span className="text-xs text-mist">{g.name}</span>
                </label>
              ))}
            </div>
            <p className="text-base text-mist" aria-live="polite">
              {GRAMMAR.find((g) => g.level === grammar)?.hint}
            </p>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone bg-deep p-4">
            <input
              type="checkbox"
              checked={oldEnglish}
              onChange={(e) => setOldEnglish(e.target.checked)}
              className="mt-1 size-5 accent-[#e6eda0]"
            />
            <span className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-mist">Old English style</span>
              <span className="text-sm text-mist">Words like thee, thou, thy, hath and doth.</span>
            </span>
          </label>

          <p className="text-sm text-sage" role="status" aria-live="polite">
            {loading ? "Sylph is listening and writing. Longer stories take up to a minute…" : ""}
          </p>
          {error && (
            <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">{error}</p>
          )}
          <div className="flex justify-between gap-3">
            <button type="button" className={btnGhost} onClick={() => setStep("shape")} disabled={loading}>Back</button>
            <button type="button" className={btnPrimary} onClick={write} disabled={loading}>
              {loading ? "Writing…" : "Write my story"}
            </button>
          </div>
        </section>
      )}

      {step === "result" && result && (
        <section className="flex flex-col gap-5">
          {result.demo && (
            <p className="rounded-xl border border-stone bg-deep p-4 text-sm text-mist">
              This is a sample story. Sylph&apos;s writing key isn&apos;t connected yet.
            </p>
          )}
          <input
            aria-label="Story title"
            value={result.title}
            onChange={(e) => setResult({ ...result, title: e.target.value })}
            className="w-full bg-transparent text-4xl text-mist sm:text-5xl"
            style={script}
          />
          <textarea
            aria-label="Your story. You can edit it."
            value={result.story}
            onChange={(e) => setResult({ ...result, story: e.target.value })}
            rows={Math.min(30, Math.max(10, Math.round(count / 9)))}
            className="w-full resize-y rounded-2xl border border-stone bg-deep p-5 text-mist"
            style={{ fontFamily: "var(--font-hand)", fontSize: "1.5rem", lineHeight: 1.5 }}
          />
          <p className="text-sm text-sage">{count} words · Tap the story to change anything. It&apos;s yours now.</p>
          <Stylist title={result.title} text={result.story} kind="story" />
          {error && (
            <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">{error}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimary} onClick={copy}>{copied ? "Copied" : "Copy story"}</button>
            <button type="button" className={btnGhost} onClick={write} disabled={loading}>
              {loading ? "Writing…" : "Write another version"}
            </button>
            <button type="button" className={btnGhost} onClick={() => setStep("shape")}>Change the shape</button>
            <button type="button" className={btnGhost} onClick={startOver}>Start over</button>
          </div>
        </section>
      )}
    </div>
  );
}
