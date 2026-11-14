import { useId } from "react";

type Props = { size?: number; glow?: boolean; className?: string };

const WING_UP = "M58 62 C 38 52 20 36 12 10 C 40 12 58 34 58 62 Z";
const WING_LO = "M58 66 C 44 69 30 80 24 100 C 46 98 58 86 58 66 Z";
const VEINS = "M58 62 Q 38 40 12 10 M58 66 Q 44 80 24 100";

/** The Sylph spirit: leaf-wings around a glowing core, with a vine tail. */
export default function SylphIcon({ size = 56, glow = true, className }: Props) {
  const uid = useId();
  const up = `${uid}-up`;
  const lo = `${uid}-lo`;
  const halo = `${uid}-halo`;

  return (
    <span
      className={className}
      style={{
        width: size * 1.7,
        height: size * 1.7,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 40%, var(--deep) 0%, var(--night) 85%)",
        boxShadow: glow ? "0 0 40px 4px rgb(212 224 138 / 0.2)" : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        role="img"
        aria-label="Sylph"
      >
        <defs>
          <radialGradient
            id={halo}
            cx="60"
            cy="62"
            r="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#e6eda0" stopOpacity="0.65" />
            <stop offset="1" stopColor="#e6eda0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={up} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3e5a3f" />
            <stop offset="1" stopColor="#6b7f67" />
          </linearGradient>
          <linearGradient id={lo} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3e5a3f" />
            <stop offset="1" stopColor="#2c4a36" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="62" r="34" fill={`url(#${halo})`} />
        {[false, true].map((mirror) => (
          <g
            key={String(mirror)}
            transform={mirror ? "translate(120 0) scale(-1 1)" : undefined}
          >
            <path d={WING_UP} fill={`url(#${up})`} />
            <path d={WING_LO} fill={`url(#${lo})`} />
            <path
              d={VEINS}
              fill="none"
              stroke="#c7cbb8"
              strokeOpacity="0.75"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path
          d="M60 72 C 60 88 52 96 58 108 C 62 115 72 112 70 105"
          fill="none"
          stroke="#6b7f67"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="60" cy="62" r="8" fill="#e6eda0" />
        <circle cx="60" cy="62" r="4" fill="#f7fad0" />
      </svg>
    </span>
  );
}
