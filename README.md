# Sloppy: The AI Slop UI Fixer

A deterministic anti-slop design engine, React kit, pattern library, Model Context Protocol (MCP) server, and universal agent skill. It exists to stop AI coding agents from shipping low-taste, generic interface slop.

Sloppy is designed for a closed agent loop: **detect, plan, fix, verify, re-check**. Every command that a quality gate depends on returns a machine-readable verdict and a correct process exit code.

---

## Why Sloppy Exists

AI coding agents reliably converge on the same interface anti-patterns:

- **Purple and indigo gradients** applied to cards and buttons without intent.
- **Sparkle icons** used as a stand-in for capability.
- **Boxed card monotony**: every datum wrapped in an identical rounded, bordered container.
- **Ungrounded floating windows** shrunk to a thumbnail with equal air on all four sides.
- **Word overload**: fabricated metrics and robotic copy in every row instead of a disciplined word budget.
- **Unearned motion**: looping bounce, pulse, and ping animations with no cause.

Sloppy detects these patterns across multi-line JSX, inline styles, and Tailwind arbitrary values, then applies a conservative, syntax-validated repair.

---

## The Five Anti-Slop Commandments

1. **Restraint over detail.** Count real strings: usually three to seven. Use `<Bar />` for filler. Fabricated data reads as synthetic.
2. **Grounded framing over floating boxes.** A window or phone fills at least two thirds of the stage and bleeds off at least one edge. Crop to the panel where the action happens.
3. **Surface depth over flat cards.** Step from ground to surface 1, 2, and 3. Reserve the accent color for one intentional signal.
4. **Caused motion over random animation.** A cursor moves with purpose, presses with feedback, and triggers a transition. The payoff holds for two to three seconds.
5. **Authentic craft over sparkle slop.** No purple gradients, no magic-wand icons. Real chrome, real typography hierarchy, quiet confidence.

---

## Quick Start

```bash
# Run without installing
npx sloppy check ./src/components

# Install the CLI
npm install -g sloppy
sloppy check ./src
```

### The agent loop

```bash
# 1. Gate: exit 0 clean, 1 violations, 2 usage error
sloppy check ./src --json --fail-on high --max-score 20

# Declare the rendered surface when the default word budget is too tight
sloppy check ./src/screens/Dashboard.tsx --type application --json

# 2. Plan: per-patch confidence, risk, exact snippets, and a projected score
sloppy plan ./src/components/Hero.tsx --json

# 3. Review the exact diff before touching the file
sloppy fix ./src/components/Hero.tsx --diff

# 4. Apply only validated output
sloppy fix ./src/components/Hero.tsx --write --json

# 5. Re-check. Never claim clean without a fresh result.
sloppy check ./src/components/Hero.tsx --json
```

### Piping source through the fixer

```bash
echo '<div className="bg-gradient-to-r from-purple-500 to-indigo-600" />' \
  | sloppy fix --stdin --json
```

---

## Commands

| Command | Purpose |
|---|---|
| `sloppy check [paths]` | Quality gate with correct exit codes and `nextActions` for agents. Accepts `--type` to set the word budget. |
| `sloppy audit <path>` | Detect anti-patterns with line, column, snippet, and remediation. |
| `sloppy rubric <path>` | Score against the 10-dimension Craft Rubric (Grade A+ to F). |
| `sloppy plan <path>` | Structured repair plan with confidence, risk, and projected score. |
| `sloppy fix <path>` | Syntax-validated autofix. Supports `--diff`, `--check`, `--stdin`, `--write`. |
| `sloppy verify <target>` | Honest verification. Fails closed when a browser is unavailable. |
| `sloppy install-mcp --client <id>` | Write MCP configuration for Cursor, VS Code, Claude, or Codex. |
| `sloppy create <archetype>` | Scaffold a multi-library master archetype. |
| `sloppy list [library]` | List curated components and patterns. |
| `sloppy init` | Install the React kit into `./src/kit/`. |
| `sloppy looks` | Print design tokens for each curated look. |
| `sloppy dev` | Launch the visual playground on `http://127.0.0.1:1355`. |
| `sloppy version` | Report CLI and core versions. |

### Exit code contract

| Code | Meaning |
|---|---|
| `0` | Clean, or the configured gate passed. |
| `1` | Violations at or above the configured threshold. |
| `2` | Usage error, missing path, I/O failure, or verification unavailable. |

In `--json` mode, stdout contains exactly one JSON document. Diagnostics go to stderr. This is deliberate: agents should be able to parse the result without stripping banners.

### Ignore pragmas

```tsx
// sloppy-ignore-next-line
const brandGradient = 'bg-gradient-to-r from-purple-500 to-indigo-600';
```

