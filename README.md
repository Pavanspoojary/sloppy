# Sloppy: The AI Slop UI Fixer & Unified Design Engine

A deterministic anti-slop design engine, portable React kit, Model Context Protocol (MCP) server, CLI, and universal agent skill. Sloppy eliminates low-taste AI UI slop (unwarranted purple gradients, floating miniature windows, sparkle icons, unearned bouncy animations, and fake text overload) across all AI coding assistants and modern web applications.

---

## Direct Installation (Standalone One-Line Installer)

Install and configure the complete Sloppy ecosystem directly without npm registry accounts, global package manager pollution, or publishing friction:

```bash
curl -fsSL https://raw.githubusercontent.com/Pavanspoojary/sloppy/main/scripts/install.sh | bash
```

### What this standalone installer does:
1. Clones/updates the repository into `~/.sloppy`.
2. Compiles `@sloppy/core`, `@sloppy/mcp`, and the CLI locally with full workspace integrity.
3. Installs a standalone executable binary directly into `~/.local/bin/sloppy` (and `/usr/local/bin/sloppy`).
4. Automatically runs `sloppy setup --write`, registering MCP tools in Cursor, VS Code, Claude, and Codex, and linking Agent Skills across Antigravity and Claude Code.

---

### Manual Clone & Contributor Setup

If you prefer to clone and set up manually:

```bash
git clone https://github.com/Pavanspoojary/sloppy.git ~/.sloppy
cd ~/.sloppy
./scripts/install.sh
```

---

## The Complete Anti-Slop Stack

| Layer | Component | Description |
|---|---|---|
| **CLI & Gate** | `sloppy` | Deterministic linter, syntax-validated auto-fixer, repair planner, and CI quality gate. |
| **Agent Protocol** | `@sloppy/mcp` | 16-tool stdio server enabling autonomous agents to audit, plan, and repair code in a closed loop. |
| **Agent Skill** | `skills/sloppy` | Universal skill with 7 reference manuals (`craft`, `framing`, `motion`, `bento`, `word_budget`, `looks`, `rehearse`). |
| **UI Primitives** | `@sloppy/kit` | Portable React & plain CSS components enforcing grounded framing and caused motion. |
| **Master Archetypes** | 10 Archetypes | Production-grade blueprints combining 7 UI libraries into cohesive, Grade A+ interfaces. |
| **Design Looks** | 15 Token Sets | Curated looks (`minimal`, `linear`, `blueprint`, `dark-hero`, `raycast`) and Refero production looks (`nuxt`, `grafana`, `modern-treasury`). |

---

## Why Sloppy Exists: Eradicating AI UI Slop

AI coding agents routinely converge on predictable visual, copy, and structural anti-patterns (documented in detail in [docs/AI_SLOP_CATALOG.md](docs/AI_SLOP_CATALOG.md)):
* **Hero Gradient Text**: `bg-clip-text text-transparent` with purple/indigo/cyan gradients on headlines.
* **Purple/Indigo Gradients**: Applied arbitrarily to cards and headers as a substitute for visual hierarchy.
* **Sparkle & Magic Wand Icons**: Slapped onto standard buttons to simulate AI sophistication.
* **Boxed Card Monotony**: Every element wrapped in uniform `rounded-xl border p-6` cards with no surface grounding.
* **Ungrounded Floating Windows**: Shrinking entire applications into centered cards with air on four sides.
* **Negative Parallelism & Copy Clichés**: Contrast reframes ("Not just a tool — it's a platform") and generic tropes ("Unlock the power of", "Supercharge your workflow").
* **Fabricated Social Proof**: Unverified metrics ("10,000+ users", "99.99% uptime") and synthetic testimonial quotes.
* **Inaccessible Fake Controls**: Clickable `div` and `span` elements lacking keyboard support and ARIA roles.
* **Unearned Motion**: Looping pulses, spins, and sudden content swaps without physical cause and effect.

### The Five Anti-Slop Commandments
1. **Restraint over detail**: Enforce strict word budgets (3 to 7 real strings). Use `<Bar />` for structural filler.
2. **Grounded framing over floating boxes**: Windows cover >= 66% of the stage and bleed off at least one edge.
3. **Surface depth over flat borders**: Step cleanly from ground to surfaces 1, 2, and 3 with monotonic contrast.
4. **Caused motion over random bounce**: Movement requires an explicit trigger, critically damped springs, and held payoffs.
5. **Authentic craft over sparkle slop**: Real platform chrome, disciplined typography, and monochromatic restraint.

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

