---
updated: 2026-05-31
status: canonical
description: "Baseline accessibility (WCAG 2.x AA) for any user-facing surface — the non-negotiable floor plus how to verify it."
---

# Standards — accessibility

Applies to every user-facing surface (web, desktop UI). Target: **WCAG 2.2 level AA**. Accessibility
is part of Definition of Done for UI work, not a later pass — it is cheapest built in and most
expensive retrofitted.

## The non-negotiable floor

- **Semantic HTML first.** Use the right element (`button`, `a`, `nav`, `main`, `label`, `table`).
  A `div` with a click handler is not a button — it loses keyboard, focus, and screen-reader
  semantics. Reach for ARIA only when no native element fits, and prefer a native one.
- **Keyboard operable.** Every interactive control is reachable and operable by keyboard alone, in a
  logical tab order, with a **visible focus indicator**. No keyboard trap. Test by unplugging the
  mouse.
- **Labels & names.** Every input has an associated `<label>`; every icon-only control has an
  accessible name (`aria-label`); every meaningful image has `alt` (decorative → `alt=""`).
- **Contrast.** Text ≥ 4.5:1 (≥ 3:1 for large text); UI/graphics ≥ 3:1. Don't encode meaning by
  **color alone** — pair it with text, icon, or pattern.
- **Forms & errors.** Errors are announced (not color-only), tied to their field
  (`aria-describedby`), and the message says how to fix it. Don't disable submit silently.
- **Structure.** One `h1`; headings nest without skipping. Landmarks (`main`, `nav`) so AT users can
  jump. Page has a sensible `<title>` and `lang`.
- **Motion & media.** Respect `prefers-reduced-motion`; no content flashes > 3×/sec; captions/text
  alternatives for audio/video.
- **Targets & zoom.** Touch targets ≥ 24×24 CSS px; layout survives 200% zoom and 320px width
  (reflow, no horizontal scroll).
- **Live regions.** Dynamic updates (toasts, async results) use `aria-live` so they are announced.

## Internationalization note

If the app is localized (e.g. Thai-first), set `lang` correctly, don't hardcode LTR assumptions, and
don't build strings by concatenation — these intersect with screen-reader correctness.

## Verify it (not by eye alone)

1. **Automated:** run an axe-based check (axe-core / Playwright `@axe-core/playwright` / Lighthouse)
   in CI for key pages. Catches ~40% of issues — necessary, not sufficient.
2. **Keyboard pass:** tab through the whole flow; confirm order, focus visibility, no trap.
3. **Screen reader smoke:** one pass with VoiceOver/NVDA on the primary flow.
4. **Zoom/reflow:** 200% zoom + 320px width with no loss of content or function.

The `ecc:frontend-a11y` skill (`skills/catalog.md`) automates much of the audit; this standard is the
floor it audits against. For UI work, an a11y check is part of the verifier's review
(`rules/30-verification.md`).
