import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import { CARE_MESSAGE, RISK } from "@/lib/poem";
import { DEMO_STORY, buildStoryPrompts, parseStoryRequest } from "@/lib/story";

export const runtime = "nodejs";
export const maxDuration = 60;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 4;
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
  const parsed = parseStoryRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (RISK.test(parsed.req.past)) return NextResponse.json({ care: true, message: CARE_MESSAGE });

  const key = process.env.GEMINI_API_KEY || process.env.SYLPH_API_KEY;
  if (!key) return NextResponse.json({ demo: true, ...DEMO_STORY });

  const { system, user } = buildStoryPrompts(parsed.req);
  const out = await generateJson({
    key,
    system,
    user,
    properties: { title: { type: "STRING" }, story: { type: "STRING" } },
    maxOutputTokens: Math.min(4000, Math.round(parsed.req.words * 2.2) + 600),
    perTryMs: 26_000,
  });
  if (!out.ok) {
    return NextResponse.json(
      {
        error: out.busy
          ? "Sylph's writing well is very busy right now. Please try again in a minute."
          : "Sylph couldn't reach the words just now. Please try again.",
      },
      { status: out.busy ? 503 : 502 },
    );
  }
  return NextResponse.json({
    title: String(out.json.title ?? "Untitled").trim(),
    story: String(out.json.story ?? "").trim(),
  });
}
