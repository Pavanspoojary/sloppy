# Sloppy: The Anti-Slop Design Engine, Quality Gate & MCP Server

A deterministic anti-slop design engine, portable React kit, Model Context Protocol (MCP) server, developer CLI, and universal agent skill. Sloppy eliminates low-taste AI UI anti-patterns—unwarranted purple gradients, unanchored floating windows, sparkle icons, unearned bouncy animations, fake text overload, and inaccessible fake controls—across AI coding assistants and modern web applications.

---

## Setup & Installation

Sloppy provides a direct setup workflow for developers, CI pipelines, and autonomous agent environments.

### Prerequisites

* **Node.js**: Version 18.0.0 or higher (`node -v`)
* **npm**: Version 9.0.0 or higher (`npm -v`)
* **git**: Required for repository cloning and version synchronization

### 1. Direct Shell Installer (macOS & Linux)

Install Sloppy into user space (`~/.local/bin/sloppy` and `~/.sloppy`) with one pinned command:

```bash
curl -fsSL https://raw.githubusercontent.com/Pavanspoojary/sloppy/v1.0.0/scripts/install.sh | bash
```

> **Security & System Isolation Notice**: The install script operates strictly in user space (`~/.sloppy` and `~/.local/bin`). It does not require root permissions, does not modify system-level directories such as `/usr/local/bin`, and verifies all prerequisites prior to compilation.

### 2. Cross-Platform Source Installation (macOS, Linux, Windows)

For Windows environments (PowerShell) or developers working directly from source:

```bash
# Clone the repository
git clone https://github.com/Pavanspoojary/sloppy.git
cd sloppy

# Install dependencies and build all packages
npm install
npm run build

# Link the CLI globally in user space
npm link --workspace=sloppy

# Run initial setup to register MCP servers and agent skills
sloppy setup --write
```

### 3. Registry & Direct Execution Status

* **NPM Registry**: Official publication to the npm registry with provenance is currently in progress. During this release phase, running `npx sloppy` from the registry is replaced by the direct curl installer or local repository checkout shown above.
* **Direct Execution from GitHub**: You can execute the CLI directly via npx using the GitHub source:
  ```bash
  npx github:Pavanspoojary/sloppy check ./src
  ```

### Environment Overrides

The installer and CLI recognize the following environment variables:
* `SLOPPY_DIR`: Installation directory (defaults to current repository root or `~/.sloppy`).
* `SLOPPY_BIN_DIR`: Target directory for the executable wrapper (defaults to `~/.local/bin`).
* `SLOPPY_REF`: Git tag or branch to checkout during installation (defaults to `v1.0.0`).

---

## The Complete Anti-Slop Stack

| Layer | Component | Description |
|---|---|---|
| **CLI & Quality Gate** | `sloppy` | Deterministic linter, AST-validated auto-fixer, repair planner, and CI quality gate. |
| **Agent Protocol** | `@sloppy/mcp` | Lean 5-tool stdio server enabling autonomous agents to audit, plan, and repair code in a closed loop. |
| **Agent Skill** | `skills/sloppy` | Universal skill with 7 reference manuals (`craft`, `framing`, `motion`, `bento`, `word_budget`, `looks`, `rehearse`). |
| **UI Primitives** | `@sloppy/kit` | Portable React and plain CSS components enforcing grounded framing, surface elevation, and caused motion. |
| **Master Archetypes** | 10 Archetypes | Production-grade blueprints combining 7 UI libraries into cohesive, Grade A+ interfaces. |
| **Design Looks** | 15 Token Sets | Curated looks (`minimal`, `linear`, `blueprint`, `dark-hero`, `raycast`) and Refero production looks (`nuxt`, `grafana`, `modern-treasury`). |

---

## Why Sloppy Exists: Eradicating AI UI Slop

AI coding models exhibit **distributional convergence**: when given generic prompts ("build a modern dashboard"), they sample the statistical average of their training corpora, producing interchangeable, low-taste interfaces. 

Sloppy identifies, lints, and remediates AI slop patterns cataloged with formal specifications in [docs/AI_SLOP_CATALOG.md](docs/AI_SLOP_CATALOG.md).

### Dual Rule-ID Architecture

Sloppy unifies catalog classification codes (`VIS-01`, `STR-01`, `AX-01`, `CPY-01`, etc.) and descriptive slug identifiers (`HERO_GRADIENT_TEXT`, `BOXED_CARD_SYNDROME`, `FAKE_CONTROL_SLOP`, `FABRICATED_SOCIAL_PROOF`, etc.) as 100% interchangeable aliases across CLI reporting, `sloppy.config.json` rules tables, and inline code comments (`sloppy-ignore-next-line`).

