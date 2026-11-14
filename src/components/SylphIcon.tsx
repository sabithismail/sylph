import { useId } from "react";

type Props = { size?: number; glow?: boolean; className?: string };

/** Feather-leaf mark: a leaf whose stem becomes a quill. */
export default function SylphIcon({ size = 56, glow = true, className }: Props) {
  const gid = useId();
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
        height={size * (140 / 120)}
        viewBox="0 0 120 140"
        role="img"
        aria-label="Sylph"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b7f67" />
            <stop offset="1" stopColor="#3e5a3f" />
          </linearGradient>
        </defs>
        <path
          d="M60 10 C 94 34 100 78 60 116 C 20 78 26 34 60 10 Z"
          fill={`url(#${gid})`}
        />
        <path
          d="M60 20 L60 116 C 58 128 50 134 42 138"
          fill="none"
          stroke="#c7cbb8"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M60 46 L40 36 M60 64 L34 50 M60 82 L38 68 M60 98 L44 88 M60 46 L80 36 M60 64 L86 50 M60 82 L82 68 M60 98 L76 88"
          fill="none"
          stroke="#c7cbb8"
          strokeOpacity="0.7"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
