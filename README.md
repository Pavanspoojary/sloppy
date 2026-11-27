# Sloppy

**The anti-slop design engine and quality gate for your coding agent.**

Catch low-taste AI UI anti-patterns—unwarranted purple gradients, unanchored floating windows, sparkle icons, fake metric proof, and unearned bouncy loops—before they ship.

[![npm version](https://img.shields.io/npm/v/@sloppy-ai/cli.svg?style=flat-square)](https://www.npmjs.com/package/@sloppy-ai/cli)
[![license](https://img.shields.io/npm/l/@sloppy-ai/cli.svg?style=flat-square)](LICENSE)
[![CI Status](https://img.shields.io/github/actions/workflow/status/Pavanspoojary/sloppy/ci.yml?branch=main&style=flat-square)](https://github.com/Pavanspoojary/sloppy/actions)

---

## Install

### In your coding agent (Antigravity, Claude Code, Cursor, Codex)

One command auto-detects and configures MCP servers and links all 6 specialist skills into your agent directories:

```bash
npx @sloppy-ai/cli setup --write
```

Reload your editor or agent session. That is it.

### In your terminal or CI

Run checks instantly with zero installation:

```bash
npx @sloppy-ai/cli check ./src
```

Or install globally to get the `sloppy` and `sloppy-ai` commands:

```bash
npm install -g @sloppy-ai/cli
```

Works with **Google Antigravity**, **Claude Code**, **Cursor**, **Codex**, **VS Code**, and any **CI/CD pipeline**.

---

## Why

AI models suffer from **distributional convergence**: when prompted to build modern UI, they default to the statistical average of their training corpora. Every generated page looks identical: saturated purple-to-indigo gradients, three floating cards with 1px borders, unearned infinite bounce animations, "10x faster with magical AI" copy, and decorative sparkle icons.

Stripping slop without aesthetic direction creates a sterile gray void. Sloppy pairs negative enforcement gates with positive material design systems to turn AI drafts into production-ready mastercraft:

| Dimension | Raw AI Slop | Bans Alone | DESIGN.md Alone | Sloppy (Bans + Direction) |
| :--- | :--- | :--- | :--- | :--- |
| **Visual Palette** | Saturated purple/indigo gradients | Monotonous flat gray `#121212` | Brand typography & colors | Restrained neutral ground + 1 semantic accent |
| **Card Layout** | 3 identical floating cards | 3 flat bordered cards | Styled but repetitive cards | Asymmetric bento grid + bleeding stage frame |
| **Interactions** | Unearned infinite bouncy loops | Zero animations (static text) | Generic CSS transitions | Cause-driven transitions + hover depth |
| **Copywriting** | "10x faster with magical AI" | Empty strings or placeholder text | Marketing claims in brand font | Concrete technical metrics + quiet `<Bar />` bars |
| **Iconography** | Sparkles & magic wands everywhere | Zero icons (blank buttons) | Uncurated icon sets | Semantic icons (`Activity`, `Zap`, `Terminal`) |
| **Verdict** | **Grade D (55/100)**: Low-taste slop | **Grade B (82/100)**: Sterile gray void | **Grade C (74/100)**: Styled slop | **Grade A+ (100/100)**: Lively Mastercraft |

---

## Three Ways Sloppy Runs

### 1. In your agent (MCP & Skills)

The lean 5-tool MCP server runs over stdio. When an agent edits UI, Sloppy provides an audit, repair plan, and auto-fix in a closed loop before work is marked complete:
* `sloppy_check`: Primary gate returning score, grade, violations, and recommended actions.
* `sloppy_plan`: Generates structured repair plans with patch diffs and confidence ratings.
* `sloppy_fix`: Transforms sloppy code into clean craft with verified diffs and wiring protection.
* `sloppy_catalog`: Queries curated components, patterns, master archetypes, and design looks.
* `sloppy_rules`: Authoritative anti-slop rules, guidelines, craft rubrics, and word budgets.

### 2. In your terminal

```bash
# Audit files against the slop threshold (exit 0 clean, 1 violations)
sloppy check ./src --json --fail-on high --max-score 20

# Score against the 10-point Craft Rubric (Grade A+ to F)
sloppy rubric ./src/components/Hero.tsx --strict

# Generate a repair plan with confidence and risk ratings
sloppy plan ./src/components/Hero.tsx --json

# Review unified diff before applying changes
sloppy fix ./src/components/Hero.tsx --diff

# Surgically repair only specific rule violations in-place
sloppy fix ./src/components/Hero.tsx --only VIS-02,COD-01 --write
```

### 3. In CI/CD Quality Gates

Add zero-tolerance anti-slop enforcement with automated GitHub Code Scanning SARIF annotations:

```yaml
- name: Sloppy Anti-Slop Gate
  uses: Pavanspoojary/sloppy@v1
  with:
    path: './src'
    fail-on: 'high'
    max-score: '0'
    upload-sarif: 'true'
```

---

## 3-Tier Severity Gates

Rules are divided into three operational tiers so CI never breaks on subjective taste:

* **Floor (Hard CI Blockers)**: Non-negotiable gates—WCAG contrast, broken mobile layouts, dead placeholder links, fake metrics, and lorem ipsum text. Fails `--strict` unconditionally.
* **Reflex (AI Defaults, Overrulable with Rationale)**: AI defaults (purple gradients, sparkle icons, unanchored floating windows, unearned animations) that fail by default, but pass if explicitly overruled with a written rationale in `sloppy.config.json` or inline:
  ```tsx
  // sloppy-ignore-next-line PURPLE_GRADIENT_SLOP -- Brand primary color approved in design review
  <div className="bg-gradient-to-r from-purple-500 to-indigo-500" />
  ```
* **Finish (Advisory Polish)**: Spacing rhythm, optical alignment, and subtle token balance. Reports warnings without blocking CI.

---

## The Wiring Guard

Developers fear automated AI rewrites that break functionality. Before modifying any file, Sloppy snapshots all interactive event handlers (`onClick`, `onSubmit`), form inputs (`name`, `id`), navigation links (`href`), headings, and test IDs. If an automated fix or agent redesign drops any connection, the fix is safely aborted, preserving your business logic.

---

## Modular Agent Skills

To preserve agent context windows while going deeper per domain, Sloppy provides 1 coordinator skill plus 5 on-demand specialist skills:

| Skill | Package | Focus | Referenced Rules |
| :--- | :--- | :--- | :--- |
| **`sloppy`** | [`@sloppy-ai/skill`](https://www.npmjs.com/package/@sloppy-ai/skill) | Master coordinator, CLI workflow, 3-tier severity gates, and wiring guard | All |
| **`sloppy-ui`** | [`@sloppy-ai/skill-ui`](https://www.npmjs.com/package/@sloppy-ai/skill-ui) | Surface elevation (Step 0 to 3), monochromatic ground, authentic icons | `VIS-01`, `VIS-02`, `VIS-03`, `VIS-06`, `VIS-07`, `VIS-08`, `MED-02`, `LIV-01` |
| **`sloppy-copywriting`** | [`@sloppy-ai/skill-copywriting`](https://www.npmjs.com/package/@sloppy-ai/skill-copywriting) | Word budgets (3-7 words per item), negative parallelism, metric proof | `CPY-01`, `CPY-02`, `CPY-04`, `CPY-05`, `CPY-06`, `CPY-07`, `TYP-08` |
| **`sloppy-human`** | [`@sloppy-ai/skill-human`](https://www.npmjs.com/package/@sloppy-ai/skill-human) | Engineering authenticity, real domain nouns, macOS chrome headers | Guidance |
| **`sloppy-layoutmobile`** | [`@sloppy-ai/skill-layoutmobile`](https://www.npmjs.com/package/@sloppy-ai/skill-layoutmobile) | Responsive framing, stage coverage (>=66%), breaking boxed cards | `STR-01`, `STR-02`, `LAY-01`, `UX-05` |
| **`sloppy-code`** | [`@sloppy-ai/skill-code`](https://www.npmjs.com/package/@sloppy-ai/skill-code) | Accessibility (`role`, `tabIndex`), zero dead callbacks, comment hygiene | `AX-01`, `UX-02`, `TOK-01`, `TOK-02`, `COD-01` |

Install all 6 skills across Antigravity, Claude Code, Cursor, and Codex:

```bash
npx @sloppy-ai/cli setup --write
```

---

## MCP Client Configuration

While `npx @sloppy-ai/cli setup --write` configures clients automatically, you can also configure manually:

### Cursor (`.cursor/mcp.json` or `~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "sloppy": {
      "command": "npx",
      "args": ["-y", "@sloppy-ai/cli", "mcp"]
    }
  }
}
```

### Claude Desktop / Claude Code (`~/.claude/mcp.json`)
```json
{
  "mcpServers": {
    "sloppy": {
      "command": "npx",
      "args": ["-y", "@sloppy-ai/cli", "mcp"]
    }
  }
}
```

### VS Code (`.vscode/mcp.json`)
```json
{
  "servers": {
    "sloppy": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sloppy-ai/cli", "mcp"]
    }
  }
}
```

*(Note: When installed globally via `npm install -g @sloppy-ai/cli`, `"command": "sloppy"` with `"args": ["mcp"]` is also supported)*

---

## Commands at a Glance

| Command | Usage | Description |
| :--- | :--- | :--- |
| `setup` | `sloppy setup [--write]` | Configure MCP clients and link Agent Skills across platforms. |
| `check` | `sloppy check <targets...> [--format sarif\|json] [--render] [--a11y]` | Primary quality gate with machine-readable verdicts and SARIF export. |
| `audit` | `sloppy audit <file\|dir>` | Detailed anti-pattern scan with line numbers and remediations. |
| `rubric` | `sloppy rubric <file> [--strict]` | 10-dimension craft rubric score (0-100) and certification grade (A+ to F). |
| `plan` | `sloppy plan <file>` | Structured repair plan with confidence levels and patch diffs. |
| `fix` | `sloppy fix <file> [--write] [--diff] [--stdin] [--only <ids>]` | Syntax-validated auto-repair with wiring protection. |
| `verify` | `sloppy verify [target] [--multi-width] [--a11y] [--motion <spec.json>]` | Multi-width responsive, contrast, and motion verification. |
| `archetypes` | `sloppy archetypes` | List the 10 synthesized multi-library master archetypes. |
| `create` | `sloppy create <archetype>` | Scaffold a master archetype into your component directory. |
| `looks` | `sloppy looks [--next]` | Display tokens or deal fresh material from anti-repetition memory. |
| `init` | `sloppy init [--from <url>]` | Scaffold React kit, or extract design DNA from live URL into config and `DESIGN.md`. |
| `hook` | `sloppy hook install [--cursor\|--claude\|--git]` | Install lightweight sub-30ms Floor checks for edit-time validation. |
| `dev` | `sloppy dev` | Launch the local visual comparison studio on port 1355. |
| `mcp` | `sloppy mcp` | Launch the stdio Model Context Protocol server. |
| `version` | `sloppy version [--json]` | Output CLI and core engine versions. |

---

## Canonical Rules Reference

Sloppy dual-indexes every rule by catalog classification code (`VIS-01`, `STR-01`, etc.) and descriptive slug identifier (`HERO_GRADIENT_TEXT`, `BOXED_CARD_SYNDROME`, etc.).

<!-- RULES:START (generated by scripts/sync-rules.mjs; do not edit by hand) -->
| ID | Slug | Title | Tier | Severity | Mode | Confidence | Kind | What it catches |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AX-01` | `FAKE_CONTROL_SLOP` | Inaccessible Fake Control | floor | high | detect-only | high | objective | Clickable div or span without role or keyboard access. |
| `COD-01` | `AI_NARRATION_COMMENT_SLOP` | AI Narration Comment Slop | finish | low | auto-fix | medium | craft | Line-by-line narration comments and divider banners. |
| `COD-02` | `CHAINED_TYPE_ASSERTION` | Chained Type Assertion (as unknown as) | reflex | high | detect-only | high | objective | Chained Type Assertion (as unknown as) |
| `COD-03` | `UNVALIDATED_DYNAMIC_RETURN` | Unvalidated Contract Return (any/unknown) | reflex | medium | detect-only | medium | craft | Unvalidated Contract Return (any/unknown) |
| `COD-04` | `BROAD_RECORD_SLOP` | Broad Dictionary Type (Record<string, any>) | reflex | medium | detect-only | high | craft | Broad Dictionary Type (Record<string, any>) |
| `COD-05` | `EMPTY_OBJECT_SPREAD` | Conditional Empty Object Spread | finish | low | detect-only | medium | craft | Conditional Empty Object Spread |
| `COD-06` | `NON_NULL_ASSERTION_SLOP` | Unsafe Chained Non-Null Assertion (!.) | floor | medium | detect-only | high | objective | Chained non-null assertions bypassing null checks. |
| `CPY-01` | `FABRICATED_SOCIAL_PROOF` | Fabricated Social Proof Metrics | floor | high | detect-only | medium | craft | Invented metrics, logos, or testimonials. |
| `CPY-02` | `STATUS_DOT_SLOP` | Unwired Pulsing Status Dots | reflex | medium | detect-only | medium | craft | Pulsing green status dot with no health endpoint behind it. |
| `CPY-03` | `AI_COPY_CLICHE` | Generic Marketing Clichés | reflex | medium | detect-only | medium | craft | Generic Marketing Clichés |
| `CPY-04` | `NEGATIVE_PARALLELISM` | Negative Parallelism Cliché | reflex | medium | detect-only | high | craft | Negative Parallelism Cliché |
| `CPY-05` | `AI_PROSE_FILLER` | Em-Dash, Rule-of-Three & Filler Copy | finish | medium | detect-only | low | craft | Em-dash chains, adjective triplets, false ranges, and vague attribution. |
| `CPY-06` | `CHATBOT_SIGN_OFF_SLOP` | Chatbot Conversational Artifacts | reflex | medium | detect-only | high | craft | Chatbot Conversational Artifacts |
| `CPY-07` | `LOREM_IPSUM_SLOP` | Placeholder & Lorem Ipsum Copy | floor | high | detect-only | high | objective | Placeholder & Lorem Ipsum Copy |
| `LAY-01` | `CENTER_ALIGNED_EVERYTHING` | Center-Aligned Monotony | reflex | medium | detect-only | medium | craft | Center-Aligned Monotony |
| `LIV-01` | `STERILE_SURFACE_SLOP` | Sterile Surface & Missing Liveliness | finish | low | detect-only | low | craft | Sterile Surface & Missing Liveliness |
| `MED-01` | `EMOJI_ICON_SLOP` | Raw Emojis as UI Icons | reflex | medium | detect-only | high | craft | Raw Emojis as UI Icons |
| `MED-02` | `SPARKLE_ICON_OVERLOAD` | Sparkle / Magic-Wand Icon Overload | reflex | high | auto-fix | high | craft | Decorative sparkle or magic-wand icons on generic actions. |
| `MOT-01` | `UNEARNED_ANIMATION` | Unearned Looping Animation | reflex | high | auto-fix | high | craft | Unearned Looping Animation |
| `MOT-02` | `UNBOUNDED_INFINITE_MOTION` | Unbounded Infinite Programmatic Motion | reflex | high | detect-only | high | craft | Infinite programmatic repeat/loop animations without a progress or spinner context. |
| `MOT-03` | `REDUCED_MOTION_BLINDNESS` | Missing Reduced-Motion Guard | floor | medium | detect-only | high | objective | Active runtime motion, scroll, 3D, or Lottie code missing a prefers-reduced-motion guard. |
| `MOT-04` | `LAYOUT_THRASH_ANIMATION` | Layout-Thrashing Property Animation | reflex | medium | detect-only | medium | objective | Programmatic animation of layout geometry (width, height, top, left, margin, padding). |
| `MOT-05` | `UNMANAGED_WEBGL_OR_MEDIA_LOOP` | Unmanaged WebGL, Lottie, or Scroll Loop | floor | high | detect-only | high | objective | Uncleaned WebGL, Lottie, or scroll instances and unbounded R3F Canvas render loops. |
| `MOT-06` | `TRANSITION_ALL_SLOP` | Cross-Property Transition Slop (transition: all) | reflex | medium | detect-only | high | craft | `transition: all` / `transition-all` animating unknown properties. |
| `MOT-07` | `SLOW_INTERACTION_MOTION` | Slow Interaction Feedback | reflex | medium | detect-only | medium | craft | Hover, press, or focus feedback slower than ~600ms. |
| `MOT-08` | `SCROLL_REVEAL_SATURATION` | Scroll-Reveal Saturation | reflex | medium | detect-only | medium | craft | Every section revealed on scroll and hidden until JavaScript runs. |
| `MOT-09` | `AUTOPLAY_MOTION_WITHOUT_CONTROL` | Autoplay Motion Without Pause Control | floor | high | detect-only | high | objective | Marquee, ticker, carousel, or video that runs automatically with no pause control. |
| `MOT-10` | `FLASHING_ANIMATION` | Flashing or Strobe Animation | floor | high | detect-only | high | objective | Blink, flash, or strobe animation above the three-per-second limit. |
| `MOT-11` | `SCALE_FROM_ZERO` | Entrance From scale(0) | reflex | low | detect-only | medium | craft | An entrance that starts at scale(0) and reads as a pop-in. |
| `MOT-12` | `CSS_LOOP_NO_REDUCED_GUARD` | CSS Loop Without Reduced-Motion Guard | reflex | medium | detect-only | medium | craft | Looping CSS animation with no prefers-reduced-motion fallback. |
| `MOT-13` | `VESTIBULAR_RISK_MOTION` | Vestibular-Risk Parallax or 3D Tilt | reflex | medium | detect-only | medium | craft | Full-area parallax, fixed backgrounds, and 3D hover tilt. |
| `MOT-14` | `UNEARNED_HOVER_LIFT` | Hover Motion on a Non-Interactive Surface | reflex | medium | detect-only | high | craft | Hover lift or scale on a surface that is not clickable. |
| `MOT-15` | `UNIFORM_ENTRANCE_MOTION` | Uniform Entrance Motion | reflex | medium | detect-only | medium | craft | One identical fade-up on four or more blocks, or mount motion on headings, paragraphs, and navigation. |
| `MOT-16` | `ELASTIC_UI_EASING` | Overshoot/Elastic Easing on UI Motion | reflex | medium | detect-only | medium | craft | Overshoot or elastic cubic-bezier easing on routine surfaces instead of ease-out. |
| `MOT-17` | `WILL_CHANGE_LEAK` | Permanent will-change Layer Hint | finish | low | detect-only | medium | craft | will-change declared across several elements and left on permanently. |
| `MOT-18` | `OFF_CONTRACT_MOTION` | Off-Contract Motion Duration | finish | low | detect-only | medium | craft | A duration beyond the motion scale declared in DESIGN.md. |
| `STR-01` | `BOXED_CARD_SYNDROME` | Boxed Card Monotony | reflex | medium | detect-only | medium | craft | Boxed Card Monotony |
| `STR-02` | `UNANCHORED_FLOATING_WINDOW` | Unanchored Floating Window | reflex | high | detect-only | medium | craft | Unanchored Floating Window |
| `STR-03` | `FLAT_SURFACE_MONOTONY` | Flat Surface Monotony | reflex | medium | detect-only | medium | craft | Flat Surface Monotony |
| `TOK-01` | `Z_INDEX_CHAOS` | Arbitrary Z-Index Escalation | floor | medium | detect-only | high | objective | Arbitrary Z-Index Escalation |
| `TOK-02` | `DESIGN_TOKEN_DRIFT` | Off-Contract Design Token | reflex | medium | detect-only | high | objective | A hard-coded color outside the palette locked in DESIGN.md. |
| `TYP-08` | `WORD_BUDGET_EXCEEDED` | Word Budget Exceeded | reflex | high | auto-fix | medium | craft | Word Budget Exceeded |
| `UX-02` | `DEAD_PLACEHOLDER_SLOP` | Dead Placeholder Handlers | floor | medium | detect-only | high | objective | Dead anchors or empty click handlers. |
| `UX-05` | `SCROLL_HIJACKING` | Scroll Hijacking & Wheel Interference | floor | high | detect-only | high | objective | Global scroll locks or wheel interception. |
| `VIS-01` | `HERO_GRADIENT_TEXT` | Hero Gradient Text | reflex | high | detect-only | high | craft | Gradient text clipped to a transparent heading fill. |
| `VIS-02` | `PURPLE_GRADIENT_SLOP` | Purple/Indigo Gradient Palette | reflex | critical | auto-fix | high | craft | Purple, indigo, or violet gradients used as a default accent. |
| `VIS-03` | `EMERALD_MONOCULTURE` | Gen-2 Emerald Dark-Mode Monoculture | reflex | high | detect-only | high | craft | Gen-2 emerald-on-dark accents with no declared brand token. |
| `VIS-06` | `BLUR_OVERUSE` | Glassmorphism Blur Overuse | reflex | medium | detect-only | high | craft | Backdrop blur used as the default surface instead of a rare overlay. |
| `VIS-07` | `GLOW_SHADOW` | Colored Glow Shadows | reflex | medium | detect-only | medium | craft | Colored ambient glow shadows around cards or controls. |
| `VIS-08` | `LOW_CONTRAST_GRAY` | Low Contrast Gray Text | floor | high | detect-only | high | objective | Body or label text below WCAG AA contrast. |
| `VIS-09` | `MADE_UP_AI_BADGE` | Fabricated AI Badge | reflex | medium | detect-only | medium | craft | Fabricated AI Badge |
<!-- RULES:END -->

---

## Packages Ecosystem

Published under the `@sloppy-ai` npm organization:

| Package | Description | Version |
| :--- | :--- | :--- |
| [`@sloppy-ai/cli`](https://www.npmjs.com/package/@sloppy-ai/cli) | Developer CLI, setup orchestrator, and CI quality gate | `1.1.0` |
| [`@sloppy-ai/core`](https://www.npmjs.com/package/@sloppy-ai/core) | Core rules, scoring engine, AST fixers, and repair planner | `1.1.0` |
| [`@sloppy-ai/mcp`](https://www.npmjs.com/package/@sloppy-ai/mcp) | Lean 5-tool Model Context Protocol server for AI agents | `1.1.0` |
| [`@sloppy-ai/kit`](https://www.npmjs.com/package/@sloppy-ai/kit) | Portable React craft primitives (`Stage`, `Window`, `Follow`, `Fly`, `Expand`) | `1.1.0` |
| [`@sloppy-ai/verify`](https://www.npmjs.com/package/@sloppy-ai/verify) | Geometric, rendered contrast, and motion verification engine | `1.1.0` |
| [`@sloppy-ai/skill`](https://www.npmjs.com/package/@sloppy-ai/skill) | Universal coordinator skill with 8 reference manuals | `1.4.0` |
| [`@sloppy-ai/skill-ui`](https://www.npmjs.com/package/@sloppy-ai/skill-ui) | Specialist skill: visual surfaces, elevation, monochromatic ground | `1.4.0` |
| [`@sloppy-ai/skill-code`](https://www.npmjs.com/package/@sloppy-ai/skill-code) | Specialist skill: TypeScript architecture, a11y, comment hygiene | `1.4.0` |
| [`@sloppy-ai/skill-copywriting`](https://www.npmjs.com/package/@sloppy-ai/skill-copywriting) | Specialist skill: word budgeting, anti-cliche, concrete proof | `1.4.0` |
| [`@sloppy-ai/skill-human`](https://www.npmjs.com/package/@sloppy-ai/skill-human) | Specialist skill: engineering authenticity and real domain nouns | `1.4.0` |
| [`@sloppy-ai/skill-layoutmobile`](https://www.npmjs.com/package/@sloppy-ai/skill-layoutmobile) | Specialist skill: responsive framing and breaking boxed cards | `1.4.0` |

---

## Documentation

* [Formal AI Slop Catalog](docs/AI_SLOP_CATALOG.md) - Complete classification taxonomy and specimen analysis.
* [Rules & Evidence Reference](docs/RULES.md) - Evidence kinds, confidence ratings, and false-positive controls.
* [Playbook & Gap Map](docs/PLAYBOOK_GAP_MAP.md) - Capability boundaries and verification roadmap.
* [Motion Review Manual](skills/sloppy/references/motion-review.md) - Causality, timing, easing, and reduced-motion standards.
* [Standalone Prompt (`sloppy.md`)](sloppy.md) - Zero-install system instructions for ChatGPT, Claude.ai, v0, and Bolt.

---

## License

MIT