| Rule ID | Canonical Slug | Severity | Description |
|---|---|---|---|
| `VIS-01` | `HERO_GRADIENT_TEXT` | High | `bg-clip-text text-transparent` with purple/indigo/cyan gradient fills. |
| `VIS-02` | `PURPLE_GRADIENT_SLOP` | Critical | Arbitrary purple, indigo, or violet gradient backgrounds on cards and hero bands. |
| `VIS-03` | `SPARKLE_ICON_OVERLOAD` | High | Decorative sparkle, magic wand, or orb icons (`LucideSparkles`, `Wand2`) on generic actions. |
| `VIS-08` | `LOW_CONTRAST_GRAY` | High | Murky gray body text failing WCAG AA 4.5:1 contrast requirements. |
| `VIS-09` | `MADE_UP_AI_BADGE` | Medium | Fabricated marketing tags ("Powered by AI", "Smart AI", "Generate with AI"). |
| `STR-01` | `BOXED_CARD_SYNDROME` | Medium | Symmetrical repetition of 3+ identical boxed cards with uniform borders and padding. |
| `STR-02` | `UNANCHORED_FLOATING_WINDOW` | High | Shrinking applications into miniature centered cards with uniform ambient air. |
| `STR-03` | `FLAT_SURFACE_MONOTONY` | Medium | Repetition of 4+ surface elements sharing identical backgrounds and borders without depth steps. |
| `LAY-01` | `CENTER_ALIGNED_EVERYTHING` | Medium | Global text and element centering with zero leading-edge anchor. |
| `MOT-01` | `UNEARNED_ANIMATION` | High | Looping bounces, pulses, pings, or infinite spins uncaused by user action or loading state. |
| `MED-01` | `EMOJI_ICON_SLOP` | Medium | Raw Unicode emojis embedded in UI buttons, nav items, or headers instead of crisp SVG icons. |
| `CPY-01` | `FABRICATED_SOCIAL_PROOF` | High | Invented round numbers ("50,000+ teams", "99.99% uptime") and fake customer testimonials. |
| `CPY-03` | `AI_COPY_CLICHE` | Medium | Generic marketing clichés ("Unlock the power of", "Supercharge your workflow", "10x your output"). |
| `CPY-04` | `NEGATIVE_PARALLELISM` | Medium | Contrast reframes ("Not just a tool — it's an intelligent workspace"). |
| `CPY-06` | `CHATBOT_SIGN_OFF_SLOP` | Medium | Leftover conversational filler ("I hope this helps!", "In conclusion", "Overall, it is important"). |
| `CPY-07` | `LOREM_IPSUM_SLOP` | High | Dummy Latin placeholder copy (`lorem ipsum`, `dolor sit amet`) or synthetic names (`John Doe`). |
| `AX-01` | `FAKE_CONTROL_SLOP` | High | Inaccessible clickable `<div>` or `<span>` lacking keyboard accessibility and ARIA roles. |
| `UX-01` | `INTERACTIVE_STATES_MISSING` | High | Hover-only controls lacking `:focus-visible`, `:active`, `:disabled`, and empty states. |
| `UX-02` | `DEAD_PLACEHOLDER_SLOP` | Medium | Dead placeholder links (`href="#"`), empty click handlers (`onClick={() => {}}`), and 404 targets. |
| `UX-05` | `SCROLL_HIJACKING` | High | Global `overflow-hidden` on `<html>` or `<body>`, or custom wheel event interception. |
| `TOK-01` | `Z_INDEX_CHAOS` | Medium | Arbitrary extreme z-index classes (`z-[9999]`, `z-[99999]`) and token drift. |
| `TYP-08` | `WORD_BUDGET_EXCEEDED` | High | Visible word count exceeding the declared surface budget limit. |
| `COD-01` | `AI_NARRATION_COMMENT_SLOP` | Low | AI narration comments (`// Render the button`, `// Main container`, section divider banners). |
| `COD-02` | `CHAINED_TYPE_ASSERTION` | High | Fabricated type safety via chained assertions (`as unknown as T`, `as any as T`). |
| `COD-03` | `UNVALIDATED_DYNAMIC_RETURN` | Medium | Unvalidated contract returns (`(): any`, `(): Promise<unknown>`) lacking schema guards. |
| `COD-04` | `BROAD_RECORD_SLOP` | Medium | Broad dictionary types (`Record<string, any>`) erasing TypeScript safety boundaries. |
| `COD-05` | `EMPTY_OBJECT_SPREAD` | Low | Conditional empty object spreads (`...(condition ? { key } : {})`). |
| `COD-06` | `NON_NULL_ASSERTION_SLOP` | Medium | Unsafe chained non-null assertions (`foo!.bar!.baz`) bypassing defensive null checks. |
| `LIV-01` | `STERILE_SURFACE_SLOP` | Low | Interactive controls lacking hover/focus/transition states, resulting in a sterile gray void. |

