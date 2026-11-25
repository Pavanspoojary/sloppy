---
name: sloppy
description: The ultimate AI slop UI fixer. Build believable, high-craft product illustrations, landing page heroes, feature cards, bento grids, and cursor walkthroughs in React and CSS without AI slop. Never use purple gradients, sparkle icons, floating miniature windows, unearned bouncy animations, or walls of fake text. Includes 3-tier severity gates (Floor/Reflex/Finish), wiring guard, multi-width verification, decoupled materials, an integrated MCP server, approval-gated audits, and 5 on-demand specialist skills.
metadata:
  version: 1.4.0
---

# Sloppy: The AI Slop UI Fixer & Unified Design Engine

AI agents routinely generate "AI UI Slop":
- Unwarranted purple/indigo gradients and sparkle icons on generic features.
- Boxed card monotony: wrapping every element in identical `rounded-xl border p-6` cards with flat hierarchy.
- Floating windows: shrinking an entire application into a tiny card with uniform air on all 4 sides.
- Word overload: filling every row with fake numbers and text instead of disciplined word budgeting.
- Unearned animations: spinning, bouncing, and sudden content swaps without cause-and-effect transitions.

Sloppy eliminates AI slop by unifying 7 top-tier component ecosystems (Stageshow, shadcn/ui, Motion Primitives, Magic UI, React Bits, Kokonut UI, and Animate UI) with an automated surgical source-scan auto-fixer, 3-tier severity gates, wiring protection guard, multi-width rendering verification, 10 synthesized master archetypes, a 10-point Craft Rubric grading engine, approval-gated audit reports, a Model Context Protocol (MCP) server, and 5 modular specialist skills.

---

## Modular On-Demand Specialist Skills

To preserve agent context windows while providing deep, domain-specific guidance, Sloppy splits into 1 core coordinator skill plus 5 on-demand specialists:

1. **`sloppy-ui`**: Surface elevation steps (0, 1, 2, 3), monochromatic neutrals, single semantic accent discipline, authentic Lucide icon replacement (`VIS-01`, `VIS-02`, `VIS-03`, `VIS-06`, `VIS-07`, `VIS-08`, `MED-02`, `LIV-01`).
2. **`sloppy-copywriting`**: Word budget enforcement (3-7 words per element), eliminating negative parallelism clichés, and preventing fabricated metrics and formulaic prose (`CPY-01`, `CPY-02`, `CPY-04`, `CPY-05`, `CPY-06`, `CPY-07`, `TYP-08`).
3. **`sloppy-human`**: Engineering authenticity, realistic domain nouns, authentic macOS chrome headers, and grounded error/empty states (`REAL_WORLD_CHROME_MISSING`, `AUTHENTIC_MICROCOPY`).
4. **`sloppy-layoutmobile`**: Viewport framing (>=66% stage coverage, edge bleeding), breaking boxed card syndrome, responsive density, and mobile scroll protection (`STR-01`, `STR-02`, `LAY-01`, `UX-05`).
5. **`sloppy-code`**: Component semantics, keyboard accessibility (`role="button"`, `tabIndex={0}`), zero dead placeholder callbacks, comment hygiene, and low-evidence TypeScript code rules (`AX-01`, `UX-02`, `TOK-01`, `COD-01`..`COD-06`).

Load specialist skills only when operating directly in their respective domains to save context tokens.

---

## 3-Tier Severity Gates (Floor / Reflex / Finish)

Sloppy categorizes all rules into three distinct enforcement tiers for painless CI adoption:

1. **Floor (Hard CI Blockers)**:
   - Non-negotiable quality and accessibility gates: WCAG contrast (`LOW_CONTRAST_GRAY`), broken mobile layout/overflow (`SCROLL_HIJACKING`), inaccessible controls (`FAKE_CONTROL_SLOP`), dead placeholder links (`DEAD_PLACEHOLDER_SLOP`), fabricated metrics (`FABRICATED_SOCIAL_PROOF`), and lorem ipsum text (`LOREM_IPSUM_SLOP`).
   - Hard failure in `--strict` and pre-commit hooks. Cannot be bypassed.
