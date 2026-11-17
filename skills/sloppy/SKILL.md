---
name: sloppy
description: The ultimate AI slop UI fixer. Build believable, high-craft product illustrations, landing page heroes, feature cards, bento grids, and cursor walkthroughs in React and CSS without AI slop. Never use purple gradients, sparkle icons, floating miniature windows, unearned bouncy animations, or walls of fake text. Includes an integrated MCP server and a pure React anti-slop kit.
metadata:
  version: 1.0.0
---

# Sloppy: The AI Slop UI Fixer

AI agents routinely generate "AI UI Slop":
- Unwarranted purple/indigo gradients and sparkle icons on generic features.
- Boxed card monotony: wrapping every element in identical `rounded-xl border p-6` cards with flat hierarchy.
- Floating windows: shrinking an entire application into a tiny card with uniform air on all 4 sides.
- Word overload: filling every row with fake numbers and text instead of disciplined word budgeting.
- Unearned animations: spinning, bouncing, and sudden content swaps without cause-and-effect transitions.

Sloppy eliminates AI slop. It enforces disciplined craft, purposeful framing, quiet hierarchy, and cause-driven motion.

---

## The 5 Anti-Slop Commandments

1. **Restraint Over Detail (The 3–7 Word Budget)**:
   Count the real strings on screen: usually 3 to 7. Use real words only on what the story is about. Use quiet placeholder bars (`<Bar />`) for the rest. Filling every row with fake numbers and paragraphs makes an interface look synthetic.
2. **Grounded Framing Over Floating Boxes**:
   The window, card, or phone must fill at least two-thirds of the stage and run off at least one edge. Never float a shrunken window with air on all four sides. Crop aggressively to the panel where the action happens; let non-focal filler bleed off the edge.
3. **Surface Depth Over Flat Cards**:
   Do not wrap every element in identical bordered cards. Step from the page ground to surface 1, surface 2, and surface 3 using quiet grays or true dark steps. Reserve the accent color for one intentional signal.
4. **Caused Motion Over Random Animation**:
   Never add unearned spinning, pulsing, or bouncy keyframes (`animate-bounce`). A cursor moves with purpose, presses with visible feedback, and triggers a state transition. Animate the relationship, not just the object. The payoff must hold for 2–3 seconds for comfortable reading.
5. **Authentic Craft Over Sparkle Slop**:
   Zero purple/indigo gradients. Zero sparkles (`LucideSparkles`) for AI. Use genuine product chrome, real typography hierarchy, and quiet confidence.

---

## The Sloppy MCP Server Tools

When working in an agentic coding environment (Antigravity, Claude Code, Cursor, OpenHands), you have direct access to the `sloppy` MCP tools:

- `sloppy_audit_code`: Scan JSX/TSX/CSS files or snippets to detect AI slop with line numbers, severity scores (0-100), and exact refactoring diffs. Run this before handing over any UI code.
- `sloppy_search_patterns`: Search 73+ curated gold patterns and real-product studies (Linear, Slack, Raycast, Figma, Notion, Spotify, Bento grids, Payout flows, AI chat without sparkles).
- `sloppy_get_pattern`: Fetch complete, runnable TSX code, scoped CSS, and motion choreography scripts for any pattern ID.
- `sloppy_get_kit_primitives`: Retrieve ready-to-paste clean React/CSS primitives (`Stage`, `Window`, `Phone`, `Bento`, `Cursor`, `Act`, `Ease`, `Bar`, `Pill`, `Badge`).
- `sloppy_get_look`: Get design tokens, color scales, surface steps, border radii, and CSS variables for curated looks (`minimal`, `linear`, `radix`, `raycast`, `blueprint`, `glass`, `dark-hero`).
- `sloppy_get_rules`: Query detailed reference manuals (`craft`, `framing`, `motion`, `bento`, `word_budget`).
- `sloppy_refactor_slop`: Automated code refactoring guide that transforms sloppy components into clean Stageshow UI.

---

## 7-Step Anti-Slop Workflow

1. **Medium and Place**:
   Decide medium (still illustration or animated demo with cursor) and size (720x340 for hero beside copy, 960x480 for full-width hero, 440x320 for feature card). Design at 1:1 scale.
2. **Choose a Look**:
   Query `sloppy_get_look` for tokens (`linear`, `minimal`, `raycast`, `radix`, `blueprint`, `glass`, `dark-hero`). Default to `linear` for dark developer tools or `minimal` for light editorial products.
3. **The Story**:
   Plan 3 to 5 beats and a payoff (10 to 16 seconds total). Every cursor move must have a clear reason. Values never jump-swap in place; they roll or transition smoothly.
4. **Start From a Gold Pattern**:
   Call `sloppy_search_patterns` and `sloppy_get_pattern` to copy the closest gold example as your foundation. Keep its structure, kit imports, and spacing rhythm; adapt the words and icons to the target product.
5. **The Screen & Word Budget**:
   Count the real strings (keep between 3 and 7). Build with `<Stage>`, `<Window>`, `<Bar>`, `<Text>`, and `<Row>`. Mark interaction targets with `data-target` and `data-cursor`; measure with `rect()`, never hardcode pixel coordinates.
6. **Choreograph**:
   Use the `Act` API (`<Act on={clock} script={...}>`). Keep elements mounted and toggle states so exits animate smoothly. Overlap incoming beats by 50-100ms. Hold the final payoff.
7. **Audit & Rehearse**:
   Run `sloppy_audit_code` or CLI `sloppy audit <file>` before declaring completion. Verify that the slop score is 0/100 and no purple gradients, sparkle icons, unanchored bounds, or unearned animations remain.

---

## Reference Guides

- `references/craft.md`: Restraint, word budget, surface depth, hierarchy, icons, logos.
- `references/framing.md`: Viewport aspect ratios, crop rules, satellites, bleeding, gutters.
- `references/motion.md`: Choreography, beats, cause-and-effect, durations, easing, loops.
- `references/bento.md`: Bento grid structure, tile hierarchy, focal tile.
- `references/teaching.md`: Flawed vs corrected pairs for diagnostic self-checks.
