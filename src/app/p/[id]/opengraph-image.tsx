import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPublicPost, excerpt } from "@/lib/publicPost";
import { TEMPLATES } from "@/lib/styles";

export const runtime = "nodejs";
export const alt = "A piece written with Sylph";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BASE: Record<string, string> = {
  moonlit: "#12251c",
  parchment: "#efe0bb",
  midnight: "#0c1226",
  rose: "#5b2a49",
  linen: "#dde4cf",
  golden: "#f6b36b",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublicPost(id);
  const font = await readFile(join(process.cwd(), "assets/caveat-600.woff"));
  const tpl = TEMPLATES.find((t) => t.id === post?.template) ?? TEMPLATES[0];
  const text = post ? excerpt(post.body, post.kind === "quote" ? 200 : 230) : "A garden spirit that turns your past into something gentle.";
  const fs = text.length > 170 ? 44 : text.length > 110 ? 54 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: BASE[tpl.id] ?? BASE.moonlit,
          color: tpl.text.high,
          fontFamily: "Caveat",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {post && post.kind !== "quote" && post.title ? (
            <div style={{ fontSize: 60, color: tpl.accent, lineHeight: 1.1 }}>{post.title}</div>
          ) : null}
          <div style={{ fontSize: fs, lineHeight: 1.3 }}>{text}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, color: tpl.text.normal }}>
          <div style={{ display: "flex" }}>{post ? `— ${post.author_name}` : ""}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: tpl.accent }}><div style={{ width: 16, height: 16, borderRadius: 8, background: tpl.accent }} />written with Sylph</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Caveat", data: font, weight: 600, style: "normal" }] },
  );
}
