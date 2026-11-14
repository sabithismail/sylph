type Props = { className?: string };

/** "Sylph" in script with a vine curling under the letters. */
export default function SylphWordmark({ className }: Props) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}
    >
      <span
        style={{
          fontFamily: "var(--font-script)",
          fontWeight: 700,
          fontSize: "2.4rem",
          color: "var(--mist)",
        }}
      >
        Sylph
      </span>
      <svg
        viewBox="0 0 160 22"
        width="100%"
        height="14"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M4 4 C 4 20 30 22 52 14 C 78 5 108 20 150 10"
          fill="none"
          stroke="#6b7f67"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M44 17 C 41 9 49 5 56 8 C 55 14 50 17 44 17 Z" fill="#3e5a3f" />
        <path d="M96 15 C 94 7 102 4 109 7 C 108 13 103 16 96 15 Z" fill="#6b7f67" />
        <circle cx="152" cy="9" r="3.2" fill="#e6eda0" />
      </svg>
    </span>
  );
}
