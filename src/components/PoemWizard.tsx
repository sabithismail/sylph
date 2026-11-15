"use client";

import { useId, useState } from "react";
import {
  FORMS,
  GRAMMAR,
  STORY_MAX,
  STORY_MIN,
  formInfo,
  type PoemForm,
} from "@/lib/poem";

type Step = "story" | "form" | "voice" | "result";

type Result = {
  title: string;
  poem: string;
  demo: boolean;
};

const STARTERS = [
  "Something I lost and still carry…",
  "A time I felt completely alone…",
  "The day everything changed…",
  "Someone I wish I could talk to again…",
];

const btnPrimary =
  "rounded-full bg-moss px-6 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
const btnGhost =
  "rounded-full border border-stone px-5 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

export default function PoemWizard() {
  const uid = useId();
  const [step, setStep] = useState<Step>("story");
  const [story, setStory] = useState("");
  const [form, setForm] = useState<PoemForm>("free");
  const [lines, setLines] = useState(12);
  const [grammar, setGrammar] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [oldEnglish, setOldEnglish] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [care, setCare] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const info = formInfo(form);
  const storyOk = story.trim().length >= STORY_MIN;
  const stepNo = step === "story" ? 1 : step === "form" ? 2 : 3;

  function chooseForm(id: PoemForm) {
    setForm(id);
    setLines(formInfo(id).defaultLines);
  }

  async function write() {
    setLoading(true);
    setError("");
    setCare("");
    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, form, lines, grammar, oldEnglish }),
      });
      const data = await res.json();
      if (data.care) {
        setCare(data.message as string);
        setStep("story");
      } else if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult({ title: data.title, poem: data.poem, demo: Boolean(data.demo) });
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
      await navigator.clipboard.writeText(`${result.title}\n\n${result.poem}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy isn't available here. Select the poem and copy it by hand.");
    }
  }

  function startOver() {
    setResult(null);
    setStory("");
    setError("");
    setCare("");
    setStep("story");
  }

  return (
    <div className="flex flex-col gap-8">
      {step !== "result" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-sage">Step {stepNo} of 3</p>
          <div className="flex gap-2" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1 flex-1 rounded-full ${n <= stepNo ? "bg-glow" : "bg-stone"}`}
              />
            ))}
          </div>
        </div>
      )}

      {step === "story" && (
        <section className="flex flex-col gap-5">
          <h2
            className="text-4xl text-mist sm:text-5xl"
            style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
          >
            Tell me your story
          </h2>
          <p
            className="text-2xl text-mist"
            style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}
          >
            A memory, a feeling, a few lines of what happened. Write only what you want to.
          </p>

          {care && (
            <div
              role="alert"
              className="rounded-2xl border border-glow bg-deep p-5 text-base leading-relaxed text-mist"
            >
              {care}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStory((cur) => (cur.trim() ? cur : s + " "))}
                className="rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-story`} className="text-sm text-mist">
              Your story
            </label>
            <textarea
              id={`${uid}-story`}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              maxLength={STORY_MAX}
              rows={8}
              placeholder="It started when…"
              className="w-full resize-y rounded-2xl border border-stone bg-night p-4 text-lg leading-relaxed text-mist placeholder:text-sage"
              style={{ fontFamily: "var(--font-hand)", fontSize: "1.4rem" }}
            />
            <p className="text-sm text-sage">
              {story.trim().length}/{STORY_MAX}
              {!storyOk && story.length > 0 ? " · a little more, please" : ""}
            </p>
          </div>

          <div className="flex justify-end">
            <button type="button" className={btnPrimary} disabled={!storyOk} onClick={() => setStep("form")}>
              Next: choose a form
            </button>
          </div>
        </section>
      )}

      {step === "form" && (
        <section className="flex flex-col gap-5">
          <h2
            className="text-4xl text-mist sm:text-5xl"
            style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
          >
            Choose a form
          </h2>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Poem form</legend>
            {FORMS.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-stone bg-deep p-4 transition-transform duration-150 ease-out hover:-translate-y-0.5 has-[:checked]:border-glow has-[:checked]:bg-moss has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow"
              >
                <input
                  type="radio"
                  name={`${uid}-form`}
                  value={f.id}
                  checked={form === f.id}
                  onChange={() => chooseForm(f.id)}
                  className="sr-only"
                />
                <span className="text-lg font-semibold text-mist">{f.name}</span>
                <span className="text-sm text-mist">{f.blurb}</span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-lines`} className="text-base text-mist">
              {info.fixedLines
                ? `${info.name}s always have ${info.fixedLines} lines`
                : `Length: ${lines} lines`}
            </label>
            <input
              id={`${uid}-lines`}
              type="range"
              min={info.min}
              max={info.max}
              value={lines}
              disabled={Boolean(info.fixedLines)}
              onChange={(e) => setLines(Number(e.target.value))}
              className="w-full accent-[#e6eda0] disabled:opacity-40"
            />
          </div>

          <div className="flex justify-between gap-3">
            <button type="button" className={btnGhost} onClick={() => setStep("story")}>
              Back
            </button>
            <button type="button" className={btnPrimary} onClick={() => setStep("voice")}>
              Next: set the voice
            </button>
          </div>
        </section>
      )}

      {step === "voice" && (
        <section className="flex flex-col gap-6">
          <h2
            className="text-4xl text-mist sm:text-5xl"
            style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
          >
            Set the voice
          </h2>

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
                    value={g.level}
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
              <span className="text-sm text-mist">
                Words like thee, thou, thy, hath and doth, in the voice of old poets.
              </span>
            </span>
          </label>

          <p className="text-sm text-sage" role="status" aria-live="polite">
            {loading ? "Sylph is listening and writing…" : ""}
          </p>
          {error && (
            <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">
              {error}
            </p>
          )}

          <div className="flex justify-between gap-3">
            <button type="button" className={btnGhost} onClick={() => setStep("form")} disabled={loading}>
              Back
            </button>
            <button type="button" className={btnPrimary} onClick={write} disabled={loading}>
              {loading ? "Writing…" : "Write my poem"}
            </button>
          </div>
        </section>
      )}

      {step === "result" && result && (
        <section className="flex flex-col gap-5">
          {result.demo && (
            <p className="rounded-xl border border-stone bg-deep p-4 text-sm text-mist">
              This is a sample poem. Sylph&apos;s writing key isn&apos;t connected yet, so it
              can&apos;t write from your story.
            </p>
          )}
          <input
            aria-label="Poem title"
            value={result.title}
            onChange={(e) => setResult({ ...result, title: e.target.value })}
            className="w-full bg-transparent text-4xl text-mist sm:text-5xl"
            style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}
          />
          <textarea
            aria-label="Your poem. You can edit it."
            value={result.poem}
            onChange={(e) => setResult({ ...result, poem: e.target.value })}
            rows={Math.min(36, result.poem.split("\n").length + 2)}
            className="w-full resize-y rounded-2xl border border-stone bg-deep p-5 leading-relaxed text-mist"
            style={{ fontFamily: "var(--font-hand)", fontSize: "1.65rem", lineHeight: 1.45 }}
          />
          <p className="text-sm text-sage">Tap the poem to change any word. It&apos;s yours now.</p>

          {error && (
            <p role="alert" className="rounded-xl border border-stone bg-deep p-4 text-base text-mist">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimary} onClick={copy}>
              {copied ? "Copied" : "Copy poem"}
            </button>
            <button type="button" className={btnGhost} onClick={write} disabled={loading}>
              {loading ? "Writing…" : "Write another version"}
            </button>
            <button type="button" className={btnGhost} onClick={() => setStep("form")}>
              Change the style
            </button>
            <button type="button" className={btnGhost} onClick={startOver}>
              Start over
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
