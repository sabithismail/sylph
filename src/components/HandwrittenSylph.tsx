"use client";

import { useEffect, useRef } from "react";
import { SYLPH_PATH, SYLPH_VIEWBOX } from "./sylphPath";

const START = 500; // ms before the pen touches down
const WRITE = 3800; // ms the pen spends writing
const LIFT = 2200; // ms for the pen glow to drift away as a firefly

const ease = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** Draws "Sylph" stroke by stroke with a glowing pen tip following the line. */
export default function HandwrittenSylph() {
  const pathRef = useRef<SVGPathElement>(null);
  const nibRef = useRef<SVGGElement>(null);
  const penRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const nib = nibRef.current;
    const pen = penRef.current;
    if (!path || !nib || !pen) return;

    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);
    let raf = 0;
    let t0 = 0;

    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0;

      if (t >= START) {
        const p = Math.min(1, (t - START) / WRITE);
        const e = ease(p);
        path.style.strokeDashoffset = String(1 - e);

        if (p < 1) {
          const pt = path.getPointAtLength(len * e);
          nib.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          nib.style.opacity = "1";
        } else {
          const q = Math.min(1, (t - START - WRITE) / LIFT);
          const x = end.x + 12 * q;
          const y = end.y - 40 * q * q;
          nib.setAttribute(
            "transform",
            `translate(${x} ${y}) scale(${1 - 0.45 * q})`,
          );
          nib.style.opacity = String(1 - q * q);
          pen.style.opacity = String(
            Math.max(0, 1 - (t - START - WRITE) / 350),
          );
          if (q >= 1) return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      className="sy-hand"
      viewBox={SYLPH_VIEWBOX}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sy-nibglow">
          <stop offset="0" stopColor="#e6eda0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e6eda0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        ref={pathRef}
        d={SYLPH_PATH}
        pathLength={1}
        fill="none"
        stroke="#c7cbb8"
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />
      <g ref={nibRef} style={{ opacity: 0 }}>
        <path
          ref={penRef}
          d="M0 0 L5.4 -9 L7.8 -7.6 L1.4 1.2 Z"
          fill="#c7cbb8"
        />
        <circle r="4" fill="url(#sy-nibglow)" />
        <circle r="1" fill="#e6eda0" />
      </g>
    </svg>
  );
}
