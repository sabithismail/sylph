import { PALETTES, parseAvatar } from "@/lib/avatars";
import type { Shape } from "@/lib/avatars";
import { useId } from "react";

function Symbol({ shape, fg }: { shape: Shape; fg: string }) {
  switch (shape) {
    case "moon":
      return <path d="M40 15 A19 19 0 1 0 40 49 A15 15 0 1 1 40 15 Z" fill={fg} />;
    case "leaf":
      return (
        <>
          <path d="M32 11 C 51 21 52 42 32 54 C 12 42 13 21 32 11 Z" fill={fg} />
          <path d="M32 20 L32 50" stroke="#1e3a2e" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "flower":
      return (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="32" cy="20" rx="6.5" ry="10" fill={fg} opacity=".92" transform={`rotate(${a} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="6" fill="#1e3a2e" fillOpacity=".5" />
        </>
      );
    case "firefly":
      return (
        <>
          <circle cx="32" cy="34" r="13" fill={fg} opacity=".18" />
          <circle cx="32" cy="34" r="7" fill={fg} />
          <ellipse cx="22" cy="26" rx="8" ry="4" fill={fg} opacity=".55" transform="rotate(-25 22 26)" />
          <ellipse cx="42" cy="26" rx="8" ry="4" fill={fg} opacity=".55" transform="rotate(25 42 26)" />
        </>
      );
    case "mushroom":
      return (
        <>
          <path d="M11 35 C 11 17 53 17 53 35 Z" fill={fg} />
          <rect x="26" y="35" width="12" height="15" rx="5" fill={fg} opacity=".85" />
          <circle cx="24" cy="29" r="2.6" fill="#1e3a2e" fillOpacity=".45" />
          <circle cx="38" cy="27" r="2.2" fill="#1e3a2e" fillOpacity=".45" />
        </>
      );
    case "sprout":
      return (
        <>
          <path d="M32 52 L32 28" stroke={fg} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M32 31 C 32 18 20 14 12 17 C 13 28 22 33 32 31 Z" fill={fg} />
          <path d="M32 27 C 32 15 44 11 52 14 C 51 25 42 30 32 27 Z" fill={fg} opacity=".85" />
        </>
      );
  }
}

/** A round garden avatar. Pass the saved id (like "moon:rose") and the name as a fallback seed. */
export default function Avatar({
  id,
  name = "",
  size = 40,
  label,
}: {
  id?: string | null;
  name?: string;
  size?: number;
  label?: string;
}) {
  const gid = useId();
  const { shape, palette } = parseAvatar(id, name);
  const p = PALETTES[palette];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="shrink-0 rounded-full"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg[0]} />
          <stop offset="1" stopColor={p.bg[1]} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#${gid})`} />
      <Symbol shape={shape} fg={p.fg} />
    </svg>
  );
}
