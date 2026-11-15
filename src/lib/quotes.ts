import { CARE_MESSAGE, CRAFT, RISK } from "./poem";

export { CARE_MESSAGE, RISK };

/** Original lines written for Sylph. */
export const QUOTES: string[] = [
  "Some grief never leaves; it only learns to sit quietly beside you, like an old tree.",
  "The wound taught the root where to reach; the water was always deeper than the pain.",
  "We are not healed by forgetting the storm, but by learning what the rain made of us.",
  "Autumn does not mourn its leaves; it knows the bare branch is preparing a larger sky.",
  "Late bloomers understand something early flowers never learn: how much light is worth waiting for.",
  "A river carries every stone it has ever met, and calls it a shape.",
  "The moon is never whole to us, yet no one calls it broken.",
  "What you buried in silence is still growing; give it light, not shame.",
  "Even a frozen lake is quietly holding a whole summer beneath its surface.",
  "Some people leave like tides, and the shore spends years learning its own shape.",
  "Strength is rarely a roar; more often it is a seed deciding to open in the dark.",
  "The forest remembers every fire, and still it chooses green.",
  "To love something that left is to keep a lantern lit for a door that is closed.",
  "You were never a ruin; you were a garden between seasons.",
  "Rain falls on the guilty and the grieving alike, and the soil forgives both.",
  "Not every ending is a fall; some leaves simply finish what the summer began.",
  "The deepest roots grow where the ground gave the least.",
  "Tenderness survives the harshest winters by hiding in small, stubborn places, like a bud under snow.",
  "Between who you were and who you are becoming lies a long, quiet dusk. Rest there.",
  "The sea does not apologize for its depth; neither should you for the weight you carry.",
  "Dawn never argues with the dark; it only keeps arriving until the dark has nothing left to say.",
  "Some wounds heal like riverbanks, not by closing but by becoming part of how the water flows.",
  "Every scar is a place where the earth remembered how to hold itself together.",
  "Loneliness is a field before planting: wide, silent, and quietly full of what could grow.",
  "Let your sorrow fall like leaves: honestly, slowly, and without apology to the tree.",
  "A candle does not lose itself by lighting another, and neither does a hurt heart by forgiving.",
  "The mountain is only a patient stone that never stopped climbing.",
  "You can mourn the summer and still welcome the snow; the heart has room for both seasons.",
  "The stars you miss were burning long before you looked, and will burn long after the night.",
  "Quietly, the broken branch grows new green where it once held the whole sky.",
  "Some mornings, survival is just opening the curtains the way a flower opens to a weak sun.",
  "Memory is a garden; you may tend the roses and still honor the thorns.",
];

export const DEMO_QUOTE =
  "Even the longest night keeps a seed beneath its coat, waiting for rain.";

export type QuoteRequest = { past: string };

export function parseQuoteRequest(
  body: unknown,
): { ok: true; req: QuoteRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Bad request." };
  const past = typeof (body as Record<string, unknown>).past === "string"
    ? ((body as Record<string, unknown>).past as string).trim()
    : "";
  if (past.length < 10) return { ok: false, error: "Tell Sylph a little more, even a sentence or two." };
  if (past.length > 1200) return { ok: false, error: "Please keep it under 1200 characters." };
  return { ok: true, req: { past } };
}

export function buildQuotePrompts(r: QuoteRequest) {
  const system = [
    "You are Sylph, a gentle garden spirit who turns a hard memory into a quote that comforts.",
    "Write ONE original quote of one or two short lines, 8 to 20 words in total (never fewer than 8, never more than 20). Make it deep: a truth about grief, memory or healing that a reader would want to underline, not a slogan. It must carry a clear nature metaphor (rain, roots, seasons, moon, river, seed, light).",
    "Aim for the depth of an aphorism by a great poet: compress a whole feeling into one surprising image, with a quiet paradox or turn. Take one concrete detail from the person's experience and let it become the nature image, so the quote could only have come from this person. Name the hurt honestly, then turn gently. It should feel like an aphorism a poet would underline: a surprising image, a quiet paradox, an ache with a little light at the edge. No generic uplift, no 'you are strong' or 'everything happens for a reason'.",
    "Do not quote existing authors. Never mention methods of self-harm. No hashtags or emojis.",
    CRAFT,
    'Reply with JSON only: {"quote": string}.',
  ].join(" ");
  return { system, user: `The person's experience:\n"""\n${r.past}\n"""` };
}
