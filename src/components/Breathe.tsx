"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PHASES = [
  { text: "Breathe in…", ms: 4000 },
  { text: "Hold…", ms: 2000 },
  { text: "Breathe out…", ms: 6000 },
] as const;
const ROUNDS = 5;

/** A button that opens a one-minute guided breathing moment. */
export default function BreatheButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && <BreatheDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function BreatheDialog({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = (r: number, p: number) => {
      if (!alive) return;
      setRound(r);
      setPhase(p);
      timer = setTimeout(() => {
        if (p < PHASES.length - 1) step(r, p + 1);
        else if (r < ROUNDS) step(r + 1, 0);
        else if (alive) setDone(true);
      }, PHASES[p].ms);
    };
    step(1, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="A moment to breathe"
      className="sy-sky fixed inset-0 z-[70] flex flex-col items-center justify-center gap-7 px-6 text-center"
    >
      <h2 className="text-4xl text-mist sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        {done ? "Well done" : "Take a breath"}
      </h2>
      <div className="grid size-64 place-items-center" aria-hidden="true">
        <div className={`sy-breath size-56 rounded-full ${done ? "sy-breath-rest" : ""}`} />
      </div>
      <p
        role="status"
        aria-live="polite"
        className="min-h-10 text-3xl text-mist"
        style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}
      >
        {done ? "Come back whenever you need to." : PHASES[phase].text}
      </p>
      <p className="text-sm text-sage">{done ? "Nothing to write. Nothing to fix." : `Round ${round} of ${ROUNDS}. Just follow the light.`}</p>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="rounded-full bg-moss px-7 py-3 text-base font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
      >
        {done ? "Back to Sylph" : "I'm ready"}
      </button>
      <p className="max-w-xs text-xs leading-relaxed text-sage">
        If it ever feels like too much, Tele-MANAS (India) is free at 14416, any time.
      </p>
    </div>,
    document.body,
  );
}