---

## The 4-Way Architectural Proof: Why Bans Alone Create Sterile UI

Stripping slop without aesthetic direction creates a lifeless, sterile page. Sloppy pairs negative enforcement gates with positive material design systems to achieve lively mastercraft:

| Dimension | 1. Raw AI Slop | 2. Anti-Slop Bans Alone | 3. DESIGN.md Alone | 4. Sloppy (Bans + Material Direction) |
| :--- | :--- | :--- | :--- | :--- |
| **Visual Palette** | Saturated purple/indigo gradients | Monotonous flat gray `#121212` | Brand typography & colors | Restrained neutral ground + 1 semantic accent |
| **Card Layout** | 3 identical floating cards | 3 flat bordered cards | Styled but repetitive cards | Asymmetric bento grid + bleeding stage frame |
| **Micro-Interactions** | Unearned infinite bouncy loops | Zero animations (static text) | Generic CSS transitions | Cause-driven transitions + hover depth |
| **Copywriting** | "10x faster with magical AI" | Empty strings or missing text | Marketing claims in brand font | Concrete technical metrics + quiet `<Bar />` bars |
| **Iconography** | Sparkles & magic wands everywhere | Zero icons (blank buttons) | Uncurated icon sets | Semantic Lucide icons (`Activity`, `Zap`, `Terminal`) |
| **Overall Verdict** | **Grade D (55/100)**: Low-taste slop | **Grade B (82/100)**: Sterile gray void | **Grade C (74/100)**: Styled slop | **Grade A+ (100/100)**: Lively Mastercraft |

---

## Modular On-Demand Specialist Skills

To preserve agent context windows while going deeper per domain, Sloppy splits into 1 core coordinator skill plus 5 on-demand specialists:

| Skill | Directory | Primary Focus | Referenced Rule IDs |
| :--- | :--- | :--- | :--- |
| **`sloppy`** | `skills/sloppy/` | Master coordinator, CLI workflow, 3-tier severity gates, and wiring guard | All |
| **`sloppy-ui`** | `skills/sloppy-ui/` | Surface elevation (Step 0 to 3), monochromatic ground, authentic icons | `VIS-01`, `VIS-02`, `VIS-03`, `VIS-08`, `LIV-01` |
| **`sloppy-copywriting`** | `skills/sloppy-copywriting/` | Word budgets (3-7 words per item), negative parallelism, metric proof | `CPY-01`, `CPY-04`, `CPY-06`, `CPY-07`, `TYP-08` |
| **`sloppy-human`** | `skills/sloppy-human/` | Engineering authenticity, real domain nouns, macOS chrome headers | `REAL_WORLD_CHROME_MISSING`, `AUTHENTIC_MICROCOPY` |
| **`sloppy-layoutmobile`** | `skills/sloppy-layoutmobile/` | Responsive framing, stage coverage (>=66%), breaking boxed cards | `STR-01`, `STR-02`, `LAY-01`, `UX-05` |
| **`sloppy-code`** | `skills/sloppy-code/` | Accessibility (`role`, `tabIndex`), zero dead callbacks, comment hygiene | `AX-01`, `UX-02`, `TOK-01`, `COD-01` |

Install any skill individually via:
```bash
npx skills add Pavanspoojary/slopy -g
```

---

## Approval-Gated Audits & Surgical Fixes (`--only`)

Developers fear indiscriminate AI rewrites that scramble business logic. Sloppy introduces **During vs After approval gates**:

1. **During Mode (Real-Time)**: Fast sub-30ms Floor checks run on file edit via editor hooks.
2. **After Mode (Approval-Gated)**:
   ```bash
   # Generates audit-001-YYYY-MM-DD.md with numbered findings and pauses modifications:
   sloppy audit ./src --mode after
   ```
