# Sloppy: The AI Slop UI Fixer & Unified Design Engine

A deterministic anti-slop design engine, portable React kit, Model Context Protocol (MCP) server, CLI, and universal agent skill. Sloppy eliminates low-taste AI UI slop (unwarranted purple gradients, floating miniature windows, sparkle icons, unearned bouncy animations, and fake text overload) across all AI coding assistants and modern web applications.

---

## Quick Installation: Choose Your Setup

Sloppy accommodates both all-in-one universal setups and standalone modular installs:

| Setup Goal | What Gets Installed | 1-Step Command |
|---|---|---|
| **1. Everything (All-in-One)** | CLI + MCP Server (all editors) + Agent Skill | `npx -y sloppy setup --write` |
| **2. CLI Only** | Terminal command & CI/CD quality gate | `npm install -g sloppy` (or zero-install: `npx sloppy check`) |
| **3. MCP Server Only** | 16-tool stdio server for Cursor, Claude, Codex, VS Code | `npx -y sloppy install-mcp --client <client>` |
| **4. Agent Skill Only** | Universal skill for 70+ agents (Antigravity, Cursor, etc.) | `npx skills add Pavanspoojary/sloppy --skill sloppy -g -a '*' -y` |
| **5. React Kit Only** | Portable anti-slop primitives into `./src/kit/` | `npx -y sloppy init` |

---

### Path 1: All-in-One Universal Setup (Recommended)

One single command provisions the CLI, registers the MCP server across all detected clients, and links the Agent Skill globally:

```bash
# Run directly with npx (zero pre-install required)
npx -y sloppy setup --write

# Or install globally and configure all tools at once
npm install -g sloppy
sloppy setup --write
```

What this single command configures:
1. **CLI**: Installs `sloppy` globally for terminal audits and CI/CD quality gates.
2. **MCP Server**: Automatically registers `sloppy mcp` (16 tools) inside Cursor (`.cursor/mcp.json`), Claude (`.mcp.json`), Codex (`~/.codex/config.toml`), and VS Code (`.vscode/mcp.json`).
3. **Agent Skill**: Globally links the `sloppy` skill into `~/.agents/skills/sloppy`, `~/.gemini/config/skills/sloppy` (Antigravity), and `~/.claude/skills/sloppy`.

---

### Path 2: CLI Only (For Developers & CI/CD Pipelines)

If you only want the terminal linter, syntax auto-fixer, and CI gate without agent integration:

```bash
# Install globally
npm install -g sloppy

# Or run on-demand with zero local installation
npx sloppy check ./src
npx sloppy fix ./src/components/Hero.tsx --diff
npx sloppy rubric ./src/components/Hero.tsx --strict
```

---

### Path 3: MCP Server Only (For Cursor, Claude, Codex, VS Code)

If you only need the Model Context Protocol server for your AI code editor:

```bash
# Automatic 1-command registration:
npx -y sloppy install-mcp --client cursor   # Configures .cursor/mcp.json
npx -y sloppy install-mcp --client vscode   # Configures .vscode/mcp.json
npx -y sloppy install-mcp --client claude   # Configures .mcp.json
npx -y sloppy install-mcp --client codex    # Appends to ~/.codex/config.toml
```

Manual configuration snippet:
```json
{
  "mcpServers": {
    "sloppy": {
      "command": "npx",
      "args": ["-y", "sloppy", "mcp"]
    }
  }
}
```

---

### Path 4: Agent Skill Only (For 70+ AI Coding Agents)

If you only want the universal anti-slop skill, prompt instructions, 7 reference manuals, and 10 master archetypes loaded into Antigravity, Claude Code, Cursor, Codex, or Cline:

```bash
npx skills add Pavanspoojary/sloppy --skill sloppy -g -a '*' -y
```

---

### Path 5: React UI Kit Only (For Frontend Projects)

If you only want the ready-to-use, zero-slop UI primitives (`Stage`, `Window`, `Act`, `Ease`, `Bar`) in your React repository:

