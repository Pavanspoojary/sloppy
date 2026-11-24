# Sloppy: The Zero-Tolerance AI Slop UI Rules

> Paste this entire document directly into ChatGPT, Claude, v0, Bolt, or Cursor Chat to eliminate AI UI slop from generated React, HTML, and CSS.

---

## 1. Non-Negotiable Hard Blockers (Floor Gates)

If any of these anti-patterns appear in your output, the code is considered broken:

1. **No WCAG Contrast Failures (`VIS-08`)**:
   - Body text and interactive labels must maintain at least 4.5:1 contrast against their background.
   - Never use washed-out gray text (e.g. `text-neutral-500` or `text-neutral-600` on dark `#09090b` grounds).
2. **No Dead Placeholder Links or Handlers (`UX-02`)**:
   - Never generate `href="#"` or `href="javascript:void(0)"`. Link to authentic routes (`href="/dashboard"`, `href="/api/keys"`) or use a semantic `<button>`.
   - Never leave empty callback stubs like `onClick={() => {}}`.
3. **No Inaccessible Controls (`AX-01`)**:
   - Always prefer semantic `<button type="button">`.
   - If a `<div>` is clickable, it must provide `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler for Enter and Space keys.
4. **No Fabricated Social Proof Metrics (`CPY-01`)**:
   - Never invent claims like "10x faster", "99.999% uptime", or "Trusted by 10,000+ top engineering teams".
   - Use concrete technical measurements (e.g. "p99 latency < 14ms") or quiet placeholder bars.
5. **No Lorem Ipsum or Generic Names (`CPY-07`)**:
   - Never output "Lorem ipsum dolor sit amet" or "John Doe". Use realistic technical domain names (`production-cluster-01`, `invoice_8492.pdf`).
6. **No Scroll Hijacking (`UX-05`)**:
   - Never lock `html, body { overflow: hidden }` or intercept native wheel events. Let viewport scrolling flow naturally.
7. **No Arbitrary Stacking Escalation (`TOK-01`)**:
   - Never write `z-[9999]` or `z-[99999]`. Use disciplined layers: `z-0` (canvas), `z-10` (sticky nav), `z-20` (dropdown), `z-50` (modal).
8. **No Unsafe Chained Non-Null Assertions (`COD-06`)**:
   - Never write `user!.profile!.address` or `item!.id`. Use optional chaining (`user?.profile?.address`) or defensive guards.

---

## 2. AI Reflex Defaults: Banned Patterns & Mandatory Replacements

1. **Banned: Purple and Indigo Gradients (`VIS-02`)**:
   - Forbidden: `bg-gradient-to-r from-purple-600 to-indigo-600` or `bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500`.
   - Mandatory: Monochromatic dark or light surface elevation:
     - Dark mode: `bg-neutral-900 border border-neutral-800 text-neutral-100`
     - Light mode: `bg-neutral-50 border border-neutral-200 text-neutral-900`
2. **Banned: Hero Gradient Text (`VIS-01`)**:
   - Forbidden: `bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600`.
   - Mandatory: Solid high-contrast text with weight and letter-spacing contrast: `text-white font-semibold tracking-tight`.
3. **Banned: Sparkle and Magic-Wand Icons (`MED-02`)**:
   - Forbidden: `<Sparkles>`, `<LucideSparkles>`, `<MagicWand>`.
   - Mandatory: Contextual domain icons: `<Activity>` (telemetry), `<Zap>` (execution), `<Terminal>` (CLI), `<Database>` (storage), `<Shield>` (security).
4. **Banned: Boxed Card Monotony (`STR-01`)**:
   - Forbidden: Wrapping every element in identical `rounded-xl border p-6 bg-neutral-900` cards with flat hierarchy.
   - Mandatory: Varied surface elevation steps, asymmetric bento layouts, and 1px divider lines.
5. **Banned: Unanchored Floating Windows (`STR-02`)**:
   - Forbidden: Centering a shrunken 400px window with uniform blank space on all four sides.
   - Mandatory: Cover at least 66% of the stage width and bleed secondary panels off at least one boundary edge.
6. **Banned: Unearned Looping Motion (`MOT-01`)**:
   - Forbidden: Looping `animate-bounce`, `animate-pulse`, `animate-spin` on static elements.
   - Mandatory: Cause-and-effect transitions (`transition-transform duration-200 ease-out hover:-translate-y-0.5`).
7. **Banned: Negative Parallelism Copy Clichés (`CPY-04`)**:
   - Forbidden: "Don't just X, Y" or "Stop wrestling with Z, start shipping velocity".
   - Mandatory: Direct affirmative capability statements: "Distributed database with instant point-in-time recovery".
8. **Banned: AI Narration Comments (`COD-01`)**:
   - Forbidden: `// Render the button`, `// Main container wrapper`, `// Return JSX`, and box-drawing ASCII divider banners.
   - Mandatory: Invariants and non-obvious technical bug workarounds only.
9. **Banned: Low-Evidence TypeScript & Fabricated Safety (`COD-02`, `COD-03`, `COD-04`, `COD-05`)**:
   - Forbidden: Chained type assertions (`as unknown as T`), unvalidated dynamic contract returns (`(): any`, `(): Promise<unknown>`), broad dictionary types (`Record<string, any>`), and conditional empty spreads (`...(cond ? { a } : {})`).
   - Mandatory: Use explicit type guards, Zod schemas, bounded record keys, and optional property declarations.
   - Strict inline suppression requires a written invariant rationale:
     `// sloppy-ignore-next-line COD-02 -- Checked invariant: verified with Zod schema`

---

## 3. Surface Elevation Scale (Grounding Guide)

- **Ground (Step 0)**: `bg-neutral-950` (`#09090b`)
- **Stage Container (Step 1)**: `bg-neutral-900/90 border border-neutral-800/60`
- **Card Panel (Step 2)**: `bg-neutral-800/80 border border-neutral-700/50`
- **Modal / Popover (Step 3)**: `bg-neutral-800/95 border border-neutral-700 shadow-lg`

---

## 4. Word Budget by Component Type

- **Illustration**: Max 12 words (use structural placeholder bars for secondary rows).
- **Feature Card**: Max 18 words.
- **Hero Section**: Max 32 words.
- **Bento Grid Cell**: Max 40 words.
- **Application Screen**: Max 150 words.

---

## 5. Liveliness Check (Anti-Sterile Rule)

Stripping AI slop without design direction leaves a sterile, lifeless gray box.
- Pair dark monochromatic surfaces with subtle border contrast (`border-neutral-800/60`), subtle backdrop blur (`backdrop-blur-sm`), and purposeful hover affordances (`hover:border-neutral-700 transition-colors`).
- Introduce intentional typographic hierarchy: bold primary headings, medium subheadings, and muted labels (`text-neutral-400`).

---

## 6. Evidence Discipline

Do not report a finding as fact unless you can point to the evidence Sloppy collected:

- **Objective** findings cite a file/line, selector, and a standard or hard invariant. They can block.
- **Craft** findings are contextual judgments. They need a reason, a screenshot, or a before/after comparison. They should not auto-rewrite art direction.
- Never claim DOM, screenshot, runtime, or cross-file evidence from a static scan.
- Never invent metrics, testimonials, logos, or copy to make a repair look complete.
- If confidence is low or the context is ambiguous, report it for human review instead of forcing a fix.

`docs/PLAYBOOK_GAP_MAP.md` lists which evidence layers are implemented. `sloppy rules --json` exposes each rule's confidence, evidence kinds, false positives, and validation steps.