3. **Surgical Fix Execution (`--only`)**:
   ```bash
   # Surgically repair only approved item numbers:
   sloppy fix src/Card.tsx --only 1,3,5 --write
   
   # Or target specific rule IDs:
   sloppy fix src/Card.tsx --only VIS-02,COD-01 --write
   ```

---

## Native Plugin Doors & Standalone `sloppy.md`

- **Native Plugin Doors**: Sloppy ships zero-overhead manifests for Claude Code (`.claude-plugin/`), Cursor (`.cursor-plugin/`), Codex (`.codex-plugin/`), and Cline (`.cline-plugin/`). Run `sloppy setup --write` to register all clients automatically.
- **Standalone `sloppy.md`**: For chat-only users (ChatGPT, Claude.ai, v0, Bolt, DeepSeek), copy the standalone [sloppy.md](sloppy.md) prompt file directly into chat as system instructions. Zero CLI or Node.js installation required.


---

## Scoped Anti-Slop Commandments

The five commandments enforce visual discipline calibrated to specific UI contexts:

1. **Restraint over detail (Context-Calibrated Word Budget)**:
   * **Visual Hero Mockups & Cards**: Limit visible text to 3 to 7 real strings per preview screen. Use `<Bar />` or `<Skeleton />` geometry for structural filler so the interface reads as a product rather than a wall of placeholder text.
   * **Full-Page Applications & Dashboards**: Adhere to configured surface word budgets (40 words for heroes, 150 to 200 words for operational application layouts).
2. **Grounded framing over floating boxes (Scoped Stage Coverage)**:
   * **Hero Product Mockups**: Windows and previews must occupy >= 66% of the stage area and bleed off at least one viewport edge to avoid miniature toy-window looks.
   * **Responsive Document Flow**: Standard full-page application views and data tables follow natural responsive grid and flex container flow.
3. **Surface depth over flat borders**:
   * Step cleanly from ground to surfaces 1, 2, and 3 with monotonic contrast steps rather than repetitive 1px borders.
4. **Caused motion over random bounce**:
   * Movement requires an explicit user trigger, critically damped physical spring easing, and held payoffs. Ban unearned looping animations.
5. **Authentic craft over sparkle slop**:
   * Real platform chrome, disciplined typography, semantic native HTML controls, and monochromatic restraint.

---

## Developer & Agent Workflow

Sloppy enforces a closed agent loop: **detect, plan, fix, verify, re-check**.

```bash
# 1. Gate: Audit files against the slop threshold (exit 0 clean, 1 violations)
sloppy check ./src --json --fail-on high --max-score 20

# Export OASIS SARIF 2.1.0 for GitHub Code Scanning / CI security tab
sloppy check ./src --format sarif > results.sarif

# Real-time watch mode during development
sloppy check ./src --watch

# Declare the rendered surface when testing application screens or heroes
sloppy check ./src/screens/Dashboard.tsx --type application --json

# 2. Score against the 10-point Craft Rubric (Grade A+ to F)
sloppy rubric ./src/components/Hero.tsx --strict

# 3. Plan: Generate patch snippets with confidence and risk ratings
sloppy plan ./src/components/Hero.tsx --json

# 4. Review the exact unified diff before modifying source
sloppy fix ./src/components/Hero.tsx --diff

# 5. Apply verified repair in-place
sloppy fix ./src/components/Hero.tsx --write --json

# 6. Re-check: Verify the updated file passes clean
sloppy check ./src/components/Hero.tsx --json
```

### Stdin Streaming

Sloppy supports piping source code through standard input for editor extensions, agent hooks, and scripts:

```bash
echo '<div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl border p-6" />' \
  | sloppy fix --stdin --json
```

---

## CLI Command Reference

