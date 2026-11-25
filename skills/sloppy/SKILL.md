---
name: sloppy
description: The AI slop UI & code fixer. Eliminates purple gradients, sparkle icons, boxed cards, floating frames, unearned loops, fake copy, and low-evidence TypeScript via 3-tier severity gates (Floor/Reflex/Finish), wiring guards, multi-width checks, decoupled looks, and MCP tools.
metadata:
  version: 1.5.0
---

# Sloppy: Anti-Slop Engine

Eliminate AI UI and TypeScript slop with deterministic source scanning, 3-tier severity gates, surgical fixes, 100-point craft grading, 5 MIT UI libraries, and 21 permissive (`MIT`/`Apache-2.0`) motion ecosystems.

---

## Progressive Specialist Skills (Load On-Demand Only)

Load only the specialist needed for your active domain to minimize context tokens:

| Specialist | Domain | Covered Rules |
| :--- | :--- | :--- |
| `sloppy-ui` | Surface elevation (0–3), single accent, Lucide replacement, liveliness | `VIS-01`..`03`, `VIS-06`..`08`, `MED-02`, `LIV-01` |
| `sloppy-copywriting` | 3–7 word budgets, concrete metrics, zero clichés | `CPY-01`, `CPY-02`, `CPY-04`..`07`, `TYP-08` |
| `sloppy-human` | Real product chrome, domain nouns, honest error/empty states | Chrome & microcopy authenticity |
| `sloppy-layoutmobile` | `>=66%` stage coverage, edge bleed, varied layouts, scroll safety | `STR-01`, `STR-02`, `UX-05` |
| `sloppy-code` | Accessible controls, valid handlers, stacking tokens, TS evidence | `AX-01`, `UX-02`, `TOK-01`, `COD-01`..`06` |

Deep topic guides (open only when needed): `references/craft.md`, `references/framing.md`, `references/motion.md`, `references/kit.md`, `references/bento.md`, `references/looks.md`, `references/verify.md`.

---

## 3-Tier Severity Gates

1. **Floor (Hard CI Blockers)**: Contrast (`VIS-08`), dead handlers/links (`UX-02`), clickable `<div>` (`AX-01`), fabricated metrics (`CPY-01`), lorem ipsum (`CPY-07`), scroll lock (`UX-05`), `z-[9999]` (`TOK-01`), chained `!` (`COD-06`), missing reduced-motion (`MOT-03`). Never bypassed.
2. **Reflex (Overrulable AI Defaults)**: Purple gradients (`VIS-02`), gradient hero text (`VIS-01`), emerald monoculture (`VIS-03`), sparkles (`MED-02`), boxed cards (`STR-01`), floating frames (`STR-02`), infinite/layout-thrash motion (`MOT-01`, `MOT-02`, `MOT-04`), chained casts / `any` returns (`COD-02`, `COD-03`, `COD-04`). Pass in CI only with written rationale in `sloppy.config.json` (`overrules`) or inline:
   `// sloppy-override: VIS-02 Client brand requirement`
3. **Finish (Advisory)**: Narration comments (`COD-01`), empty object spreads (`COD-05`), sterile surfaces (`LIV-01`), minor rhythm polish. Never blocks CI.

---

## Token-Efficient Agent Workflow (MCP & CLI)

Use the 5 primary MCP tools with compact/summary flags to keep context lean:
- `sloppy_check({ path, strict: true, compact: true })` — Run before and after edits; `compact: true` skips prose rubric feedback.
- `sloppy_plan({ path, look })` — Dry-run repair plan and unified diff.
- `sloppy_fix({ path, only: [1, "VIS-02"], write: true })` — Surgical rewrite protected by the `--kept` wiring guard (`href`, `onClick`, form controls, headings). Omits duplicate `transformedCode` when `write: true`.
- `sloppy_catalog({ query, type, detail: "summary", limit: 10 })` — Search 5 MIT component libs (`stageshow`, `shadcn`, `motion-primitives`, `magicui`, `kokonutui`), 21 permissive motion ecosystems (`type: "motion"`), 74 patterns, 10 archetypes, and decoupled materials (`looks`). Pass `detail: "full"` only for source snippets.
- `sloppy_rules({ topic, ruleId, tier, compact: true })` — Query guidelines, project stack (`topic: "stack"`), or single canonical rules (`ruleId: "MOT-03"`).

```bash
# Fast agent CLI gates
sloppy check src/ --changed --strict --compact --json
sloppy audit src/ --code --strict --compact --json
sloppy audit src/Hero.tsx --mode after && sloppy fix src/Hero.tsx --only 1,3 --write
sloppy verify http://127.0.0.1:1355 --a11y --multi-width
sloppy init [--from <url>] && sloppy hook install
sloppy libs && sloppy list motion && sloppy looks --next
```

---

## Core Craft Summary (7 Rules)

1. **Ground & Elevate**: Step surfaces `0 -> 1 -> 2 -> 3` (`bg-neutral-950` -> `neutral-900` -> `neutral-800`) instead of wrapping everything in identical bordered cards.
2. **Budget Copy**: Keep 3–7 real strings per hero/illustration (`<Bar />` for filler copy); no lorem ipsum or invented round-number metrics.
3. **Frame & Bleed**: Fill `>= 66%` of stage width and bleed filler off at least one edge; test across 8 widths (375px–1920px).
4. **Purposeful Motion**: Guard all animations with `useReducedMotion()` / `prefers-reduced-motion` (`MOT-03`), animate `transform`/`opacity` only (`MOT-04`), avoid static infinite loops (`MOT-02`), and clean up Three.js/R3F/Pixi/Lenis/Lottie instances (`MOT-05`).
5. **Authentic Chrome & Icons**: Use product-appropriate icons (`Activity`, `Zap`, `Terminal`, `Database`), never decorative sparkles or raw emojis (`MED-01`).
6. **TypeScript Honesty**: Zero `as unknown as T`, unvalidated `any`/`unknown` returns, `Record<string, any>`, or `foo!.bar`. Strict ignores require rationale (`// sloppy-ignore-next-line RULE -- reason`).
7. **Target Grade A+ (>=95/100)**: Run `sloppy rubric <file>` and `sloppy check --strict` before declaring completion. Keep code and docs free of emojis and follow Conventional Commits.