```bash
# Scaffolds portable primitives directly into ./src/kit/
npx -y sloppy init
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

AI coding agents routinely converge on predictable visual anti-patterns:
* **Purple/Indigo Gradients**: Applied arbitrarily to cards and headers as a substitute for visual hierarchy.
* **Sparkle & Magic Wand Icons**: Slapped onto standard buttons to simulate AI sophistication.
* **Boxed Card Monotony**: Every element wrapped in uniform `rounded-xl border p-6` cards with no surface grounding.
* **Ungrounded Floating Windows**: Shrinking entire applications into centered cards with air on four sides.
* **Word Overload**: Generating walls of fake metrics and filler text instead of disciplined layout geometry.
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
| `check` | `sloppy check <paths...>` | Quality gate with machine-readable verdicts, exit codes, and next actions. |
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

When connected via MCP, coding agents have access to 16 specialized tools:

* `sloppy_check`: Primary gate entry point returning score, grade, violations, and nextActions.
* `sloppy_fix`: Transforms sloppy code into clean craft with unified diffs and syntax validation.
* `sloppy_audit_code`: Deep static analysis reporting violations with line and column coordinates.
* `sloppy_evaluate_rubric`: Evaluates code against the 10-point Craft Rubric with an SVG certification badge.
* `sloppy_plan_repairs`: Generates structured repair plans with confidence and risk analysis.
* `sloppy_get_archetype`: Retrieves any of the 10 multi-library master archetypes.
* `sloppy_search_components`: Queries 757 components across 7 libraries (shadcn, magicui, motion-primitives, etc.).
* `sloppy_get_component`: Retrieves source code, dependencies, and craft instructions for any component.
* `sloppy_search_patterns`: Searches 74 gold product patterns and real-world studies.
* `sloppy_get_pattern`: Fetches runnable pattern source, scoped CSS, and motion choreography scripts.
* `sloppy_get_kit_primitives`: Provides ready-to-paste clean React primitives (`Stage`, `Window`, `Bar`, `Act`, `Ease`).
* `sloppy_get_look`: Provides design tokens, surface steps, and CSS variables for curated and Refero looks.
* `sloppy_get_rules`: Returns authoritative reference rulebooks (`craft`, `framing`, `motion`, `bento`, `word_budget`).
* `sloppy_refactor_slop`: Generates guided refactoring proposals for legacy codebases.
* `sloppy_list_libraries`: Lists integrated ecosystems and their specific anti-slop guidelines.
* `sloppy_list_catalog`: Returns live catalog metrics and registered pattern statistics.

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
      - run: npx sloppy rubric ./src/components/Hero.tsx --strict
```

---

## Repository Structure

```
slopy/
├── packages/
│   ├── core/          # Anti-slop engine: scanner, rules, scoring, rubric, repair planner
│   ├── kit/           # Portable React anti-slop primitives and motion API
│   ├── mcp/           # Model Context Protocol stdio server
│   ├── cli/           # Developer CLI, setup orchestrator, and quality gate
│   ├── verify/        # Static and browser verification engine
│   ├── components/    # 757 component source files across 7 UI libraries
│   └── playground/    # Vite + React comparison and verification studio
├── patterns/          # 74 curated gold pattern directories
├── skills/sloppy/     # Universal agent skill definition (SKILL.md + references)
└── test/              # 42 unit, rubric, CLI, MCP, and verification contract tests
```

---

## Engineering Standards

* **Ponytail Policy**: The best code is the code you never wrote. Prioritize YAGNI, existing primitives, standard library APIs, native platform CSS, minimal effective form, and boring over clever.
* **Strict Zero Emojis Policy**: Zero emojis across code, UI, alert banners, documentation, and commit messages.
* **Conventional Commits**: Every commit strictly follows `<type>(<scope>): <summary>` format, verified by commit-msg hooks.
* **Zero New Runtime Dependencies**: The scanner, AST transformer, and repair planner are hand-written TypeScript.

---

## License

MIT