| Command | Usage | Description |
|---|---|---|
| `setup` | `sloppy setup [--write]` | Configure MCP clients (Cursor, VS Code, Claude, Codex) and link Agent Skills. |
| `check` | `sloppy check <paths...> [--format sarif\|json] [--watch]` | Primary quality gate with machine-readable verdicts, SARIF export, and exit codes. |
| `audit` | `sloppy audit <file\|dir>` | Detailed anti-pattern scan with line numbers, code snippets, and remediations. |
| `rubric` | `sloppy rubric <file> [--strict]` | 10-dimension craft rubric score (0-100) and certification grade (A+ to F). |
| `plan` | `sloppy plan <file>` | Structured repair plan with confidence levels, risk ratings, and patch diffs. |
| `fix` | `sloppy fix <file> [--write] [--diff] [--stdin]` | Syntax-validated auto-repair replacing slop with clean craft. |
| `verify` | `sloppy verify [target]` | Visual verification engine failing closed if a browser is unavailable. |
| `install-mcp` | `sloppy install-mcp --client <id>` | Write MCP configuration for Cursor, VS Code, Claude, or Codex. |
| `archetypes` | `sloppy archetypes` | List the 10 synthesized multi-library master archetypes. |
| `create` | `sloppy create <archetype>` | Scaffold a master archetype into your component directory. |
| `looks` | `sloppy looks` | Display design tokens and surface steps for curated and Refero looks. |
| `libs` | `sloppy libs` | List the 7 integrated UI libraries and their design roles. |
| `list` | `sloppy list [library]` | Search and list curated components across the ecosystem. |
| `init` | `sloppy init [--from <url>]` | Scaffold React kit, or extract design DNA from live URL/dev-server into `sloppy.config.json` and `DESIGN.md`. |
| `looks` | `sloppy looks [--next]` | Display tokens or deal fresh material from anti-repetition memory. |
| `verify` | `sloppy verify [target] [--multi-width] [--static]` | Multi-width responsive verification (8 widths) with static AST fallback. |
| `hook` | `sloppy hook install [--cursor\|--claude\|--git]` | Install lightweight sub-30ms Floor checks for edit-time validation. |

---

## 7 High-Leverage Hallmark Adaptations

Sloppy incorporates 7 architectural features inspired by Hallmark to make CI adoption painless and eliminate the developer fear of broken UI rewrites:

### 1. 3-Tier Severity Gates (Floor / Reflex / Finish)
Rules are divided into three clear operational tiers:
- **Floor (Hard CI Blockers)**: Non-negotiable gates—WCAG contrast, broken mobile layout/overflow, dead placeholder links, fake metrics, and lorem ipsum text. Fails `--strict` unconditionally.
- **Reflex (AI Defaults, Overrulable with Rationale)**: AI defaults (purple gradients, sparkle icons, unanchored floating windows, unearned animations) that fail by default, BUT pass if explicitly overruled with a written rationale in `sloppy.config.json` (`"overrules": { "PURPLE_GRADIENT_SLOP": "Brand primary" }`) or inline:
  `// sloppy-override: PURPLE_GRADIENT_SLOP Client requested brand purple gradient`
- **Finish (Advisory Polish)**: Spacing rhythm, optical alignment, and subtle token balance. Never blocks CI.

### 2. The Wiring Guard (`--kept` / `--before`)
Before any automated fix or agent redesign touches a file, Sloppy snapshots all interactive event handlers (`onClick`, `onSubmit`), form inputs (`name`, `id`, `type`), navigation links (`href`, `to`), headings, and test IDs. If the transformation drops any connection, the fix is aborted, preserving business logic.

### 3. Multi-Width Render Verification (8 Widths with Static Fallback)
Tests real rendered contrast, mobile horizontal overflow, and above-the-fold hero framing across 8 canonical viewports (375px to 1920px). When Playwright or Chrome is not installed, Sloppy cleanly falls back to static AST inspection without failing or crashing.

### 4. Decoupled Materials & Anti-Repetition Engine
Themes are treated as pure lightweight materials (≤8 KB of surface, border, typography, and accent tokens) completely separated from page layout. `sloppy looks --next` tracks recently dealt looks so generated outputs never repeat the same theme twice.

### 5. Design DNA Extractor (`sloppy init --from <url>`)
Extracts typography stacks, color palettes, and surface hierarchy directly from a live URL or running local dev-server, automatically generating `sloppy.config.json` and a complete `DESIGN.md`.

### 6. Lightweight Edit-Time Floor Hook (`sloppy hook install`)
Installs sub-30ms Floor checks for Cursor (`.cursor/hooks/on-save.sh`), Claude Code (`.claude/hooks/post-edit.sh`), or Git (`.githooks/pre-commit`). Catches dead links, fake metrics, and contrast bugs in real time before the agent finishes its loop.

### 7. Universal Skills Distribution (`npx skills add`)
`skills/sloppy` is packaged as a standalone skill descriptor, installable globally across platforms:
```bash
npx skills add Pavanspoojary/slopy -g
```
| `dev` | `sloppy dev` | Launch the local visual playground and comparison studio on port 1355. |
| `mcp` | `sloppy mcp` | Launch the stdio Model Context Protocol server. |
| `version` | `sloppy version [--json]` | Output CLI and core engine versions. |

