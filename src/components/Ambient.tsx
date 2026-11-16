"use client";

import { useEffect, useRef } from "react";

const FIREFLIES = [
  { left: "11%", top: "72%", size: 8, delay: 0, depth: 26 },
  { left: "24%", top: "28%", size: 6, delay: -2, depth: 12 },
  { left: "37%", top: "84%", size: 7, delay: -4, depth: 18 },
  { left: "67%", top: "78%", size: 8, delay: -1, depth: 30 },
  { left: "78%", top: "24%", size: 6, delay: -5, depth: 10 },
  { left: "90%", top: "58%", size: 7, delay: -3, depth: 22 },
  { left: "48%", top: "14%", size: 5, delay: -6, depth: 8 },
];

const LEAVES = [
  { left: "14%", delay: 0, size: 26 },
  { left: "55%", delay: -7, size: 20 },
  { left: "84%", delay: -12, size: 24 },
];

/** Drifting fireflies and falling leaves. Purely decorative. */
export default function Ambient() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <span className="sy-mist" style={{ left: "-15vmax", top: "-10vmax" }} />
      <span className="sy-mist" style={{ right: "-20vmax", bottom: "-20vmax", animationDelay: "-12s" }} />
      {LEAVES.map((l) => (
        <svg
          key={l.left}
          className="sy-leaf"
          style={{ left: l.left, animationDelay: `${l.delay}s` }}
          width={l.size}
          height={l.size * 1.17}
          viewBox="0 0 120 140"
        >
          <path
            d="M60 10 C 94 34 100 78 60 116 C 20 78 26 34 60 10 Z"
            fill="#3e5a3f"
          />
          <path
            d="M60 20 L60 116"
            stroke="#c7cbb8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ))}
      {FIREFLIES.map((f) => (
        <span
          key={f.left + f.top}
          className="sy-par"
          style={{ left: f.left, top: f.top, ["--d" as string]: f.depth }}
        >
          <span
            className="sy-firefly"
            style={{
              width: f.size,
              height: f.size,
              boxShadow: `0 0 ${f.size * 2}px ${f.size * 0.8}px rgb(214 228 130 / 0.5)`,
              animationDelay: `${f.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
