"use client";

import { useEffect, useRef, useState } from "react";
import BreatheButton from "./Breathe";

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecCtor = new () => Rec;

function recognitionCtor(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Speak-your-story mic (when the browser supports it) and a breathing moment. */
export default function WriteTools({ onText }: { onText: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [note, setNote] = useState("");
  const rec = useRef<Rec | null>(null);

  useEffect(() => {
    setSupported(recognitionCtor() !== null);
    return () => rec.current?.stop();
  }, []);

  function toggle() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    setNote("");
    const r = new Ctor();
    r.lang = navigator.language?.toLowerCase().startsWith("en") ? navigator.language : "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) onText(res[0].transcript);
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setNote("The microphone is blocked. Allow it in your browser settings to speak.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setNote("Couldn't hear that. Please try again.");
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setNote("Couldn't start the microphone.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {supported && (
          <button
            type="button"
            onClick={toggle}
            aria-pressed={listening}
            className={`rounded-full border px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${listening ? "border-glow bg-moss" : "border-stone"}`}
          >
            {listening ? "● Listening… tap to stop" : "🎙 Speak instead"}
          </button>
        )}
        <BreatheButton className="text-sm text-mist underline underline-offset-4">Feeling heavy? Take a breath</BreatheButton>
      </div>
      {listening && (
        <p className="text-sm text-sage" role="status">
          {interim ? `“${interim}”` : "Go ahead, I'm listening."} Your browser may send your voice to its speech service to turn it into text.
        </p>
      )}
      {note && <p role="alert" className="text-sm text-sage">{note}</p>}
    </div>
  );
}
