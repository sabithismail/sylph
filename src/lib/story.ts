import { CRAFT, GRAMMAR } from "./poem";

export type StoryVoice = "me" | "tale";

export type StoryRequest = {
  past: string;
  words: number;
  grammar: 1 | 2 | 3 | 4 | 5;
  voice: StoryVoice;
  oldEnglish: boolean;
};

export const WORDS_MIN = 100;
export const WORDS_MAX = 1000;
export const PRESETS = [
  { label: "Short", words: 150 },
  { label: "Medium", words: 400 },
  { label: "Long", words: 800 },
];

export const VOICES: { id: StoryVoice; name: string; blurb: string }[] = [
  { id: "me", name: "In my voice", blurb: "First person, as if you are telling it yourself." },
  { id: "tale", name: "As a gentle tale", blurb: "A third-person story with a garden-like feel, softly disguised." },
];

export function parseStoryRequest(
  body: unknown,
): { ok: true; req: StoryRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Bad request." };
  const b = body as Record<string, unknown>;
  const past = typeof b.past === "string" ? b.past.trim() : "";
  if (past.length < 10) return { ok: false, error: "Tell Sylph a little more, even a sentence or two." };
  if (past.length > 2000) return { ok: false, error: "Please keep it under 2000 characters." };
  const grammar = Number(b.grammar);
  if (![1, 2, 3, 4, 5].includes(grammar)) return { ok: false, error: "Choose a grammar level." };
  const w = Math.round(Number(b.words));
  const words = Math.min(WORDS_MAX, Math.max(WORDS_MIN, Number.isFinite(w) ? w : 400));
  const voice: StoryVoice = b.voice === "tale" ? "tale" : "me";
  return {
    ok: true,
    req: { past, words, grammar: grammar as StoryRequest["grammar"], voice, oldEnglish: b.oldEnglish === true },
  };
}

export const DEMO_STORY = {
  title: "The Garden After Rain",
  story: `There was a garden that nobody visited anymore. The gate had rusted, and the paths were covered in leaves.

One evening it rained, softly at first and then for hours. In the morning, a green shoot had pushed through the mud, small and stubborn, leaning toward the light.

The garden did not hurry. It had learned that healing is quiet work, done a little each day.`,
};

export function buildStoryPrompts(r: StoryRequest) {
  const g = GRAMMAR.find((x) => x.level === r.grammar) ?? GRAMMAR[2];
  const system = [
    "You are Sylph, a gentle garden spirit who turns people's past into short stories that help them heal.",
    "Honor the pain without denying it, and let the story move toward calm and a quiet, honest hope. Never glamorize self-harm or violence, and never describe methods.",
    "Use natural imagery only where it grows out of the story. Do not invent names or major facts beyond the person's account, but you may add small sensory texture.",
    "Prose craft: open in the middle of a concrete moment, not with backstory; use scene, dialogue-free gesture and sensory detail; let the narrator notice odd small things while numb; keep sentences varied, some very short; end on an image, not a lesson.",
    CRAFT,
    'Reply with JSON only: {"title": string, "story": string}. Separate paragraphs with a blank line. No commentary.',
  ].join(" ");
  const rules = [
    `Length: about ${r.words} words (within 10%).`,
    r.voice === "me"
      ? "Write in first person, in the person's own voice."
      : "Write as a gentle third-person tale, with the person's experience carried by a fitting character, true to the feelings.",
    `Language level ${r.grammar} of 5 (${g.name}): ${g.prompt}`,
    r.oldEnglish
      ? "Write in old English style: Early Modern English diction such as thee, thou, thy, hath and doth, used consistently."
      : "Write in natural modern English.",
  ].join("\n");
  return { system, user: `${rules}\n\nThe person's past, to turn into a story:\n"""\n${r.past}\n"""` };
}
