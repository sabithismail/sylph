import { NextResponse } from "next/server";
import {
  CARE_MESSAGE,
  DEMO_POEM,
  RISK,
  buildPrompts,
  parseRequest,
} from "@/lib/poem";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// Best-effort per-IP limit so the free quota is not drained by one visitor.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "Sylph needs a breath. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request didn't look right." }, { status: 400 });
  }

  const parsed = parseRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (RISK.test(parsed.req.story)) {
    return NextResponse.json({ care: true, message: CARE_MESSAGE });
  }

  const key = process.env.GEMINI_API_KEY || process.env.SYLPH_API_KEY;
  if (!key) {
    return NextResponse.json({ demo: true, ...DEMO_POEM });
  }

  const { system, user } = buildPrompts(parsed.req);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: ctrl.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 1500,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: { title: { type: "STRING" }, poem: { type: "STRING" } },
              required: ["title", "poem"],
            },
          },
        }),
      },
    );

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Sylph's writing well is busy right now. Please try again in a little while." },
        { status: 429 },
      );
    }
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 400);
      console.error(`[write] Gemini ${res.status} model=${MODEL}: ${detail}`);
      return NextResponse.json(
        { error: "Sylph couldn't reach the words just now. Please try again." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    let title = "Untitled";
    let poem = text.trim();
    try {
      const j = JSON.parse(text) as { title?: string; poem?: string };
      if (j.poem) {
        poem = j.poem.trim();
        title = (j.title ?? "Untitled").trim();
      }
    } catch {
      /* fall back to the raw text */
    }

    if (!poem) {
      return NextResponse.json(
        { error: "Sylph came back with empty hands. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ title, poem });
  } catch {
    return NextResponse.json(
      { error: "That took too long. Please try again." },
      { status: 504 },
    );
  } finally {
    clearTimeout(timer);
  }
}
