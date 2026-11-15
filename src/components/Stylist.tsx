"use client";

import "@fontsource/great-vibes/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/im-fell-english/400.css";
import { useEffect, useId, useState } from "react";
import { CONTRASTS, FONTS, TEMPLATES, type Contrast } from "@/lib/styles";

const KEY = "sylph-style";

type Saved = { t: string; f: string; c: Contrast };

/** Template, font and contrast pickers with a live preview card. */
export default function Stylist({
  title,
  text,
  kind,
}: {
  title?: string;
  text: string;
  kind: "poem" | "story" | "quote";
}) {
  const uid = useId();
  const [t, setT] = useState(TEMPLATES[0].id);
  const [f, setF] = useState(kind === "story" ? "lora" : FONTS[0].id);
  const [c, setC] = useState<Contrast>("normal");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw) as Partial<Saved>;
      if (TEMPLATES.some((x) => x.id === s.t)) setT(s.t!);
      if (FONTS.some((x) => x.id === s.f)) setF(s.f!);
      if (CONTRASTS.some((x) => x.id === s.c)) setC(s.c!);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ t, f, c }));
    } catch {
      /* storage unavailable */
    }
  }, [t, f, c]);

  const tpl = TEMPLATES.find((x) => x.id === t) ?? TEMPLATES[0];
  const font = FONTS.find((x) => x.id === f) ?? FONTS[0];
  const color = tpl.text[c];
  const base = kind === "story" ? 1.2 : kind === "quote" ? 1.9 : 1.4;
  const size = `${(base * font.scale).toFixed(2)}rem`;

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${on ? "border-glow bg-moss" : "border-stone"}`;

  return (
    <section aria-labelledby={`${uid}-h`} className="flex flex-col gap-5">
      <h3 id={`${uid}-h`} className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        Dress it up
      </h3>

      <div
        className="flex flex-col gap-4 overflow-hidden rounded-3xl border p-7 sm:p-10"
        style={{ background: tpl.bg, borderColor: tpl.border, boxShadow: tpl.shadow }}
      >
        {title && kind !== "quote" && (
          <p
            style={{
              fontFamily: font.family,
              fontWeight: font.weight,
              fontStyle: font.style,
              fontSize: `${(2 * font.scale).toFixed(2)}rem`,
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
            fontFamily: font.family,
            fontWeight: c === "high" ? Math.min(700, font.weight + 100) : font.weight,
            fontStyle: font.style,
            fontSize: size,
            lineHeight: 1.45,
            color,
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

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-mist">Template</legend>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((x) => (
            <button key={x.id} type="button" aria-pressed={t === x.id} onClick={() => setT(x.id)} className={chip(t === x.id)}>
              <span aria-hidden="true" className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: x.accent }} />
              {x.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-mist">Font</legend>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={f === x.id}
              onClick={() => setF(x.id)}
              className={chip(f === x.id)}
              style={{ fontFamily: x.family, fontStyle: x.style, fontSize: "1.05rem" }}
            >
              {x.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-mist">Contrast</legend>
        <div className="flex gap-2">
          {CONTRASTS.map((x) => (
            <button key={x.id} type="button" aria-pressed={c === x.id} onClick={() => setC(x.id)} className={chip(c === x.id)}>
              {x.name}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