# 6. Re-check: Never declare complete without a fresh clean audit
sloppy check ./src/components/Hero.tsx --json
```

### Piping via Stdin
```bash
echo '<div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl border p-6" />' \
  | sloppy fix --stdin --json
```

---

## CLI Command Reference

| Command | Usage | Description |
|---|---|---|
| `setup` | `sloppy setup [--write]` | All-in-one setup configuring MCP clients and linking Agent Skills. |
| `check` | `sloppy check <paths...> [--format sarif\|json] [--watch]` | Quality gate with machine-readable verdicts, SARIF export, live watch mode, exit codes, and next actions. |
| `audit` | `sloppy audit <file\|dir>` | Detailed anti-pattern scan with line numbers, snippets, and remediations. |
| `rubric` | `sloppy rubric <file> [--strict]` | 10-dimension craft rubric score (0-100) and certification grade. |
| `plan` | `sloppy plan <file>` | Structured repair plan with confidence levels, risk ratings, and patch diffs. |
| `fix` | `sloppy fix <file> [--write]` | Syntax-validated auto-repair replacing slop with clean craft. |
| `verify` | `sloppy verify [target]` | Honest verification engine failing closed if a browser is unavailable. |
| `install-mcp` | `sloppy install-mcp --client <id>` | Write MCP configuration for Cursor, VS Code, Claude, or Codex. |
| `archetypes` | `sloppy archetypes` | List the 10 synthesized multi-library master archetypes. |
| `create` | `sloppy create <archetype>` | Scaffold a master archetype into your component directory. |
| `looks` | `sloppy looks` | Display design tokens and surface steps for curated and Refero looks. |
| `libs` | `sloppy libs` | List the 7 integrated UI libraries and their design roles. |
| `list` | `sloppy list [library]` | Search and list curated components across the ecosystem. |
| `init` | `sloppy init` | Scaffold portable anti-slop React kit primitives into `./src/kit/`. |
| `dev` | `sloppy dev` | Launch the local visual playground and comparison studio on port 1355. |
| `mcp` | `sloppy mcp` | Launch the stdio Model Context Protocol server. |
| `version` | `sloppy version [--json]` | Output CLI and core engine versions. |

### Exit Code Contract
* `0`: Clean, or the configured gate passed.
* `1`: Slop violations detected at or above the failure threshold.
* `2`: Usage error, missing target, I/O failure, or verification unavailable.

---

## The 10-Point Craft Rubric

Every component is scored across 10 craft dimensions (0 to 10 points each, 100 points total):

1. **Surface Elevation & Grounding (0-10)**: Grounded surface steps (0, 1, 2, 3); zero floating unanchored cards.
2. **Word Budget & Text Restraint (0-10)**: 3 to 7 real strings; `<Bar />` placeholder geometry for ambient copy.
3. **Motion Intentionality & Easing (0-10)**: Caused transitions with critically damped springs; zero unearned bounces.
4. **Visual Focal Hierarchy (0-10)**: Unmistakable dominant focal node; clear primary/secondary visual weight.
5. **Icon Authenticity (0-10)**: Authentic domain icons; zero decorative sparkles or magic wands on generic actions.
6. **Monochromatic Restraint (0-10)**: Neutral ground palette; single intentional accent color reserved for signals.
7. **Framing & Bleeding Rules (0-10)**: Fills >= 66% of stage; bleeds secondary panels off stage frame.
8. **Density & Spacing Rhythm (0-10)**: Tight information density; disciplined typographic scale and padding.
9. **Real-World Chrome Integrity (0-10)**: Realistic window headers, monospace route tags, and platform details.
10. **Semantic Accessibility & Contrast (0-10)**: High contrast ratios, accessible typographic foundations, and ARIA tags.

**Grade Scale**: A+ (95-100), A (90-94), B (80-89), C (70-79), D (50-69), F (<50).

---

## Model Context Protocol (MCP) Tools

When connected via MCP, coding agents interact through 5 high-leverage primary verbs (with 11 granular aliases for backward compatibility):

### Primary Agent Verbs
* `sloppy_check`: Primary gate entry point returning score, grade, violations, SARIF data, and next actions.
* `sloppy_plan`: Generates structured repair plans with patch diffs, confidence ratings, and risk levels.
* `sloppy_fix`: Transforms sloppy code into clean craft with verified unified diffs and syntax validation.
* `sloppy_catalog`: Unified registry querying components, patterns, master archetypes, and design looks.
* `sloppy_rules`: Authoritative anti-slop rules, guidelines, craft rubric definitions, and surface budgets.

<details>
<summary>Granular Legacy MCP Handlers (11 Tools)</summary>

* `sloppy_audit_code`: Deep static analysis reporting violations with line and column coordinates.
* `sloppy_evaluate_rubric`: Evaluates code against the 10-point Craft Rubric with an SVG certification badge.
* `sloppy_plan_repairs`: Legacy alias for `sloppy_plan`.
* `sloppy_get_archetype`: Retrieves any of the 10 multi-library master archetypes.
* `sloppy_search_components`: Queries 757 components across 7 libraries (shadcn, magicui, motion-primitives, etc.).
* `sloppy_get_component`: Retrieves source code, dependencies, and craft instructions for any component.
* `sloppy_search_patterns`: Searches 74 gold product patterns and real-world studies.
* `sloppy_get_pattern`: Fetches runnable pattern source, scoped CSS, and motion choreography scripts.
* `sloppy_get_kit_primitives`: Provides ready-to-paste clean React primitives (`Stage`, `Window`, `Bar`, `Act`, `Ease`).
* `sloppy_get_look`: Provides design tokens, surface steps, and CSS variables for curated and Refero looks.
* `sloppy_list_libraries`: Lists integrated ecosystems and their specific anti-slop guidelines.
* `sloppy_list_catalog`: Returns live catalog metrics and registered pattern statistics.

</details>

---

## CI/CD Quality Gate Integration

Enforce zero-tolerance anti-slop standards in your GitHub Actions workflows:

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
      - run: npx sloppy check ./src --fail-on high --max-score 0
      - run: npx sloppy check ./src --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif
      - run: npx sloppy rubric ./src/components/Hero.tsx --strict
```

