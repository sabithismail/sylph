export const SHAPES = ["moon", "leaf", "flower", "firefly", "mushroom", "sprout"] as const;
export type Shape = (typeof SHAPES)[number];

export const PALETTES = {
  moss: { name: "Moss", bg: ["#3e5a3f", "#1e3a2e"], fg: "#e6eda0" },
  rose: { name: "Rose", bg: ["#7c3b57", "#3b1c34"], fg: "#ffb6c8" },
  night: { name: "Night", bg: ["#2a3a74", "#0c1226"], fg: "#b5c6ff" },
  amber: { name: "Amber", bg: ["#d97a52", "#7a3a1a"], fg: "#ffe3a8" },
  sage: { name: "Sage", bg: ["#a9bd96", "#4f7a47"], fg: "#f4f8e8" },
  plum: { name: "Plum", bg: ["#6b4a8a", "#2a1a40"], fg: "#e3d2ff" },
} as const;
export type PaletteId = keyof typeof PALETTES;
export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

export const SHAPE_NAMES: Record<Shape, string> = {
  moon: "Moon",
  leaf: "Leaf",
  flower: "Flower",
  firefly: "Firefly",
  mushroom: "Mushroom",
  sprout: "Sprout",
};

export function parseAvatar(id: string | null | undefined, seed = ""): { shape: Shape; palette: PaletteId } {
  const [s, p] = (id ?? "").split(":");
  if ((SHAPES as readonly string[]).includes(s) && p in PALETTES) return { shape: s as Shape, palette: p as PaletteId };
  // No choice yet: pick a stable default from the name.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return { shape: SHAPES[h % SHAPES.length], palette: PALETTE_IDS[(h >> 3) % PALETTE_IDS.length] };
}
