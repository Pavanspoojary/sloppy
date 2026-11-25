# Sloppy: Zero-Tolerance AI Slop Rules (Portable Prompt)

> Paste into ChatGPT, Claude, Cursor, or Codex to enforce high-craft React, HTML, CSS, and TypeScript output.

---

## 1. Floor Gates (Never Ship Broken Code)

- **`VIS-08` WCAG Contrast**: Text vs. background `>= 4.5:1` (`>= 3:1` large text). Avoid faint `text-neutral-500/600` on dark `#09090b`.
- **`UX-02` No Dead Wiring**: Zero `href="#"`, `href="javascript:void(0)"`, or `onClick={() => {}}`. Use real routes or `<button>`.
- **`AX-01` Keyboard Access**: Prefer `<button type="button">`. Clickable `<div>`/`<span>` requires `role="button"`, `tabIndex={0}`, and Enter/Space `onKeyDown`.
- **`CPY-01` / `CPY-07` Authentic Copy**: Zero invented metrics ("10x", "99.99%"), "Lorem ipsum", or "John Doe".
- **`UX-05` Natural Scroll**: Never lock `html`/`body` with `overflow: hidden` or hijack wheel scrolling.
- **`TOK-01` Layer Scale**: Use `z-0`, `z-10`, `z-20`, `z-50`—never `z-[9999]`.
- **`COD-06` Safe Access**: Zero `foo!.bar!.baz`; use `?.` or guards.
- **`MOT-03` Reduced Motion**: Honor `useReducedMotion()`, `<MotionConfig reducedMotion="user">`, or `prefers-reduced-motion`.

## 2. AI Reflex Bans & Craft Replacements

- **Purple/Indigo Gradients (`VIS-02`) / Gradient Hero Text (`VIS-01`)**: Use elevated neutral surfaces (`bg-neutral-900 border-neutral-800` or `bg-neutral-50 border-neutral-200`) and crisp solid ink (`tracking-tight`).
- **Sparkles (`MED-02`) & Emoji Chrome (`MED-01`)**: Use domain SVG icons (`Activity`, `Zap`, `Terminal`, `Database`), zero raw emojis in UI.
- **Boxed Cards (`STR-01`) & Floating Frames (`STR-02`)**: Vary elevation steps (`0 -> 1 -> 2 -> 3`), cover `>= 66%` width, bleed filler off an edge.
- **Motion Discipline (`MOT-01`, `MOT-02`, `MOT-04`, `MOT-05`)**: No static `repeat: Infinity` / `animate-bounce`; animate `transform`/`opacity` (never `width`/`left`/`top`); clean up Three.js/R3F/Lenis/Lottie on unmount (`frameloop="demand"`, `dpr={[1,2]}`).
- **Copy Cliches (`CPY-04`, `CPY-05`)**: Cut "It's not just X, it's Y", adjective triplets, em-dash spam, and generic "Powered by AI" pills (`CPY-02`, `MADE_UP_AI_BADGE`).
- **Low-Evidence TypeScript (`COD-01`..`COD-05`)**: Strip obvious `// Render ...` narration (`COD-01`), `as unknown as T` (`COD-02`), `(): any` (`COD-03`), `Record<string, any>` (`COD-04`), and `...(cond ? {a} : {})` (`COD-05`). Strict ignores require `-- <invariant reason>`.

## 3. Elevation, Budget & Liveliness (`LIV-01`)

- **Dark Scale**: Ground `#09090b` (`neutral-950`) -> Stage `neutral-900/90` -> Panel `neutral-800/80` -> Modal `neutral-800/95` + `border-neutral-700`.
- **Word Budgets (`TYP-08`)**: Illustration `12`, Feature card `18`, Hero `32`, Bento cell `40`, Application `150`. Use placeholder `<Bar />` rows for secondary data.
- **Anti-Sterile Check (`LIV-01`)**: Include subtle border contrast, hover transitions, and typographic weight hierarchy on interactive controls.
- **Evidence Rule**: Never claim a file passes without verifying via `sloppy check --strict --compact` and reporting exact observed output.