2. **Reflex (AI Defaults, Overrulable with Written Rationale)**:
   - Typical synthetic agent habits: purple gradients (`PURPLE_GRADIENT_SLOP`), sparkle icons (`SPARKLE_ICON_OVERLOAD`), boxed card syndrome (`BOXED_CARD_SYNDROME`), unanchored floating windows (`UNANCHORED_FLOATING_WINDOW`), and unearned keyframe loops (`UNEARNED_ANIMATION`).
   - Blocks CI by default, BUT passes if explicitly overruled with a written rationale in `sloppy.config.json` (under `"overrules": { "PURPLE_GRADIENT_SLOP": "Brand primary requirement" }`) or an inline comment:
     `// sloppy-override: PURPLE_GRADIENT_SLOP Client requested brand purple gradient`
3. **Finish (Advisory Polish)**:
   - Non-blocking suggestions: spacing rhythm, visual weight balance, comment hygiene (`COD-01`), and liveliness affordances (`LIV-01`). Never blocks CI.

---

## Approval-Gated Audits & Surgical Fixes (`--only`)

Sloppy provides During vs After mode for developer control:
- **During Mode (Real-Time)**: Sub-30ms checks run on file edit via editor hooks.
- **After Mode (Approval-Gated)**: `sloppy audit <path> --mode after` generates a numbered audit report (`audit-001-YYYY-MM-DD.md`) and halts automated modifications until approved.
- **Surgical Execution**: `sloppy fix <file> --only 1,3,5 --write` applies fixes ONLY to user-approved finding numbers or rule IDs (`--only VIS-02,COD-01`), guaranteeing zero unwanted code churn.

---

## The Wiring Guard (`--kept` / `--before`)

To remove the #1 fear developers have about AI UI rewrites (lost callbacks, dropped inputs, broken business logic), `sloppy fix` enforces a strict wiring guard before modifying any file:
- **Snapshots Interactive Elements**: Event handlers (`onClick`, `onSubmit`, `onChange`), form inputs (`<input>`, `<select>`, `<textarea>`), navigation links (`href`, `to`), headings (`h1`-`h6`), and test anchors (`data-testid`, `id`).
- **Fails Closed on Dropped Wiring**: If an automated transformation drops any wiring connection, the rewrite is aborted, the original file is preserved, and exact dropped items are reported.

---

## Multi-Width Viewport Verification (8 Widths)

`sloppy verify <target> --multi-width` tests real rendered contrast, mobile horizontal overflow, and above-the-fold hero framing across 8 canonical viewports:
- Mobile: 375px (iPhone SE), 390px (iPhone 14/15), 430px (iPhone Max)
- Tablet: 768px (iPad), 834px (iPad Pro)
- Desktop: 1024px (Laptop), 1440px (Desktop Widescreen), 1920px (1080p Monitor)
- **Static Source-Scan Fallback**: When Playwright or Chrome is not installed, Sloppy automatically falls back to static source scanning, verifying responsive constraints without failing or crashing.

---

## Decoupled Materials & Anti-Repetition Engine

- **Pure Materials**: Each theme is a lightweight material token set (≤8 KB of surface, border, typography, and accent tokens) completely separated from page anatomy.
- **Anti-Repetition Memory**: `sloppy looks --next` tracks recently dealt themes in `.sloppy/dealt-looks.json`, rotating through materials so generation never creates a recognizable "Sloppy template" look.

---

## Design DNA Extractor (`sloppy init --from <url>`)

- Extracts authentic typography stacks, color palettes, surface hierarchy, and border radius directly from a live URL or local dev server.
- Generates `sloppy.config.json` with project-specific brand allowances and generates a comprehensive `DESIGN.md` in the project root.

---

## Edit-Time Floor Hook (`sloppy hook install`)

- Installs lightweight sub-30ms Floor checks for Cursor, Claude Code, and Git pre-commit.
- Runs `sloppy audit --floor-only` on file edits, catching dead links, fake metrics, and contrast bugs in real time before the agent finishes its loop.

---

## Installation via `npx skills add`

`skills/sloppy` is packaged for standalone installation:
```bash
npx skills add Pavanspoojary/slopy -g
```

---

## The 5 Open-Source UI Ecosystems & 21 Permissive Motion Governors

Sloppy unifies strictly permissive open-source component ecosystems (**MIT** / **Apache-2.0**) and 74 gold pattern directories into a single anti-slop catalog (excluding Commons-Clause or AGPL-licensed packages):

