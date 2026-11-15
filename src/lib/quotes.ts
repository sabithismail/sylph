import { CARE_MESSAGE, CRAFT, RISK } from "./poem";

export { CARE_MESSAGE, RISK };

/** Original lines written for Sylph. */
export const QUOTES: string[] = [
  "Even the tallest oak began as a quiet promise in the dark.",
  "Rain does not argue with the soil; it simply arrives, and something grows.",
  "A river never asks the mountain for permission to find the sea.",
  "Healing is not a bloom. It is the slow work of roots nobody sees.",
  "The moon forgives the night for being dark, and shines anyway.",
  "What fell from you in autumn was making room for spring.",
  "Be patient with your winter; the seeds are listening.",
  "A broken branch still remembers the sky.",
  "Not every storm has come to wreck you. Some come to water you.",
  "The garden does not hurry, and still everything is born in time.",
  "Even a crooked path through the woods ends at the light.",
  "You are allowed to grow slowly, the way moss covers old stone.",
  "The wind that bent you also taught you to hold on.",
  "Soft things survive too: petals, rain, and the heart.",
  "After the longest night, the dew still comes back.",
  "A single firefly proves the dark was never complete.",
  "Leaves fall without shame. So may your old sorrows.",
  "Some roots are deepest where the ground was hardest.",
  "The sea keeps what it loves and still returns to shore.",
  "Stillness is not the end of the song, only the pause between notes.",
  "Plant a small kindness; forests start that way.",
  "Mountains were once only patient dust.",
  "Your scars are the rings of a tree that endured.",
  "The sun never leaves; it only waits behind the clouds.",
  "To bloom late is still to bloom.",
  "Every drop of rain is the sky learning to let go.",
  "Quiet mornings are the earth's way of saying begin again.",
  "A heart that has weathered storms learns the language of rain.",
  "Even the shadow of a tree is shaped by light.",
  "Let the past be compost, and grow something green from it.",
  "A lantern does not fight the night; it simply stays lit.",
  "The tide takes only what you are ready to release.",
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
    "Write ONE original quote of one or two short lines. It must carry a clear nature metaphor (rain, roots, seasons, moon, river, seed, light).",
    "Take one concrete detail from the person's experience and let it become the nature image, so the quote could only have come from this person. Name the hurt honestly, then turn gently. It should feel like an aphorism a poet would underline: a surprising image, a quiet paradox, an ache with a little light at the edge. No generic uplift, no 'you are strong' or 'everything happens for a reason'.",
    "Do not quote existing authors. Never mention methods of self-harm. No hashtags or emojis.",
    CRAFT,
    'Reply with JSON only: {"quote": string}.',
  ].join(" ");
  return { system, user: `The person's experience:\n"""\n${r.past}\n"""` };
}
