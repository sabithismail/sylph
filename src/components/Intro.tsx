"use client";

import { useEffect } from "react";
import Ambient from "./Ambient";

type Props = { onDone: () => void };

/** Plays once: a pen writes "Sylph", its glow lifts off as a firefly. */
export default function Intro({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 7200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <main className="sy-sky sy-intro-out fixed inset-0 z-20 flex flex-col items-center justify-center gap-2">
      <Ambient />
      <h1 className="sr-only">Sylph</h1>
      <div className="sy-wm" aria-hidden="true">
        <div className="sy-reveal">
          <span className="sy-word">Sylph</span>
        </div>
        <div className="sy-nib">
          <div className="sy-lift">
            <svg
              className="sy-pen"
              width="46"
              height="46"
              viewBox="0 0 46 46"
            >
              <path d="M2 44 L30 8 L40 15 L10 46 Z" fill="#c7cbb8" />
            </svg>
            <div className="sy-dot" />
          </div>
        </div>
      </div>
      <p
        className="sy-tagline text-center text-mist"
        style={{ fontFamily: "var(--font-hand)", fontSize: "clamp(26px, 6vw, 38px)" }}
      >
        a garden for your quiet words
      </p>
      <button
        type="button"
        onClick={onDone}
        className="absolute right-5 bottom-5 rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
        style={{ bottom: "max(20px, env(safe-area-inset-bottom, 0px))" }}
      >
        Skip
      </button>
    </main>
  );
}