1. **Stageshow (`stageshow`, MIT)**: Grounded product framing, cursor choreography, anti-slop primitives (`Stage`, `Window`, `Act`, `Ease`, `Bar`), and 74 gold product pattern directories.
2. **shadcn/ui (`shadcn`, MIT)**: Essential, accessible Radix-based UI building blocks (Button, Dialog, Table, Popover) anchored to surface depth steps.
3. **Motion Primitives (`motion-primitives`, MIT)**: Physics-based micro-interactions (Morphing Dialog, Sliding Number, Expandable Tabs) with disciplined damping.
4. **Magic UI (`magicui`, MIT)**: Restrained marketing hero elements (max 1 beam/glow, opacity < 0.15, zero purple sparkle combos).
5. **Kokonut UI (`kokonutui`, MIT)**: Modern AI prompt composers, agent execution lanes, and tool approval cards that eliminate AI sparkle clichés.

In addition, Sloppy governs **21 permissive MIT / Apache-2.0 animation, scroll, text/SVG, 3D/WebGL, and Lottie/Rive libraries** via `MOT-01`..`MOT-05` & `UX-05` (`sloppy list motion`):
- **Core Animation**: Motion (`motion`), Anime.js, React Spring, AutoAnimate, Tween.js, Theatre.js Core (`@theatre/core` Apache-2.0 only; `@theatre/studio` AGPL-3.0 excluded), Motion Canvas
- **Scroll & Parallax**: Lenis, AOS, Rellax, Lax.js, Atropos
- **Text & SVG**: Splitting.js, Vivus
- **3D & WebGL**: Three.js, React Three Fiber, PixiJS
- **Lottie & Interactive**: lottie-web, dotlottie-web, Rive (`@rive-app/*`)
- **Animated UI**: Magic UI

---

## 10 Synthesized Master Archetypes

Sloppy fuses the MIT libraries into 10 unified master archetypes that eliminate AI slop entirely:

1. **AI Autonomous Agent Cockpit (`ai-agent-cockpit`)**: Swarm control room with parallel task lanes, tool verification diff, and subtle ambient backdrop.
2. **Developer Platform High-Craft Hero (`developer-platform-hero`)**: Bento deploy terminal & edge telemetry with 2x2 dominant focal card.
3. **Fintech Automated Payout Suite (`fintech-billing-suite`)**: Real-time settlement & ledger with decimal rolling ticker.
4. **Cloud SQL Query Studio (`database-studio`)**: Relational database console with inline query execution, monospace schema tree, and latency pill.
5. **Distributed Trace Waterfall (`observability-telemetry`)**: Microservice latency waterfall visualizer with span timing bars and error isolation.
6. **Restrained SaaS Pricing Matrix (`saas-pricing-matrix`)**: Disciplined tier comparison with billing cycle switch, strict word budget (no oversized cards).
7. **Dynamic Island Cross-Device Pair (`mobile-island-companion`)**: Hardware pill expansion morph synchronized with desktop notification event.
8. **Creator Retention Curve Analytics (`creator-analytics-dashboard`)**: Clean audience retention graph with scrubbing hairline and rolling metrics.
9. **Raycast Command Palette (`command-palette-raycast`)**: High-contrast search palette with kbd shortcuts and fuzzy sub-actions.
10. **Node-Based Automation Graph (`workflow-canvas-automation`)**: Visual automation pipeline with SVG connectors, execution status pills, and webhook trigger payload.

---

## The 10-Point Craft Rubric & Certification

Sloppy grades every UI component across 10 distinct craft dimensions (0 to 10 points each, 100 points total):
1. **Surface Elevation & Grounding (0-10)**: Grounded surface steps (0, 1, 2, 3), zero floating unanchored cards.
2. **Word Budget & Text Restraint (0-10)**: 3 to 7 real strings, placeholder bars for background copy.
3. **Motion Intentionality & Easing (0-10)**: Cause-driven transitions with settled physical easing; zero unearned bounces.
4. **Visual Focal Hierarchy (0-10)**: Unmistakable dominant focal node, clear primary/secondary weight.
5. **Icon Authenticity (0-10)**: Zero decorative sparkles or magic wands on generic features.
6. **Monochromatic Restraint (0-10)**: Monochromatic neutral ground, single intentional accent color for true signals.
7. **Framing & Bleeding Rules (0-10)**: Covers >= 66% of stage, bleeds secondary panels off stage frame.
8. **Density & Spacing Rhythm (0-10)**: Tight information density, disciplined padding.
9. **Real-World Chrome Integrity (0-10)**: Authentic window headers, realistic monospace tags, zero fake AI marketing labels.
10. **Semantic Accessibility & Contrast (0-10)**: High contrast ratio and accessible typographic foundations.

