export type PoemForm =
  | "free"
  | "sonnet"
  | "haiku"
  | "limerick"
  | "ballad"
  | "ode"
  | "elegy"
  | "couplets";

export type FormInfo = {
  id: PoemForm;
  name: string;
  blurb: string;
  /** Set when the form has a fixed number of lines. */
  fixedLines?: number;
  min: number;
  max: number;
  defaultLines: number;
};

export const FORMS: FormInfo[] = [
  { id: "free", name: "Free verse", blurb: "No rhyme, no rules. Just your voice.", min: 4, max: 30, defaultLines: 12 },
  { id: "sonnet", name: "Sonnet", blurb: "Fourteen careful lines with a turn near the end.", fixedLines: 14, min: 14, max: 14, defaultLines: 14 },
  { id: "haiku", name: "Haiku", blurb: "Three short lines, five, seven, five.", fixedLines: 3, min: 3, max: 3, defaultLines: 3 },
  { id: "limerick", name: "Limerick", blurb: "Five playful lines that rhyme A, A, B, B, A.", fixedLines: 5, min: 5, max: 5, defaultLines: 5 },
  { id: "ballad", name: "Ballad", blurb: "A story told in rhymed four-line verses.", min: 8, max: 32, defaultLines: 12 },
  { id: "ode", name: "Ode", blurb: "A song of praise to something that mattered.", min: 8, max: 30, defaultLines: 14 },
  { id: "elegy", name: "Elegy", blurb: "A quiet poem for something or someone lost.", min: 8, max: 30, defaultLines: 12 },
  { id: "couplets", name: "Couplets", blurb: "Pairs of lines that rhyme, steady as footsteps.", min: 6, max: 30, defaultLines: 10 },
];

export const GRAMMAR: { level: 1 | 2 | 3 | 4 | 5; name: string; hint: string; prompt: string }[] = [
  {
    level: 1,
    name: "Student",
    hint: "Plain words and short lines, the way a student writes.",
    prompt:
      "Use very simple, everyday words and short plain sentences, like a thoughtful school student. Keep the grammar basic and the images easy to picture.",
  },
  {
    level: 2,
    name: "Everyday",
    hint: "Warm, simple language anyone can follow.",
    prompt:
      "Use clear, conversational language with simple structure. Avoid rare words and long sentences.",
  },
  {
    level: 3,
    name: "Polished",
    hint: "Clean grammar with some imagery.",
    prompt:
      "Use correct grammar, natural phrasing and a few well-chosen images and metaphors.",
  },
  {
    level: 4,
    name: "Literary",
    hint: "Richer vocabulary and layered metaphor.",
    prompt:
      "Use refined vocabulary, varied sentence structure and layered metaphor, as in published literary poetry.",
  },
  {
    level: 5,
    name: "Master poet",
    hint: "Dense, elegant, carefully crafted language.",
    prompt:
      "Write like an accomplished poet: precise diction, sophisticated syntax, fresh imagery, careful sound and rhythm.",
  },
];

export type PoemRequest = {
  story: string;
  form: PoemForm;
  lines: number;
  grammar: 1 | 2 | 3 | 4 | 5;
  oldEnglish: boolean;
};

export const STORY_MIN = 10;
export const STORY_MAX = 2000;

export function formInfo(id: PoemForm): FormInfo {
  return FORMS.find((f) => f.id === id) ?? FORMS[0];
}

export function parseRequest(
  body: unknown,
): { ok: true; req: PoemRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Bad request." };
  const b = body as Record<string, unknown>;

  const story = typeof b.story === "string" ? b.story.trim() : "";
  if (story.length < STORY_MIN)
    return { ok: false, error: "Tell Sylph a little more, even a sentence or two." };
  if (story.length > STORY_MAX)
    return { ok: false, error: `Please keep your story under ${STORY_MAX} characters.` };

  const info = FORMS.find((f) => f.id === b.form);
  if (!info) return { ok: false, error: "Choose a poem form." };

  const grammar = Number(b.grammar);
  if (![1, 2, 3, 4, 5].includes(grammar)) return { ok: false, error: "Choose a grammar level." };

  const rawLines = Math.round(Number(b.lines));
  const lines = info.fixedLines ?? Math.min(info.max, Math.max(info.min, Number.isFinite(rawLines) ? rawLines : info.defaultLines));

  return {
    ok: true,
    req: {
      story,
      form: info.id,
      lines,
      grammar: grammar as PoemRequest["grammar"],
      oldEnglish: b.oldEnglish === true,
    },
  };
}

/** Words that suggest the writer may be in danger. Matched on the server. */
export const RISK =
  /\b(kill myself|killing myself|end my life|ending my life|suicide|suicidal|want to die|wanna die|don'?t want to live|better off dead|hurt myself|harm myself|self[- ]?harm|cut myself)\b/i;

export const CARE_MESSAGE =
  "What you wrote sounds very heavy, and I'm glad you put it into words. A poem can't hold this alone. If you might hurt yourself, please reach out to someone now. In India, Tele-MANAS is free at 14416, any time. If you are in immediate danger, call your local emergency number. When you feel ready, Sylph will be here to write something softer with you.";

export const DEMO_POEM = {
  title: "A Small Light",
  poem: `Even the longest night
keeps a seed beneath its coat.
Rain taps the window, patient,
asking nothing, teaching hope.

What broke you made a doorway.
Something green leans in the gap,
a root that learned to travel
through the dark, and found the sky.`,
};

export function buildPrompts(r: PoemRequest) {
  const info = formInfo(r.form);
  const grammar = GRAMMAR.find((g) => g.level === r.grammar) ?? GRAMMAR[2];

  const system = [
    "You are Sylph, a gentle garden spirit who writes poems with people about what they have lived through.",
    "Treat the person's story with care. Honor the pain without denying it, and let the poem move toward calm and a quiet, honest hope. Never glamorize self-harm or violence, and never describe methods.",
    "Draw on nature imagery (gardens, rain, roots, seasons, light) wherever it fits naturally.",
    "Write an original poem. Do not copy existing poems or song lyrics. Do not invent names or facts that are not in the story.",
    'Reply with JSON only: {"title": string, "poem": string}. In "poem", separate lines with \\n and stanzas with a blank line. Do not add commentary.',
  ].join(" ");

  const rules = [
    `Form: ${info.name}. ${info.blurb}`,
    `Length: exactly ${r.lines} lines.`,
    r.form === "haiku" ? "Follow a 5-7-5 syllable pattern." : "",
    r.form === "sonnet" ? "Use a Shakespearean rhyme scheme (ABAB CDCD EFEF GG) with a turn in the final couplet." : "",
    r.form === "limerick" ? "Follow an AABBA rhyme scheme with a light, gentle tone." : "",
    r.form === "ballad" ? "Use four-line stanzas with an ABCB or ABAB rhyme scheme." : "",
    r.form === "couplets" ? "Rhyme every two lines (AABBCC...)." : "",
    `Language level ${r.grammar} of 5 (${grammar.name}): ${grammar.prompt}`,
    r.oldEnglish
      ? "Write in old English style: Early Modern English diction such as thee, thou, thy, hath, doth and -eth verb endings, used consistently."
      : "Write in natural modern English.",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `${rules}\n\nThe person's story, to turn into a poem:\n"""\n${r.story}\n"""`;
  return { system, user };
}