### Enterprise Configuration (`sloppy.config.json`)

To prevent false positives on legitimate brand palettes (e.g. corporate violet accents) and customize rule tolerances per repository, add `sloppy.config.json` or `.sloppyrc.json`:

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
    "PURPLE_GRADIENT_SLOP": "error",
    "CENTER_ALIGNED_EVERYTHING": "off",
    "BOXED_CARD_SYNDROME": "error",
    "UNANCHORED_FLOATING_WINDOW": "error"
  },
  "wordBudget": {
    "hero": 40,
    "application": 200
  }
}
```

Inline exemptions are also supported:
* Line-level: `// sloppy-ignore-next-line PURPLE_GRADIENT_SLOP`
* File-level: `/* sloppy-allow-file: PURPLE_GRADIENT_SLOP, CENTER_ALIGNED_EVERYTHING */`

---

## Real-World AI Benchmarks (v0, Bolt, Lovable)

Sloppy includes automated before/after benchmark fixtures tested directly against raw outputs from generative AI engines (`benchmarks/fixtures`):

* **v0 Analytics Dashboard**: Raw generation carries severe purple gradients, unanchored floating windows, 6 sparkle icons, and low-contrast text (Initial Slop Score: **88/100, Grade F**). Sloppy automatically repairs surfaces into grounded stages with 4.8:1 contrast (Transformed Craft Score: **0/100, Grade A+**).
* **Bolt SaaS Pricing**: Raw generation exhibits all-centered alignment and 4 identical boxed cards (Initial Slop Score: **74/100, Grade D**). Sloppy transforms the grid into anchored hierarchy with intentional focus.

Run benchmarks:
```bash
node --test test/benchmarks.test.mjs
```

---

## Repository Structure & Architecture

```
sloppy/
├── packages/
│   ├── core/          # The Primary Wedge: AST scanner, rules, scoring, rubric, repair planner, and config loader
│   ├── cli/           # Developer CLI, setup orchestrator, and CI quality gate
│   ├── mcp/           # Lean 5-verb Model Context Protocol stdio server for agents
│   ├── kit/           # Reference Implementation: Portable React craft primitives (Stage, Window, Follow, Fly, Expand)
│   ├── verify/        # Static and headless Playwright jump verification engine
│   ├── playground/    # Vite + React comparison and verification studio
│   └── components/    # Internal Research Corpus: 7 analyzed UI ecosystems (read-only reference)
├── patterns/          # 74 curated gold pattern directories
├── benchmarks/        # Real-world raw AI specimens (v0, Bolt, Lovable)
├── skills/sloppy/     # Universal agent skill definition (SKILL.md + references)
└── test/              # 55 unit, rubric, config, benchmark, and MCP contract tests
```

---

## Engineering Standards

* **Strict Zero Emojis Policy**: Zero emojis across code, UI, alert banners, documentation, and commit messages.
* **Conventional Commits**: Every commit strictly follows `<type>(<scope>): <summary>` format, verified by commit-msg hooks.
* **Zero New Runtime Dependencies**: The scanner, AST transformer, and repair planner are hand-written TypeScript.

---

## License

MIT
