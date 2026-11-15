const PREFERRED = process.env.GEMINI_MODEL || "gemini-flash-latest";

export type GenResult =
  | { ok: true; json: Record<string, unknown> }
  | { ok: false; busy: boolean };

/** Calls Gemini with a JSON schema, falling back across models when one is busy. */
export async function generateJson(opts: {
  key: string;
  system: string;
  user: string;
  properties: Record<string, { type: "STRING" }>;
  maxOutputTokens: number;
  perTryMs?: number;
  budgetMs?: number;
}): Promise<GenResult> {
  const models = [
    ...new Set([PREFERRED, "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"]),
  ];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    generationConfig: {
      temperature: 1.05,
      maxOutputTokens: opts.maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: opts.properties,
        required: Object.keys(opts.properties),
      },
    },
  });
  const budget = opts.budgetMs ?? 52_000;
  const started = Date.now();
  let busy = false;

  for (const model of models) {
    const left = budget - (Date.now() - started);
    if (left < 4_000) break;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(opts.perTryMs ?? 14_000, left));
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": opts.key },
          signal: ctrl.signal,
          body,
        },
      );
      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        console.error(`[gemini] ${res.status} model=${model}: ${detail}`);
        if (res.status === 429 || res.status === 503) busy = true;
        continue;
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      try {
        const json = JSON.parse(text) as Record<string, unknown>;
        if (Object.values(json).some((v) => typeof v === "string" && v.trim())) {
          return { ok: true, json };
        }
      } catch {
        /* try the next model */
      }
    } catch (e) {
      console.error(`[gemini] model=${model} failed: ${e instanceof Error ? e.name : "error"}`);
      busy = true;
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, busy };
}
