"use client";

import "@fontsource/cormorant-garamond/500-italic.css";
import { useEffect } from "react";
import Ambient from "./Ambient";

type Props = { onDone: () => void };

const LETTERS = ["S", "y", "l", "p", "h"];

/** Plays once: the name blooms in letter by letter, a wave of light passes through, a vine grows beneath. */
export default function Intro({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 6200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <main className="sy-sky sy-intro-out fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 px-4">
      <Ambient />
      <div className="sy-bloom" aria-hidden="true" />
      <h1 className="sr-only">Sylph</h1>

      <div className="relative" aria-hidden="true">
        <div className="sy-word" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {LETTERS.map((c, i) => (
            <span key={i} className="sy-letter" style={{ ["--i" as string]: i }}>
              {c}
            </span>
          ))}
        </div>
        <svg className="sy-vine" viewBox="0 0 360 28" fill="none">
          <path
            d="M4 16 C 62 3, 122 28, 192 13 S 304 5, 352 15"
            pathLength={1}
            stroke="#c7cbb8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle className="sy-vine-orb" cx="352" cy="15" r="3.2" fill="#e6eda0" />
        </svg>
      </div>

      <p
        className="sy-tagline text-center text-mist"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", fontSize: "clamp(20px, 4.6vw, 28px)" }}
      >
        a garden for your quiet words
      </p>

      <button
        type="button"
        onClick={onDone}
        className="absolute right-5 rounded-full border border-stone px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
        style={{ bottom: "max(20px, env(safe-area-inset-bottom, 0px))" }}
      >
        Skip
      </button>
    </main>
  );
}
