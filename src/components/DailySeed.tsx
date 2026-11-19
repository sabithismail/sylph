"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { seedOfDay } from "@/lib/seeds";

/** Today's writing seed. Computed in the browser so it follows the visitor's own day. */
export default function DailySeed() {
  const [seed, setSeed] = useState("");
  useEffect(() => setSeed(seedOfDay()), []);
  if (!seed) return <div className="min-h-28" aria-hidden="true" />;
  return (
    <section aria-labelledby="seed-h" className="flex flex-col gap-3 rounded-2xl border border-glow/40 bg-deep p-6">
      <h2 id="seed-h" className="text-sm uppercase tracking-widest text-sage">Today&apos;s seed</h2>
      <p className="text-2xl leading-snug text-mist" style={{ fontFamily: "var(--font-hand)", fontWeight: 500 }}>
        {seed}
      </p>
      <div>
        <Link
          href={`/poem?seed=${encodeURIComponent(seed)}`}
          className="inline-block rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-[#f1f3e8] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
        >
          Write from this
        </Link>
      </div>
    </section>
  );
}