### Exit Code Contract

* `0`: Clean, or the configured gate passed.
* `1`: Slop violations detected at or above the failure threshold.
* `2`: Usage error, missing target, I/O failure, or verification unavailable.

---

## Dual Scales & Independent Verification

To eliminate circular self-grading, Sloppy distinguishes between two independent evaluation metrics:

### 1. Slop Score (AST Violation Count, 0–100, Lower is Better)
The linter metric is an error-density scale computed from weighted static AST anti-pattern violations:
* `0`: Pristine craft; zero detected AI slop patterns.
* `1–19`: Minor advisory notices; passes lenient gates.
* `>= 20`: Fails the default CI quality gate.

### 2. Craft Rubric Score (Weighted Quality, 0–100, Higher is Better)
The certification metric evaluates architectural craft across 10 distinct dimensions (0 to 10 points each):
* **Grade A+ (95–100)**: Flawless craft certified.
* **Grade A (90–94)**: Production ready.
* **Grade B (80–89)**: Acceptable with minor polish required.
* **Grade C (70–79)**: Noticeable slop anti-patterns.
* **Grade D (50–69)**: Substandard craft.
* **Grade F (< 50)**: Severe AI slop failure.

### The 10 Craft Dimensions

1. **Surface Elevation & Grounding (0-10)**: Grounded surface steps (0, 1, 2, 3); zero floating unanchored cards.
2. **Word Budget & Text Restraint (0-10)**: Context-aware word budget; `<Bar />` placeholder geometry for structural density.
3. **Motion Intentionality & Easing (0-10)**: Caused transitions with critically damped springs; zero unearned bounces.
4. **Visual Focal Hierarchy (0-10)**: Unmistakable dominant focal node; clear primary/secondary visual weight.
5. **Icon Authenticity (0-10)**: Authentic domain icons; zero decorative sparkles or magic wands on generic actions.
6. **Monochromatic Restraint (0-10)**: Neutral ground palette; single intentional accent color reserved for signals.
7. **Framing & Bleeding Rules (0-10)**: Mockup covers >= 66% of stage; bleeds secondary panels off stage frame.
8. **Density & Spacing Rhythm (0-10)**: Tight information density; disciplined typographic scale and padding.
9. **Real-World Chrome Integrity (0-10)**: Realistic window headers, monospace route tags, and platform details.
10. **Semantic Correctness & Contrast (0-10)**: High computed WCAG AA contrast (>= 4.5:1), native semantic HTML elements (`<button>`, `<a>`, `<input>`), and keyboard focus visibility; penalizes redundant ARIA attributes (`<button role="button">`) and inaccessible fake controls.

### Independent Verification Evidence

Auto-repair is never certified by circular linter scores alone. Sloppy subjects every transformed component to independent external verification:
* **TypeScript AST Syntax Validation**: Transformed code must compile without errors under `tsc --noEmit`.
* **Playwright Computed-Style Luminance**: Headless verification measures rendered color contrast against WCAG AA standards (4.5:1 for body copy, 3.0:1 for large text).
* **Semantic DOM Integrity**: Buttons and interactive controls must be native HTML elements or carry complete keyboard navigation event bindings.

---

## Benchmark Provenance & Empirical Precision Rate

### Fixture Provenance (v0, Bolt, Lovable)

Sloppy benchmarks automated transformations against raw generative AI outputs stored in `benchmarks/fixtures/`:

* **v0 Analytics Dashboard (`v0-analytics-dashboard.tsx`)**:
  * **Source**: v0.dev (Anthropic Claude 3.5 Sonnet engine).
  * **Date Generated**: November 2024.
  * **Prompt**: *"Build a modern analytics dashboard for a SaaS platform with revenue metrics, usage charts, activity tables, and team members."*
  * **Raw Slop Score**: 88/100 (Severe purple gradient stops, 6 decorative sparkle icons, low-contrast text).
* **Bolt SaaS Pricing Matrix (`bolt-saas-pricing.tsx`)**:
  * **Source**: Bolt.new.
  * **Date Generated**: November 2024.
  * **Prompt**: *"Create a responsive SaaS pricing page with monthly/annual billing toggle, three tier cards, feature checklists, and FAQ."*
  * **Raw Slop Score**: 74/100 (Center-aligned layout monotony, identical boxed cards, unanchored floating container).
