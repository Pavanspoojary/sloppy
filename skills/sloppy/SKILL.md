---
name: sloppy
description: The ultimate AI slop UI fixer. Build believable, high-craft product illustrations, landing page heroes, feature cards, bento grids, and cursor walkthroughs in React and CSS without AI slop. Never use purple gradients, sparkle icons, floating miniature windows, unearned bouncy animations, or walls of fake text. Includes an integrated MCP server and a pure React anti-slop kit.
metadata:
  version: 1.1.0
---

# Sloppy: The AI Slop UI Fixer & Unified Design Engine

AI agents routinely generate "AI UI Slop":
- Unwarranted purple/indigo gradients and sparkle icons on generic features.
- Boxed card monotony: wrapping every element in identical `rounded-xl border p-6` cards with flat hierarchy.
- Floating windows: shrinking an entire application into a tiny card with uniform air on all 4 sides.
- Word overload: filling every row with fake numbers and text instead of disciplined word budgeting.
- Unearned animations: spinning, bouncing, and sudden content swaps without cause-and-effect transitions.

Sloppy unifies 7 top-tier UI component ecosystems under a rigorous craft and restraint engine, eliminating AI slop across all modern web development.

---

## The 7 Integrated UI Ecosystems

Sloppy unifies 700+ components and 73+ gold patterns into a single anti-slop catalog:

1. **Stageshow (`stageshow`)**:
   - Role: Grounded product illustrations, cursor choreography, anti-slop primitives (`Stage`, `Window`, `Act`, `Ease`, `Bar`), and 73+ gold product patterns (Linear, Raycast, Notion, Spotify, Figma).
   - Guidance: The baseline craft standard. Use for heroes, marketing demos, and animated walkthroughs.

2. **shadcn/ui (`shadcn`)**:
   - Role: Essential, fully accessible Radix-based UI building blocks (Button, Dialog, Dropdown, Table, Input, Popover).
   - Guidance: Keep primitives unbloated. Ground them in surface hierarchy (surfaces 1, 2, 3) rather than floating boxes with excessive border radius.

3. **Motion Primitives (`motion-primitives`)**:
   - Role: Micro-interactions and physics-based motion (Morphing Dialog, Sliding Number, Text Shimmer, Expandable Card, Scroll Progress).
   - Guidance: Restrain spring stiffness and damping. Avoid infinite pulsing; motion must always be user-caused or progress-linked.

4. **Magic UI (`magicui`)**:
   - Role: Animated landing page heroes, border beams, interactive bento grids, marquee strips, and ambient glows.
   - Guidance: Anti-slop limits: Maximum 1 beam or spotlight per screen. Keep background effects under 0.15 opacity. Never mix purple gradients with generic sparkle icons.

5. **React Bits (`react-bits`)**:
   - Role: High-performance background shaders, interactive canvas effects, particle fields, and kinetic typography.
   - Guidance: Keep ambient backgrounds quiet and subtle. Low particle counts, slow speeds, and disciplined contrast so text remains 100% legible.

6. **Kokonut UI (`kokonutui`)**:
   - Role: Modern AI interfaces, action menus, clean input bars, profile cards, and dashboard metrics.
   - Guidance: Strip AI sparkle clichés. Replace speculative AI magic with honest tool chrome, quiet pill indicators, and high typographic rigor.

7. **Animate UI (`animate-ui`)**:
   - Role: CSS-first micro-animations, staggered reveal lists, and accessible transitions.
   - Guidance: Keep durations between 150ms and 300ms. Overlap incoming beats by 50-100ms. Hold final payoffs for comfortable reading.

---

## The 5 Anti-Slop Commandments

1. **Restraint Over Detail (The 3 to 7 Word Budget)**:
   Count the real strings on screen: usually 3 to 7. Use real words only on what the story is about. Use quiet placeholder bars (`<Bar />`) for the rest. Filling every row with fake numbers and paragraphs makes an interface look synthetic.
2. **Grounded Framing Over Floating Boxes**:
   The window, card, or phone must fill at least two-thirds of the stage and run off at least one edge. Never float a shrunken window with air on all four sides. Crop aggressively to the panel where the action happens; let non-focal filler bleed off the edge.
3. **Surface Depth Over Flat Cards**:
   Do not wrap every element in identical bordered cards. Step from the page ground to surface 1, surface 2, and surface 3 using quiet grays or true dark steps. Reserve the accent color for one intentional signal.
4. **Caused Motion Over Random Animation**:
   Never add unearned spinning, pulsing, or bouncy keyframes (`animate-bounce`). A cursor moves with purpose, presses with visible feedback, and triggers a state transition. Animate the relationship, not just the object. The payoff must hold for 2 to 3 seconds for comfortable reading.
5. **Authentic Craft Over Sparkle Slop**:
   Zero purple/indigo gradients. Zero sparkles (`LucideSparkles`) for AI. Use genuine product chrome, real typography hierarchy, and quiet confidence.

---

## The Sloppy MCP Server Tools

