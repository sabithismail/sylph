export type Contrast = "soft" | "normal" | "high";

export type Template = {
  id: string;
  name: string;
  bg: string;
  text: Record<Contrast, string>;
  accent: string;
  border: string;
  shadow: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "moonlit",
    name: "Moonlit Garden",
    bg: "radial-gradient(60% 50% at 80% 10%, #2c4a38 0%, transparent 70%), radial-gradient(40% 40% at 10% 90%, #274433 0%, transparent 70%), #12251c",
    text: { soft: "#9fae9b", normal: "#c7cbb8", high: "#f1f3e8" },
    accent: "#e6eda0",
    border: "#3e5a3f",
    shadow: "0 20px 60px -20px rgba(230,237,160,.25)",
  },
  {
    id: "parchment",
    name: "Old Parchment",
    bg: "radial-gradient(80% 60% at 50% 0%, #f6ecd2 0%, #ecdcb4 100%)",
    text: { soft: "#7a6745", normal: "#4a3a22", high: "#21170a" },
    accent: "#a8741a",
    border: "#c9b17a",
    shadow: "0 20px 50px -25px rgba(90,60,10,.5)",
  },
  {
    id: "midnight",
    name: "Midnight Ink",
    bg: "radial-gradient(50% 40% at 20% 15%, #24305a 0%, transparent 70%), radial-gradient(40% 30% at 85% 80%, #1c2748 0%, transparent 70%), #0c1226",
    text: { soft: "#97a3c7", normal: "#cfd6ee", high: "#ffffff" },
    accent: "#9db4ff",
    border: "#2a3768",
    shadow: "0 20px 60px -20px rgba(120,150,255,.3)",
  },
  {
    id: "rose",
    name: "Rose Dusk",
    bg: "linear-gradient(160deg, #3b1c34 0%, #5b2a49 55%, #7c3b57 100%)",
    text: { soft: "#d3a9bb", normal: "#f3d6df", high: "#fff5f8" },
    accent: "#ffb6c8",
    border: "#8a4a68",
    shadow: "0 20px 60px -20px rgba(255,150,180,.3)",
  },
  {
    id: "linen",
    name: "Sage Linen",
    bg: "linear-gradient(170deg, #e8eddc 0%, #d3dcc3 100%)",
    text: { soft: "#5f7157", normal: "#2c3d2a", high: "#0f1a0e" },
    accent: "#4f7a47",
    border: "#aebd9a",
    shadow: "0 20px 50px -25px rgba(40,70,35,.45)",
  },
  {
    id: "golden",
    name: "Golden Hour",
    bg: "linear-gradient(165deg, #ffe3a8 0%, #f6b36b 55%, #d97a52 100%)",
    text: { soft: "#7a4a2a", normal: "#4a2512", high: "#240e04" },
    accent: "#8a2f12",
    border: "#e0955a",
    shadow: "0 20px 50px -25px rgba(150,60,20,.5)",
  },
];

export type FontChoice = {
  id: string;
  name: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
  /** Multiplier so every face reads at a similar size. */
  scale: number;
};

export const FONTS: FontChoice[] = [
  { id: "caveat", name: "Caveat", family: '"Caveat", cursive', weight: 600, style: "normal", scale: 1.15 },
  { id: "dancing", name: "Dancing Script", family: '"Dancing Script", cursive', weight: 600, style: "normal", scale: 1.05 },
  { id: "vibes", name: "Great Vibes", family: '"Great Vibes", cursive', weight: 400, style: "normal", scale: 1.25 },
  { id: "playfair", name: "Playfair", family: '"Playfair Display", serif', weight: 400, style: "italic", scale: 0.95 },
  { id: "cormorant", name: "Cormorant", family: '"Cormorant Garamond", serif', weight: 500, style: "italic", scale: 1.2 },
  { id: "lora", name: "Lora", family: '"Lora", serif', weight: 400, style: "italic", scale: 0.95 },
  { id: "fell", name: "Old English", family: '"IM Fell English", serif', weight: 400, style: "normal", scale: 1.05 },
];

export const CONTRASTS: { id: Contrast; name: string }[] = [
  { id: "soft", name: "Soft" },
  { id: "normal", name: "Normal" },
  { id: "high", name: "High" },
];