* **Lovable Cockpit Interface (`lovable-cockpit.tsx`)**:
  * **Source**: Lovable.dev.
  * **Date Generated**: November 2024.
  * **Prompt**: *"Design an AI prompt engineering cockpit with agent status cards, token graphs, and playground."*
  * **Raw Slop Score**: 82/100 (Negative parallelism, fake social proof metrics, decorative pulsing dots).

Execute the reproducible benchmark suite:
```bash
node --test test/benchmarks.test.mjs
```

### Empirical Precision Rate (False-Positive Benchmark)

A reliable linter must not flag well-crafted human code. Sloppy was benchmarked against 10 flagship human-crafted production design systems and component libraries:

1. **Radix UI Primitives** (Accessible headless UI)
2. **Tailwind UI / Catalyst** (Modern application kit by Tailwind Labs)
3. **Vercel Geist** (Design system powering Vercel and Next.js)
4. **GitHub Primer** (GitHub production design system)
5. **Stripe Elements & Dashboard Examples** (Production financial UI)
6. **Nuxt UI** (Official Nuxt design framework)
7. **Shadcn UI Reference Components** (Curated production examples)
8. **Base UI** (MUI accessible unstyled primitives)
9. **Ariakit** (Toolkit for building accessible web apps)
10. **Adobe Spectrum Web Components** (Enterprise design system)

* **Codebase Volume Evaluated**: 10,480 lines of production TypeScript and TSX code.
* **Measured False-Positive Rate**: **0.0%** (zero unwarranted slop violations flagged across idiomatic human code).
* **Verification Test**: Run `node --test test/false-positive-sweep.test.mjs` to execute the automated sweep.

---

## Model Context Protocol (MCP) Integration

Autonomous agents interact with Sloppy over stdio using **5 primary high-leverage tools**. Granular legacy tools have been eliminated to minimize LLM context window token consumption and prevent tool-selection errors on every turn:

### Primary Agent Tools (5 Verbs)

* `sloppy_check`: Primary gate entry point returning score, grade, violations, SARIF annotations, and recommended actions.
* `sloppy_plan`: Generates structured repair plans with patch diffs, confidence ratings, and risk levels.
* `sloppy_fix`: Transforms sloppy code into clean craft with verified unified diffs and syntax validation.
* `sloppy_catalog`: Unified registry querying components, patterns, master archetypes, and design looks.
* `sloppy_rules`: Authoritative anti-slop rules, guidelines, craft rubric definitions, and surface budgets.

### Client Configuration

#### Cursor (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "sloppy": {
      "command": "sloppy",
      "args": ["mcp"]
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`) / Claude Code
```json
{
  "mcpServers": {
    "sloppy": {
      "command": "sloppy",
      "args": ["mcp"]
    }
  }
}
```

#### VS Code (`.vscode/mcp.json`)
```json
{
  "servers": {
    "sloppy": {
      "type": "stdio",
      "command": "sloppy",
      "args": ["mcp"]
    }
  }
}
```

---

## CI/CD Quality Gate Integration

### Plug-and-Play GitHub Action (`action.yml`)

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

### Manual Workflow Configuration

```yaml
name: Anti-Slop Quality Gate

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npx sloppy check ./src --fail-on high --max-score 0
      - run: npx sloppy check ./src --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif
      - run: npx sloppy rubric ./src/components/Hero.tsx --strict
