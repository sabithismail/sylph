"use client";

import { toBlob } from "html-to-image";
import { useEffect, useId, useRef, useState } from "react";
import StyledCard from "./StyledCard";
import PostPanel from "./PostPanel";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
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


  const plain = `${title && kind !== "quote" ? title + "\n\n" : ""}${text}`;
  const site = typeof window === "undefined" ? "" : window.location.origin;
  const message = (max: number) => {
    const tail = `\n\n- written with Sylph ${site}`;
    const body = plain.length > max - tail.length ? plain.slice(0, max - tail.length - 1) + "…" : plain;
    return body + tail;
  };
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  function flash(m: string) {
    setNote(m);
    setTimeout(() => setNote(""), 3500);
  }

  async function shareImage() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2, cacheBust: true });
      if (!blob) throw new Error("no image");
      const file = new File([blob], "sylph.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: "Written with Sylph" });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sylph.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      flash("Saved as an image. Post it on Instagram or anywhere you like.");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        flash("Couldn't make the image on this device. Try a screenshot of the card.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(message(5000));
      flash("Copied.");
    } catch {
      flash("Copy isn't available here.");
    }
  }

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm text-mist transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.97] ${on ? "border-glow bg-moss" : "border-stone"}`;

  return (
    <section aria-labelledby={`${uid}-h`} className="flex flex-col gap-5">
      <h3 id={`${uid}-h`} className="text-2xl text-mist" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        Dress it up
      </h3>

      <StyledCard ref={cardRef} title={title} text={text} kind={kind} template={t} font={f} contrast={c} />

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

      <div className="flex flex-col gap-3 border-t border-stone pt-5">
        <p className="text-sm text-mist">Share</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(false)} onClick={() => open(`https://wa.me/?text=${encodeURIComponent(message(3000))}`)}>WhatsApp</button>
          <button type="button" className={chip(false)} onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message(270))}`)}>X</button>
          <button type="button" className={chip(false)} onClick={() => open(`https://t.me/share/url?url=${encodeURIComponent(site || "https://sylph.app")}&text=${encodeURIComponent(plain.slice(0, 3500))}`)}>Telegram</button>
          <button type="button" className={chip(false)} onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(site)}&quote=${encodeURIComponent(plain.slice(0, 500))}`)}>Facebook</button>
          <button type="button" className={chip(false)} onClick={shareImage} disabled={busy}>{busy ? "Making image…" : "Image / Instagram"}</button>
          <button type="button" className={chip(false)} onClick={copyAll}>Copy text</button>
        </div>
        <p className="text-sm text-sage" role="status" aria-live="polite">{note}</p>
      </div>
      <PostPanel kind={kind} title={title ?? ""} text={text} template={t} font={f} contrast={c} />
    </section>
  );
}
