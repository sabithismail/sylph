"use client";

import "@fontsource/great-vibes/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/im-fell-english/400.css";
import type { Ref } from "react";
import { FONTS, TEMPLATES, type Contrast } from "@/lib/styles";

/** A poem, story or quote drawn in a chosen template, font and contrast. */
export default function StyledCard({
  title,
  text,
  kind,
  template,
  font: fontId,
  contrast,
  ref,
  compact,
}: {
  title?: string;
  text: string;
  kind: "poem" | "story" | "quote";
  template: string;
  font: string;
  contrast: Contrast;
  ref?: Ref<HTMLDivElement>;
  compact?: boolean;
}) {
  const tpl = TEMPLATES.find((x) => x.id === template) ?? TEMPLATES[0];
  const font = FONTS.find((x) => x.id === fontId) ?? FONTS[0];
  const base = kind === "story" ? 1.2 : kind === "quote" ? 1.9 : 1.4;
  const size = `${((compact ? base * 0.85 : base) * font.scale).toFixed(2)}rem`;
  const face = { fontFamily: font.family, fontStyle: font.style } as const;

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-4 overflow-hidden rounded-3xl border ${compact ? "p-6" : "p-7 sm:p-10"}`}
      style={{ background: tpl.bg, borderColor: tpl.border, boxShadow: tpl.shadow }}
    >
      {title && kind !== "quote" && (
        <p
          style={{
            ...face,
            fontWeight: font.weight,
            fontSize: `${(2 * font.scale * (compact ? 0.85 : 1)).toFixed(2)}rem`,
            lineHeight: 1.15,
            color: tpl.accent,
          }}
        >
          {title}
        </p>
      )}
      <p
        className="whitespace-pre-wrap"
        style={{
          ...face,
          fontWeight: contrast === "high" ? Math.min(700, font.weight + 100) : font.weight,
          fontSize: size,
          lineHeight: 1.45,
          color: tpl.text[contrast],
        }}
      >
        {text}
      </p>
      <p
        className="mt-2 flex items-center gap-2 text-sm"
        style={{ color: tpl.text.soft, fontFamily: '"Dancing Script", cursive', fontWeight: 600 }}
      >
        <span aria-hidden="true" style={{ color: tpl.accent }}>✦</span> written with Sylph
      </p>
    </div>
  );
}
