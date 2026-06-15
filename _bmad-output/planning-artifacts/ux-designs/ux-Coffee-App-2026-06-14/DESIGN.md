---
title: Coffee Connoisseur — Visual Identity
status: final
created: 2026-06-14
updated: 2026-06-14
sources:
  - prd: ../../prds/prd-Coffee-App-2026-06-14/prd.md
  - code: client/src/index.css
  - ui_system: shadcn (new-york) — components.json
colors:
  primary: "oklch(0.45 0.08 35)"        # coffee brown
  primary-foreground: "oklch(0.98 0 0)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.235 0.015 65)"
  destructive: "oklch(0.577 0.245 27)"  # approx; see index.css
  chart-1: "oklch(0.65 0.08 35)"
  chart-5: "oklch(0.25 0.06 30)"
typography:
  base: system / Tailwind default sans stack
  prose: "@tailwindcss/typography"
rounded: "0.65rem"   # --radius
spacing: Tailwind 4 default scale
components: shadcn new-york (Radix primitives)
---

# Coffee Connoisseur — Visual Identity

> **As-built capture.** This spine documents the *existing* visual identity so
> the hardening iteration stays consistent. It is not a redesign. The source of
> truth for tokens is [`client/src/index.css`](../../../../client/src/index.css);
> values here mirror it. Both spines win over any mock on conflict.

## Brand & Style
Warm, approachable, "connoisseur not snob." Coffee-forward palette (browns in the
`oklch(... 35)` hue family) on a clean white canvas. Tone is confident but
unpretentious. Imagery: high-quality coffee photography (`client/public/*.jpg` —
hero, beans, farm, tasting).

## Colors
- **Primary:** `oklch(0.45 0.08 35)` (coffee brown) — primary actions, brand accents.
- **Background/Foreground:** white `oklch(1 0 0)` / near-black warm `oklch(0.235 0.015 65)`.
- **Charts:** monochrome coffee ramp `chart-1 … chart-5` (light→dark brown).
- **Dark mode:** tokens exist (`.dark` variant) and are wired, but the app ships
  light by default (`ThemeProvider defaultTheme="light"`, `switchable` off).

## Typography
Tailwind default sans stack; long-form text uses `@tailwindcss/typography` prose.
Clear hierarchy via Tailwind text scale (no custom font import detected).

## Layout & Spacing
Tailwind 4 default spacing scale. Card-based layouts (`components/ui/card`).
Radius `0.65rem` (`--radius`) with sm/md/lg/xl derivations.

## Shapes
Rounded corners per `--radius`; shadcn elevation defaults.

## Components
Inherited from **shadcn (new-york)** over Radix — see
[component-inventory-client.md](../../../../docs/component-inventory-client.md)
for the full 60+ primitive list. Extend via Tailwind + CSS vars, never fork.

## Do's and Don'ts
- **Do** reuse existing `ui/*` primitives and the coffee-brown primary token.
- **Do** keep the light, clean canvas; photography carries the warmth.
- **Don't** introduce new fonts, palettes, or radii for the hardening work.
- **Don't** hardcode colors — reference CSS vars / Tailwind tokens.
