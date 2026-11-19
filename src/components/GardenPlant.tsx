"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { localDay } from "@/lib/day";

type Stat = { streak: number; total: number };

/** The signed-in user's writing streak, drawn as a plant that grows day by day. */
export default function GardenPlant() {
  const [stat, setStat] = useState<Stat | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    sb.rpc("my_streak", { local_day: localDay() }).then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : null;
      if (alive && row) setStat({ streak: row.streak as number, total: row.total as number });
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!stat) return null;
  return <PlantView streak={stat.streak} total={stat.total} />;
}

export function PlantView({ streak: s, total }: { streak: number; total: number }) {
  const stat = { streak: s, total };
  const stage = s === 0 ? 0 : s < 3 ? 1 : s < 7 ? 2 : s < 14 ? 3 : s < 30 ? 4 : 5;
  const words = [
    "Write something today to plant your first seed.",
    "A sprout! Come back tomorrow to keep it growing.",
    "Two leaves now. Keep tending it.",
    "Your plant has a bud. A week of words.",
    "In full bloom. Two weeks of showing up.",
    "A thirty-day garden. The fireflies came to stay.",
  ];
  const stroke = "#6b7f67";
  const leaf = "#8fa68a";

  return (
    <section data-tour="plant" aria-label="Your writing streak" className="flex items-center gap-5 rounded-2xl border border-stone bg-deep p-5">
      <svg width="96" height="110" viewBox="0 0 96 110" role="img" aria-label={`Plant at growth stage ${stage + 1} of 6`} className="shrink-0">
        {stage === 5 && (
          <>
            <circle cx="16" cy="30" r="2.6" fill="#e6eda0" className="sy-owner" />
            <circle cx="82" cy="22" r="2.2" fill="#e6eda0" className="sy-owner" />
            <circle cx="74" cy="56" r="1.8" fill="#e6eda0" className="sy-owner" />
          </>
        )}
        <ellipse cx="48" cy="100" rx="30" ry="7" fill="#3d4337" />
        {stage === 0 && <ellipse cx="48" cy="93" rx="5" ry="3.5" fill="#c7cbb8" />}
        {stage >= 1 && <path d="M48 98 V70" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />}
        {stage === 1 && (
          <>
            <path d="M48 76 C38 74 34 66 36 60 C44 60 48 68 48 76Z" fill={leaf} />
            <path d="M48 72 C58 70 62 62 60 56 C52 56 48 64 48 72Z" fill={leaf} />
          </>
        )}
        {stage >= 2 && (
          <>
            <path d="M48 98 V42" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M48 84 C34 84 28 74 30 66 C42 66 48 74 48 84Z" fill={leaf} />
            <path d="M48 76 C62 76 68 66 66 58 C54 58 48 66 48 76Z" fill={leaf} />
          </>
        )}
        {stage >= 3 && (
          <>
            <path d="M48 62 C36 60 32 52 34 46 C44 46 48 54 48 62Z" fill={leaf} />
            <path d="M48 54 C60 52 64 44 62 38 C52 38 48 46 48 54Z" fill={leaf} />
          </>
        )}
        {stage === 3 && <ellipse cx="48" cy="38" rx="6" ry="9" fill="#c9a0b8" />}
        {stage >= 4 && (
          <g transform="translate(48 36)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-10" rx="6.5" ry="10" fill={stage === 5 ? "#f2c9d9" : "#e3b3c8"} transform={`rotate(${a})`} />
            ))}
            <circle r="5.5" fill="#e6eda0" />
          </g>
        )}
      </svg>
      <div className="flex flex-col gap-1">
        <p className="text-3xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
          {s > 0 ? `${s}-day streak` : "Your garden"}
        </p>
        <p className="text-base text-mist">{words[stage]}</p>
        <p className="text-sm text-sage">{stat.total} {stat.total === 1 ? "day" : "days"} written in all</p>
      </div>
    </section>
  );
}
