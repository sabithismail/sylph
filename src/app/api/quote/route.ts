import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import { CARE_MESSAGE, DEMO_QUOTE, RISK, buildQuotePrompts, parseQuoteRequest } from "@/lib/quotes";

export const runtime = "nodejs";
export const maxDuration = 60;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
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
  const parsed = parseQuoteRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (RISK.test(parsed.req.past)) return NextResponse.json({ care: true, message: CARE_MESSAGE });

  const key = process.env.GEMINI_API_KEY || process.env.SYLPH_API_KEY;
  if (!key) return NextResponse.json({ demo: true, quote: DEMO_QUOTE });

  const { system, user } = buildQuotePrompts(parsed.req);
  const out = await generateJson({
    key,
    system,
    user,
    properties: { quote: { type: "STRING" } },
    maxOutputTokens: 600,
    perTryMs: 12_000,
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
  return NextResponse.json({ quote: String(out.json.quote ?? "").trim() });
}
