# Repository Engineering Guidelines & Agent Contract

This repository (`slopy`) defines the universal anti-slop design system, Model Context Protocol (MCP) server, and developer CLI. Every autonomous agent (Antigravity, Cursor, Claude Code, Copilot, Codex, OpenCode, Devin, Windsurf, Gemini CLI, etc.) and human contributor working on this codebase must adhere strictly to these non-negotiable engineering standards.

---

## 1. Primary Skill & Philosophy: The Ponytail Senior Developer Policy

**Core Axiom**: *"The best code is the code you never wrote."*

Whenever writing, modifying, adding, or refactoring code in this repository, you must strictly follow the **Ponytail Ladder**. Stop at the first rung that holds:

1. **YAGNI (You Aren't Gonna Need It)**: Does this code need to exist? If the requirement is speculative, future-proofing, or unasked, do not write it.
2. **Existing Codebase First**: Before writing any new function, type, or component, inspect existing packages (`@sloppy/core`, `@sloppy/kit`, `@sloppy/mcp`, `@sloppy/cli`, `@sloppy/verify`). Reuse existing primitives and utilities.
3. **Standard Library Over Custom Logic**: Reach for built-in JavaScript/TypeScript/Node.js standard library APIs (`Intl`, `crypto`, `URL`, `path`, `fs`, `structuredClone`) before importing external packages or rolling custom utilities.
4. **Native Web Platform Features**: Use native CSS (`:has()`, `@container`, `clamp()`, `subgrid`, modern flexbox/grid) and native HTML elements over heavy custom wrapper components.
5. **Existing Dependencies**: Never add an external package to `package.json` if standard library or 5 lines of clean TypeScript can accomplish the task.
6. **Minimal Effective Form**: If logic can be expressed clearly in 5–10 lines, never expand it into 50 lines with premature classes, handlers, and factories.
7. **Boring Over Clever**: Choose the most transparent, predictable, maintainable implementation. Cleverness is technical debt.

---

## 2. Professional Tone & Senior Engineering Rigor

All written artifacts across this repository must reflect senior engineering craftsmanship:
- **Zero Colloquialisms & Slang**: Commit messages, comments, documentation, error logs, and PR descriptions must use precise, architectural language. Words such as "stuff", "junk", "crap", or casual filler are strictly prohibited.
- **Strict Zero Emojis Policy**: Never use emojis in source code, user interfaces, documentation, CLI outputs, alert banners, or commit messages. Rely on crisp typography, inline SVG icons, and semantic badges.
- **Self-Documenting Code**: Code must be clear through disciplined naming and explicit types rather than dense narrative comments. When comments are required, explain *why* an architectural decision was made, not *what* the syntax does.

---

## 3. Strict Conventional Commits Standard

Every version control commit must strictly follow the Conventional Commits specification with an imperative, technically precise subject:

```
<type>(<scope>): <imperative summary>

[optional professional body explaining architectural rationale]
```

### Approved Commit Types:
- `feat`: New feature or major architectural addition
- `fix`: Bug fix, visual defect repair, or rubric score correction
- `refactor`: Code restructuring without functional or visual changes
- `perf`: Performance optimization or bundle size reduction
- `test`: Addition or modification of unit, integration, or rubric tests
- `docs`: Documentation, architecture diagrams, or rule updates
- `chore`: Dependency updates, build script adjustments, configuration
- `ci`: Continuous Integration pipeline modifications

### Commit Message Quality Rules:
- Subject line must be lowercase, imperative ("add", "refine", "enforce", not "added" or "adds"), and must not end with a period.
- No vague summaries (e.g. `fix: update stuff`, `chore: changes`). Always specify the exact seam modified (e.g. `fix(archetypes): settle motion indicators to satisfy Grade A+ rubric`).
- Every commit must pass `scripts/verify-commit-msg.js`.

---

## 4. Zero-Tolerance Anti-Slop Enforcement Protocol

Any agent generating or editing user interface components within this repository or on projects using Sloppy must execute the anti-slop verification loop before finalizing changes:

### The Craft Rubric Gate:
- **Mandatory Grade A+ (100/100, minimum 95/100)**: All UI components and master archetypes must be scored against the 10-point Craft Rubric (`sloppy rubric <file> --strict` or MCP `sloppy_evaluate_rubric`).
- **Zero Slop Violations**: `sloppy check <file> --json` must return `ok: true` and exit `0`. Never claim a file is clean without a fresh check result.
- **Closed loop**: detect (`sloppy check`), plan (`sloppy plan`), review (`sloppy fix --diff`), apply (`sloppy fix --write`), then re-check. The fixer refuses to write syntax-invalid output.

### Prohibited AI Slop Anti-Patterns:
1. **No Purple/Indigo Gradients**: Prohibit `bg-gradient-to-r from-purple-* to-indigo-*` on marketing cards and action buttons.
2. **No Sparkle Clichés**: Prohibit `LucideSparkles` or decorative stars as AI markers. Use authentic product status indicators or precise monochrome glyphs.
3. **No Ungrounded / Floating Windows**: All application frames must occupy >= 66% of the viewport stage and bleed off at least one boundary edge. Never float a miniature shrunken window with equal margin on all four sides.
4. **No Boxed Card Monotony**: Never wrap every datum in identical rounded bordered boxes. Establish surface depth hierarchies (Surface 0 -> Surface 1 -> Surface 2 -> Surface 3).
5. **No Word Overload**: Enforce the 3–7 word budget. Real text is reserved exclusively for the focal narrative; secondary metadata must use quiet placeholder bars (`<Bar />`).
6. **No Unearned Animations**: Eliminate arbitrary keyframe loops (`animate-bounce`, `animate-pulse`, `animate-ping`). Motion must be cause-driven (e.g., cursor press, settlement event) with physically damped easing.

---

## 5. Architectural Boundaries & Monorepo Packages

- `@sloppy/core`: Pure TypeScript anti-slop engine, regex/AST linters, repair planner, and Craft Rubric evaluator. Must remain dependency-lean.
- `@sloppy/kit`: Pure React + CSS component primitives (`Stage`, `Window`, `Act`, `Ease`, `Bar`, `Cursor`). Zero runtime dependencies beyond React.
- `@sloppy/mcp`: Model Context Protocol server exposing tools over stdio and SSE.
- `@sloppy/cli`: Developer command-line interface. Clean output with exit code 1 on quality violations.
- `@sloppy/verify`: Automated geometric framing, contrast, and motion continuity verification.
- `@sloppy/playground`: Interactive local development studio and archetype inspector.

---

## 6. Multi-Agent Coordination

OpenCode and Antigravity share this repository. Before starting work, read `docs/AGENT-COORDINATION.md`. It defines file ownership, the token and contrast contract, and the current work board. Claim a task there instead of rewriting another agent's files. The Refero Styles cache is a shared source of truth: derive looks with `node scripts/refero-looks.mjs` and verify them with `node --test test/looks.test.mjs`.