Also supported: `// sloppy-ignore-file`, `/* sloppy-ignore-next */`, and a rule-scoped exemption that keeps every other check active:

```css
/* sloppy-allow-file: PURPLE_GRADIENT_SLOP. Gradient artwork is the specimen, not a marketing surface. */
```

`estimatedWordCount` counts only rendered JSX text and single string literals. Type signatures, comments, and callback bodies are never counted as visible copy.

---

## MCP Server Integration

Sloppy ships a Model Context Protocol server over stdio. The server teaches the closed loop in its instructions, exposes `sloppy_check` and `sloppy_fix` for agents, and never writes to disk unless a tool caller passes `write: true`.

```bash
sloppy install-mcp --client cursor
sloppy install-mcp --client vscode
sloppy install-mcp --client claude
sloppy install-mcp --client codex
```

Or configure manually:

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

### Agent-facing tools

| Tool | Description |
|---|---|
| `sloppy_check` | Returns `{ ok, score, grade, violations, nextActions }` for an audit-and-fix loop. |
| `sloppy_fix` | Returns transformed source, unified diff, syntax validity, and post-fix audit. Dry-run by default. |
| `sloppy_audit_code` | Full audit with severity, location, and remediation. |
| `sloppy_evaluate_rubric` | Ten-dimension craft certification with SVG badge. |
| `sloppy_plan_repairs` | Structured patch plan with confidence and risk. |
| `sloppy_refactor_slop` | Guided refactoring recipe for a specific slop score and target look. |
| `sloppy_search_components` | Search the curated component catalog by query, library, or category. |
| `sloppy_get_component` | Fetch component source, dependencies, and anti-slop guidance. |
| `sloppy_search_patterns` | Search curated product patterns by query, category, or theme. |
| `sloppy_get_pattern` | Fetch pattern source, CSS, and motion choreography. |
| `sloppy_get_kit_primitives` | Fetch drop-in React primitives (`Stage`, `Window`, `Phone`, `Bento`, `Cursor`, `Act`, `Bar`). |
| `sloppy_get_look` | Fetch design tokens and surface steps for a curated look. |
| `sloppy_get_rules` | Query the craft, framing, motion, bento, and word-budget rulebooks. |
| `sloppy_get_archetype` | Fetch a synthesized multi-library master archetype. |
| `sloppy_list_libraries` | List integrated libraries with their anti-slop role. |
| `sloppy_list_catalog` | Report accurate catalog statistics computed at runtime. |

---

## Repository Contents

```
slopy/
├── packages/
│   ├── core/          # Anti-slop engine: scanner, rules, scoring, rubric, repair planner
│   ├── kit/           # Portable React anti-slop primitives and motion API
│   ├── mcp/           # Model Context Protocol server (stdio)
│   ├── cli/           # Developer CLI and agent gate
│   ├── verify/        # Honest static and browser verification engine
│   ├── components/    # 757 component source files across 7 libraries
│   └── playground/    # Vite + React catalog and comparison studio
├── patterns/          # 74 curated pattern directories
├── docs/              # Agent coordination and Refero integration contract
├── skills/sloppy/     # Universal agent skill definition
└── test/              # Audit, fix, CLI, MCP, and verification contract tests
```

Curated catalog today: 31 registered component entries, 20 catalogued patterns, and 10 synthesized master archetypes. Statistics are reported from runtime data rather than hardcoded marketing numbers.

---

## Design Looks

Hand-authored looks: `minimal`, `linear`, `radix`, `raycast`, `blueprint`, `glass`, `dark-hero`.

Refero-sourced production looks: `nuxt`, `linearity`, `grafana`, `modern-treasury`, `milanote`, `bunny`, `heptabase`, `glyphs`.

Every look defines a background, three surface steps, border tokens, typography, and one accent reserved for signals. Refero looks carry the source site, URL, and style id so an agent can audit provenance instead of guessing. Run `sloppy looks` to print the full token table, or `node scripts/refero-looks.mjs <brand>` to derive tokens from the local Refero cache.

---

## Engineering Standards

- **Ponytail policy**: the best code is the code you never wrote. YAGNI, reuse, standard library, native platform, existing dependencies, minimal effective form, boring over clever.
- **Zero-tolerance anti-slop gate**: UI output must reach `0/100` under `sloppy check` and Grade A+ (minimum 95/100) under `sloppy rubric`.
- **Zero new runtime dependencies** for detection and repair. The scanner, syntax validator, and diff engine are hand-written TypeScript.
- **No fabricated results**: `sloppy verify` fails closed and never prints a PASS it did not compute.
- **Conventional Commits**, enforced by pre-commit hooks and CI.
- **Tests before claims**: `npm test` runs the archetype rubric gate and the audit, fix, CLI, MCP, and verification contract suites.

---

## License

MIT.
