"use client";

import { useCallback, useEffect, useState } from "react";
import Home from "./Home";
import Intro from "./Intro";

const SEEN_KEY = "sylph-intro-seen";

type Phase = "check" | "intro" | "home";

/** Decides whether to play the intro, then shows the garden. */
export default function Garden() {
  const [phase, setPhase] = useState<Phase>("check");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage can be blocked; play the intro */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase(seen || reduce ? "home" : "intro");
  }, []);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("home");
  }, []);

  if (phase === "check") return <div className="min-h-dvh bg-night" aria-hidden="true" />;
  if (phase === "intro") return <Intro onDone={finish} />;
  return <Home />;
}
