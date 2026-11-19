"use client";

import { useEffect, useRef, useState } from "react";

/** Reads a piece aloud with the browser's own voice, line by line. */
export default function ReadAloud({ title, text }: { title?: string; text: string }) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const token = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    const t = token;
    return () => {
      t.current++;
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function stop() {
    token.current++;
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function play() {
    stop();
    const my = ++token.current;
    const lang = navigator.language?.toLowerCase().startsWith("en") ? navigator.language : "en-US";
    const chunks = [title?.trim() ? `${title.trim()}.` : "", ...text.split(/\n+/)]
      .flatMap((line) => line.match(/[^.!?]+[.!?]*\s*/g) ?? [line])
      .map((s) => s.trim())
      .filter(Boolean);
    setPlaying(true);
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang;
      u.rate = 0.88;
      u.pitch = 1;
      if (i === chunks.length - 1) {
        u.onend = () => token.current === my && setPlaying(false);
        u.onerror = () => token.current === my && setPlaying(false);
      }
      window.speechSynthesis.speak(u);
    });
  }

  return (
    <button
      type="button"
      onClick={playing ? stop : play}
      aria-pressed={playing}
      className="rounded-full border border-stone px-5 py-3 text-base text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
    >
      {playing ? "■ Stop" : "🔊 Listen"}
    </button>
  );
}