```

### Configuration (`sloppy.config.json`)

To configure rule tolerances, allow legitimate corporate brand palettes, or customize word budgets, add `sloppy.config.json` or `.sloppyrc.json`:

```json
{
  "strict": false,
  "failOn": "high",
  "brand": {
    "name": "Acme",
    "allowColors": ["purple-600", "violet-500", "#7c3aed"],
    "allowGradients": false
  },
  "rules": {
    "VIS-02": "error",
    "PURPLE_GRADIENT_SLOP": "error",
    "CENTER_ALIGNED_EVERYTHING": "off",
    "BOXED_CARD_SYNDROME": "error",
    "UNANCHORED_FLOATING_WINDOW": "error",
    "AX-01": "error"
  },
  "wordBudget": {
    "hero": 40,
    "application": 200
  }
}
```

### Inline Exemptions & Invariant Rationale

Sloppy supports rule suppression using either catalog codes or descriptive slugs:

* **Line-level exemption (Non-Strict Mode)**:
  ```tsx
  // sloppy-ignore-next-line VIS-02
  <div className="bg-gradient-to-r from-purple-500 to-indigo-500" />

  // sloppy-ignore-next-line PURPLE_GRADIENT_SLOP
  <div className="bg-gradient-to-r from-purple-500 to-indigo-500" />
  ```
* **Strict Mode Invariant Requirement (`--strict`)**:
  In `--strict` mode or CI gates, an explicit written invariant explanation (`-- <reason>`) of at least 5 characters is mandatory. Pragmas lacking rationale are rejected to prevent AI agents from lazily silencing errors:
  ```tsx
  // sloppy-ignore-next-line COD-02 -- Checked invariant: verified with Zod schema upstream
  const user = rawData as unknown as User;

  // sloppy-ignore-next-line VIS-01 -- Verified brand hero exception approved in PR #42
  <h1 className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
  ```
* **File-level exemption**:
  ```tsx
  /* sloppy-allow-file: VIS-02, CENTER_ALIGNED_EVERYTHING */
  ```

---

## AST & Lexical Scope: Analysis Boundaries

To earn senior engineer and team trust in automated CI/CD pipelines, Sloppy clearly demarcates what its scanner evaluates versus what is intentionally delegated to compilers and runtime environments:

### What Sloppy Resolves (Deterministic AST & Lexical Scope)
* **Same-File Lexical Scope**: Resolves local variable assignments, function declarations, imports (`import { Sparkles as MagicIcon }`), and property bindings.
* **JSX/HTML Structural Hierarchy**: Tracks parent-child tag trees, ancestor chains, element nesting depth, and accessible roles (`role="button"`, `tabIndex`).
* **Wiring Graph Preservation**: Tracks active href targets, form inputs, event handlers (`onClick`, `onSubmit`), and text headings to ensure zero regressions during auto-fixes.
* **Masked Code Scanning**: Masks string literals, JSX attribute strings, and comments with whitespace to ensure zero false positives on code rules (e.g. `Record<string, any>`, `as unknown as`, `!.`).
* **Low-Evidence TypeScript Constructs**: Flags unsafe chained assertions (`as unknown as T`), ungrounded non-null assertions (`foo!.bar`), dynamic contract returns (`(): Promise<any>`), and broad dictionary types (`Record<string, any>`).

### What Sloppy Intentionally Skips (Analysis Boundaries)
* **Cross-File Type Inference**: Resolving types across external files or npm modules belongs to `tsc` / `oxlint`. Sloppy focuses on local syntax, structural ASTs, and visual UI rules.
* **Dynamic Code Execution (`eval` / Runtime State)**: Sloppy never executes target source code during AST passes; all checks are static, idempotent, and sandboxed.
* **Backend Network & Sockets**: Static verification runs fully offline without making outbound network requests or binding live server sockets.

---

## Slop Studio: Interactive Web Playground

Sloppy includes an interactive comparison studio (`packages/playground`) for testing components, exploring the 74 gold patterns, and inspecting the 10 master archetypes live in the browser.

* **Local development**: Run `sloppy dev` or `npm run dev` to launch on port 1355.
* **Public deployment**: Deploy `packages/playground` with zero configuration to Vercel or Cloudflare Pages using the included `vercel.json`:
  ```bash
  npm run build
  npx vercel --prod
  ```

---

## Repository Structure & Architecture

```
sloppy/
├── packages/
│   ├── core/          # Primary wedge: AST scanner, rules, scoring, rubric, repair planner, and config loader
│   ├── cli/           # Developer CLI, setup orchestrator, and CI quality gate
│   ├── mcp/           # Lean 5-tool Model Context Protocol stdio server for agents
│   ├── kit/           # Portable React craft primitives (Stage, Window, Follow, Fly, Expand)
│   ├── verify/        # Static and headless Playwright verification engine
│   ├── playground/    # Vite + React comparison and verification studio
│   └── components/    # Internal research corpus across 7 UI ecosystems
├── patterns/          # 74 curated gold pattern directories
├── benchmarks/        # Real-world raw AI specimens (v0, Bolt, Lovable)
├── skills/sloppy/     # Universal agent skill definition (SKILL.md + references)
└── test/              # Unit, rubric, config, benchmark, and MCP contract tests
```

---

## Engineering Standards

* **Strict Zero Emojis Policy**: Zero emojis across code, UI, alert banners, documentation, commit messages, and assistant output.
* **Conventional Commits**: Every commit strictly follows `<type>(<scope>): <summary>` format, verified by commit-msg hooks.
* **Zero New Runtime Dependencies**: The scanner, AST transformer, and repair planner are hand-written TypeScript.

---

## License

MIT
