const FIREFLIES = [
  { left: "11%", top: "72%", size: 8, delay: 0 },
  { left: "24%", top: "28%", size: 6, delay: -2 },
  { left: "37%", top: "84%", size: 7, delay: -4 },
  { left: "67%", top: "78%", size: 8, delay: -1 },
  { left: "78%", top: "24%", size: 6, delay: -5 },
  { left: "90%", top: "58%", size: 7, delay: -3 },
  { left: "48%", top: "14%", size: 5, delay: -6 },
];

const LEAVES = [
  { left: "14%", delay: 0, size: 26 },
  { left: "55%", delay: -7, size: 20 },
  { left: "84%", delay: -12, size: 24 },
];

/** Drifting fireflies and falling leaves. Purely decorative. */
export default function Ambient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
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
          className="sy-firefly"
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            boxShadow: `0 0 ${f.size * 2}px ${f.size * 0.8}px rgb(214 228 130 / 0.5)`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
