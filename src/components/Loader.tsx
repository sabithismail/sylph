"use client";

import { useEffect, useState } from "react";

/** A glowing core with fireflies circling it, and a line that changes while you wait. */
export default function Loader({
  phrases = ["Gathering the garden…"],
  size = 64,
  center = false,
}: {
  phrases?: string[];
  size?: number;
  center?: boolean;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % phrases.length), 2800);
    return () => clearInterval(t);
  }, [phrases.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-4 ${center ? "flex-col justify-center text-center" : ""}`}
    >
      <div className="sy-orbit" style={{ width: size, height: size }} aria-hidden="true">
        <span className="sy-orbit-core" />
        <span className="sy-orbit-dot" style={{ ["--r" as string]: `${size * 0.42}px`, ["--t" as string]: "3s" }} />
        <span className="sy-orbit-dot" style={{ ["--r" as string]: `${size * 0.32}px`, ["--t" as string]: "2.1s", animationDirection: "reverse" }} />
        <span className="sy-orbit-dot" style={{ ["--r" as string]: `${size * 0.48}px`, ["--t" as string]: "4.2s", animationDelay: "-1s" }} />
      </div>
      <p key={i} className="sy-phrase text-lg text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500, fontSize: "1.45rem" }}>
        {phrases[i]}
      </p>
    </div>
  );
}