When working in an agentic coding environment (Antigravity, Claude Code, Cursor, OpenHands), you have direct access to the `sloppy` MCP tools:

- `sloppy_search_components`: Search across 700+ components across all 7 libraries (`shadcn`, `motion-primitives`, `magicui`, `react-bits`, `kokonutui`, `animate-ui`, `stageshow`) by query, library, or category.
- `sloppy_get_component`: Retrieve full source code (TSX/JSX), required dependencies, and anti-slop craft guidance for any component ID (e.g. `motion-primitives/morphing-dialog`, `magicui/border-beam`).
- `sloppy_list_libraries`: List all 7 integrated UI libraries with descriptions, component counts, strengths, and specific anti-slop rules.
- `sloppy_list_catalog`: Inspect overall ecosystem statistics across components, libraries, looks, and patterns.
- `sloppy_audit_code`: Scan JSX/TSX/CSS files or snippets to detect AI slop with line numbers, severity scores (0-100), and exact refactoring diffs. Run this before handing over any UI code.
- `sloppy_search_patterns`: Search 73+ curated gold patterns and real-product studies (Linear, Slack, Raycast, Figma, Notion, Spotify, Bento grids, Payout flows, AI chat without sparkles).
- `sloppy_get_pattern`: Fetch complete, runnable TSX code, scoped CSS, and motion choreography scripts for any pattern ID.
- `sloppy_get_kit_primitives`: Retrieve ready-to-paste clean React/CSS primitives (`Stage`, `Window`, `Phone`, `Bento`, `Cursor`, `Act`, `Ease`, `Bar`, `Pill`, `Badge`).
- `sloppy_get_look`: Get design tokens, color scales, surface steps, border radii, and CSS variables for curated looks (`minimal`, `linear`, `radix`, `raycast`, `blueprint`, `glass`, `dark-hero`).
- `sloppy_get_rules`: Query detailed reference manuals (`craft`, `framing`, `motion`, `bento`, `word_budget`).
- `sloppy_refactor_slop`: Automated code refactoring guide that transforms sloppy components into clean Stageshow UI.

---

## CLI Reference (`sloppy`)

Developers and scripts can invoke the `sloppy` CLI directly:

```bash
# List all 7 integrated libraries
sloppy libs

# Search or list components from a library
sloppy list magicui
sloppy list kokonutui
sloppy list motion-primitives

# Add a component source directly into your project
sloppy add motion-primitives/morphing-dialog
sloppy add magicui/border-beam --dir ./src/components/ui

# Audit code for AI slop
sloppy audit src/components/Hero.tsx --strict

# Inspect available design looks and token scales
sloppy looks

# Launch the visual playground (port 1355)
sloppy dev
```

---

## 7-Step Anti-Slop Workflow

1. **Medium and Place**:
   Decide medium (still illustration or animated demo with cursor) and size (720x340 for hero beside copy, 960x480 for full-width hero, 440x320 for feature card). Design at 1:1 scale.
2. **Choose a Look**:
   Query `sloppy_get_look` for tokens (`linear`, `minimal`, `raycast`, `radix`, `blueprint`, `glass`, `dark-hero`). Default to `linear` for dark developer tools or `minimal` for light editorial products.
3. **Select Foundations from the 7 Libraries**:
   Query `sloppy_search_components` to pick clean foundations (e.g., `shadcn` for base controls, `motion-primitives` for interactive dialogs, `stageshow` for grounded framing). Inspect `antiSlopGuidance` via `sloppy_get_component`.
4. **The Story**:
   Plan 3 to 5 beats and a payoff (10 to 16 seconds total). Every cursor move must have a clear reason. Values never jump-swap in place; they roll or transition smoothly.
5. **Start From a Gold Pattern**:
   Call `sloppy_search_patterns` and `sloppy_get_pattern` to copy the closest gold example as your foundation. Keep its structure, kit imports, and spacing rhythm; adapt the words and icons to the target product.
6. **The Screen & Word Budget**:
   Count the real strings (keep between 3 and 7). Build with `<Stage>`, `<Window>`, `<Bar>`, `<Text>`, and `<Row>`. Mark interaction targets with `data-target` and `data-cursor`; measure with `rect()`, never hardcode pixel coordinates.
7. **Audit & Rehearse**:
   Run `sloppy_audit_code` or CLI `sloppy audit <file>` before declaring completion. Verify that the slop score is 0/100 and no purple gradients, sparkle icons, unanchored bounds, or unearned animations remain.

---

## Reference Guides

- `references/craft.md`: Restraint, word budget, surface depth, hierarchy, icons, logos.
- `references/framing.md`: Viewport aspect ratios, crop rules, satellites, bleeding, gutters.
- `references/motion.md`: Choreography, beats, cause-and-effect, durations, easing, loops.
- `references/bento.md`: Bento grid structure, tile hierarchy, focal tile.
- `references/teaching.md`: Flawed vs corrected pairs for diagnostic self-checks.
