/** A tiny winged firefly that marks the creator of Sylph. */
export default function OwnerMark({ size = 18, label = false }: { size?: number; label?: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 align-middle" title="Creator of Sylph">
      <svg width={size} height={size} viewBox="0 0 24 24" className="sy-owner" role="img" aria-label="Creator of Sylph">
        <ellipse cx="7.5" cy="9" rx="5.5" ry="2.8" transform="rotate(-28 7.5 9)" fill="#c7cbb8" opacity=".75" />
        <ellipse cx="16.5" cy="9" rx="5.5" ry="2.8" transform="rotate(28 16.5 9)" fill="#c7cbb8" opacity=".75" />
        <circle cx="12" cy="14.5" r="4.2" fill="#e6eda0" />
        <circle cx="12" cy="14.5" r="2" fill="#fbfde0" />
      </svg>
      {label && <span className="text-sm text-glow" style={{ fontFamily: "var(--font-hand)", fontSize: "1.15rem" }}>Creator</span>}
    </span>
  );
}
