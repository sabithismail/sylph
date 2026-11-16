"use client";

import { useRef, type ReactNode } from "react";

/** Gentle 3D tilt with a soft light that follows the pointer or finger. */
export default function Tilt({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div ref={ref} className={`sy-tilt ${className}`} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
      {children}
      <span className="sy-glare" aria-hidden="true" />
    </div>
  );
}