Grade scale: **A+ (95-100)**, **A (90-94)**, **B (80-89)**, **C (70-79)**, **D (50-69)**, **F (<50)**.

---

## The Sloppy MCP Server Tools (5 Primary Verbs)

When working in an agentic coding environment (Antigravity, Claude Code, Cursor, Codex), the `sloppy` MCP server exposes strictly 5 context-efficient primary tools:

- `sloppy_check`: Audit-and-gate entry point. Accepts `code` or `path`, `componentType`, `strict`, `codeOnly` (`COD-01`..`06`), and `compact: true` for token-dense output. Returns `{ ok, score, grade, violations, nextActions }`.
- `sloppy_plan`: Generates a structured repair plan with confidence levels, risk ratings, exact patch snippets, and a unified diff.
- `sloppy_fix`: Transforms sloppy UI code into clean craft with syntax validation, wiring protection (`--kept`), unified diff, and post-fix audit (`write: false` dry-run by default).
- `sloppy_catalog`: Unified search across all 7 integrated UI libraries, 74 curated patterns, 10 master archetypes, and looks (`type: "all" | "components" | "patterns" | "looks" | "archetypes"`).
- `sloppy_rules`: Query authoritative guidelines (`craft`, `framing`, `motion`, `bento`, `word_budget`, `stack`, `all`) including project stack detection.

---

## CLI Reference (`sloppy`)

```bash
# Check files, gate CI, or run browser accessibility & multi-width verification
sloppy check src/components/Hero.tsx --strict --compact --json
sloppy check http://127.0.0.1:1355 --render --a11y

# Audit TypeScript engineering slop only or run approval-gated after-mode report
sloppy audit src/ --code --strict
sloppy audit src/components/Hero.tsx --mode after

# Inspect canonical rules and evidence metadata
sloppy rules --json

# Evaluate code against 10-point Craft Rubric & generate repair plans
sloppy rubric src/components/Hero.tsx --strict
sloppy plan src/components/Hero.tsx

# Surgically auto-fix code in-place (preserving wiring via --kept)
sloppy fix src/components/Hero.tsx --only 1,3 --write

# Run browser geometric framing, reflow, focus order, and motion checks
sloppy verify http://127.0.0.1:1355 --a11y --multi-width

# Inspect or scaffold from 10 synthesized master archetypes & 7 libraries
sloppy archetypes
sloppy create ai-agent-cockpit --dir ./src/components
sloppy libs
sloppy add motion-primitives/morphing-dialog

# Display craft scoreboard & launch Craft Studio on port 1355
sloppy gain
sloppy dev
```

---

## 7-Step Anti-Slop Workflow

1. **Medium and Place**: Decide medium (still illustration or animated demo with cursor) and size (720x340 for hero beside copy, 960x480 for full-width hero, 440x320 for feature card). Design at 1:1 scale.
2. **Choose a Look**: Query `sloppy_catalog` (`type: "looks"`) or run `sloppy looks --next` for tokens. Hand-authored looks are `linear`, `minimal`, `raycast`, `radix`, `blueprint`, `glass`, `dark-hero`. Refero-sourced production looks are `nuxt`, `linearity`, `grafana`, `modern-treasury`, `milanote`, `bunny`, `heptabase`, `glyphs`.
3. **Select Foundations or Archetype**: Query `sloppy_catalog` (`type: "components"` / `"archetypes"`) or scaffold one of the 10 master archetypes via `sloppy create <archetype>`.
4. **Apply Word Budget**: Count the real strings (keep between 3 and 7). Use `<Bar />` for filler.
5. **Ground the Framing**: Windows and phones must cover >= 66% of the stage and bleed off at least one edge.
6. **Choreograph Caused Motion**: Use the `Act` API (`<Act on={clock} script={...}>`). Every motion must have a visible cause.
7. **Certify with Rubric**: Run `sloppy rubric <file>` to verify Grade A+ (>=95/100) before declaring completion.

---

## Senior Engineering Directives

### 1. Professional Tone & Zero Emojis
- Maintain senior engineering rigor across all documentation, code comments, and commit messages.
- Never use emojis in code, UI, alert banners, documentation, or commit messages. Rely on crisp typography, inline SVG icons, and semantic badges.

### 2. Strict Conventional Commits
- All commit messages must follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`, `ci:`) with imperative, professional subject lines. Run `node scripts/verify-commit-msg.js` before finalizing commits.

