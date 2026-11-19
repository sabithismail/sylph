/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { meow, unlockAudio } from "@/lib/meow";
import { TOURS } from "@/lib/tour";

const W = 84;
const H = Math.round((W * 360) / 297);
const KEY_HIDDEN = "sylph-cat-hidden";
const KEY_MUTE = "sylph-cat-mute";
const KEY_SEEN = "sylph-cat-seen";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage unavailable */
    }
  },
};

const pill =
  "rounded-full border border-stone px-3.5 py-1.5 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

/** A little cat that walks to parts of the page and explains them. */
export default function CatGuide() {
  const pathname = usePathname();
  const steps = useMemo(() => TOURS[pathname] ?? [], [pathname]);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<"idle" | "menu" | "tour">("idle");
  const [i, setI] = useState(0);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [face, setFace] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [say, setSay] = useState("");
  const [vp, setVp] = useState({ w: 360, h: 640 });
  const run = useRef(0);
  const posRef = useRef(pos);
  const mutedRef = useRef(false);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const rest = useCallback(() => ({ x: window.innerWidth - W - 10, y: window.innerHeight - H - 10 }), []);
  const sound = useCallback((k: "meow" | "mew" = "meow") => {
    if (!mutedRef.current) meow(k);
  }, []);

  // Appear once the intro (if any) has finished.
  useEffect(() => {
    setHidden(store.get(KEY_HIDDEN) === "1");
    setMuted(store.get(KEY_MUTE) === "1");
    const t = setInterval(() => {
      if (document.querySelector(".sy-intro-out")) return;
      clearInterval(t);
      setVp({ w: window.innerWidth, h: window.innerHeight });
      setPos(rest());
      setReady(true);
      if (!store.get(KEY_SEEN)) {
        store.set(KEY_SEEN, "1");
        setTimeout(() => setSay((s) => s || "Mrrp? Tap me for a little tour."), 2200);
        setTimeout(() => setSay((s) => (s === "Mrrp? Tap me for a little tour." ? "" : s)), 9000);
      }
    }, 300);
    return () => clearInterval(t);
  }, [rest]);

  // Keep the resting spot right when the window changes.
  useEffect(() => {
    if (!ready) return;
    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      if (mode !== "tour") setPos(rest());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ready, mode, rest]);

  // A new page ends any tour and sends the cat home.
  useEffect(() => {
    run.current++;
    setMode("idle");
    setWalking(false);
    setSay("");
    setI(0);
    if (ready) setPos(rest());
  }, [pathname, ready, rest]);

  const goHome = useCallback(
    async (line: string) => {
      const my = ++run.current;
      setMode("idle");
      setSay("");
      const to = rest();
      setFace(to.x > posRef.current.x ? 1 : -1);
      setWalking(true);
      sound("meow");
      setPos(to);
      await wait(1000);
      if (run.current !== my) return;
      setWalking(false);
      setSay(line);
      if (line) {
        await wait(5000);
        if (run.current === my) setSay("");
      }
    },
    [rest, sound],
  );

  // Walk to the current step and speak.
  useEffect(() => {
    if (mode !== "tour") return;
    const my = ++run.current;
    const alive = () => run.current === my;
    (async () => {
      const step = steps[i];
      const el = step ? (document.querySelector(step.sel) as HTMLElement | null) : null;
      if (!step || !el) {
        if (i + 1 < steps.length) setI(i + 1);
        else void goHome("That's the tour! Tap me whenever you want help.");
        return;
      }
      setSay("");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const r0 = el.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.scrollY + r0.top - 300), behavior: reduce ? "auto" : "smooth" });
      await wait(reduce ? 60 : 750);
      if (!alive()) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = clamp(i % 2 === 0 ? r.left + 10 : r.right - W - 10, 8, vw - W - 8);
      let y = r.top >= 270 ? r.top - H + 22 : r.bottom - 14;
      if (y + H + 170 > vh && r.top < 270) y = vh - H - 180;
      y = clamp(y, 8, vh - H - 8);
      setFace(x > posRef.current.x ? 1 : -1);
      setVp({ w: vw, h: vh });
      setWalking(true);
      sound("meow");
      setPos({ x, y });
      if (!reduce) setTimeout(() => alive() && sound("mew"), 620);
      await wait(reduce ? 60 : 1000);
      if (!alive()) return;
      setWalking(false);
      setSay(step.text);
    })();
    const cancel = () => {
      run.current++;
    };
    return cancel;
  }, [mode, i, steps, goHome, sound]);

  useEffect(() => {
    if (mode === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void goHome("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, goHome]);

  function tapCat() {
    unlockAudio();
    sound("mew");
    if (mode === "idle") {
      setMode("menu");
      setSay(
        steps.length
          ? "Hi, I'm the garden cat. Want me to show you around this page?"
          : "Hi, I'm the garden cat. I know the home page, the feed, writing pages and your garden. Want me to take you home?",
      );
    } else {
      void goHome("");
    }
  }

  function startTour() {
    unlockAudio();
    setI(0);
    setMode("tour");
  }

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    store.set(KEY_MUTE, next ? "1" : "0");
    unlockAudio();
    if (!next) meow("mew");
  }

  function hide() {
    store.set(KEY_HIDDEN, "1");
    run.current++;
    setHidden(true);
    setMode("idle");
    setSay("");
  }

  if (!ready) return null;

  if (hidden) {
    return (
      <button
        type="button"
        aria-label="Bring back the garden cat"
        onClick={() => {
          store.set(KEY_HIDDEN, "0");
          setHidden(false);
          unlockAudio();
          setPos(rest());
        }}
        className="fixed bottom-3 right-3 z-[60] grid size-10 place-items-center rounded-full border border-stone bg-night/80 text-lg opacity-70 backdrop-blur-sm hover:opacity-100"
      >
        🐾
      </button>
    );
  }

  const bw = Math.min(300, vp.w * 0.86);
  const bubbleLeft = clamp(pos.x + W / 2 - bw / 2, 8, vp.w - bw - 8) - pos.x;
  const above = pos.y > 200;
  const last = i + 1 >= steps.length;

  return (
    <div
      className="sy-cat pointer-events-none fixed left-0 top-0 z-[60]"
      style={{ width: W, height: H, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      {say && (
        <div
          role="status"
          aria-live="polite"
          className="sy-bubble pointer-events-auto absolute rounded-2xl border border-glow/60 bg-night p-4 text-mist shadow-xl"
          style={{ width: bw, left: bubbleLeft, ...(above ? { bottom: H + 8 } : { top: H + 8 }) }}
        >
          <p className="text-base leading-snug">{say}</p>
          {mode === "tour" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-auto text-xs text-sage">{i + 1} of {steps.length}</span>
              <button type="button" className={pill} onClick={() => void goHome("")}>Skip</button>
              <button
                type="button"
                className="rounded-full bg-moss px-4 py-1.5 text-sm font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
                onClick={() => (last ? void goHome("That's the tour! Tap me whenever you want help.") : setI(i + 1))}
              >
                {last ? "Done" : "Next"}
              </button>
            </div>
          )}
          {mode === "menu" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.length ? (
                <button type="button" className="rounded-full bg-moss px-4 py-1.5 text-sm font-semibold text-[#f1f3e8]" onClick={startTour}>
                  Show me around
                </button>
              ) : (
                <Link href="/" className="rounded-full bg-moss px-4 py-1.5 text-sm font-semibold text-[#f1f3e8]">Take me home</Link>
              )}
              <button type="button" className={pill} onClick={() => void goHome("")}>Not now</button>
              <button type="button" className={pill} onClick={toggleSound} aria-pressed={!muted}>{muted ? "Sound off" : "Sound on"}</button>
              <button type="button" className="px-1 py-1.5 text-sm text-sage underline underline-offset-4" onClick={hide}>Hide the cat</button>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        aria-label="Garden cat guide"
        onClick={tapCat}
        className="pointer-events-auto block size-full cursor-pointer"
        style={{ transform: `scaleX(${face})` }}
      >
        <img
          src="/cat/cat.webp"
          alt=""
          width={W}
          height={H}
          draggable={false}
          className={`${walking ? "sy-cat-walk" : "sy-cat-idle"} size-full select-none object-contain`}
        />
      </button>
    </div>
  );
}
