# Sylph

A garden spirit that helps you turn your past into poems, stories and quotes.

Write about what you have lived through. Sylph asks gentle questions, then writes with you: poems (sonnet, free verse, old English and more), stories, and short quotes with a touch of nature. Every piece can be restyled, edited and shared.

## Status

Early build. The intro animation, logo, theme and a home screen are in place. The writing flows, sharing, accounts and the community feed come next.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase for login and the feed
- Free-tier AI API for writing (English only for now)
- Vercel for hosting

## Design

Moonlit Garden: a dark forest palette, drifting fireflies, handwritten type.

| Color | Hex | Use |
|---|---|---|
| Night | `#0F1F17` | Background |
| Deep | `#1E3A2E` | Cards |
| Moss | `#3E5A3F` | Buttons |
| Sage | `#6B7F67` | Icons, borders |
| Mist | `#C7CBB8` | Text |
| Stone | `#3D4337` | Shadows, inputs |

Fonts: Dancing Script (titles), Caveat (poems), DM Sans (interface).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
