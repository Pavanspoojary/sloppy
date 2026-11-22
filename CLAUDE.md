# Claude Code Guidelines - Sloppy Repository

## 1. Core Engineering Directive: Ponytail Policy
Always apply the **Ponytail Senior Developer Policy**:
"The best code is the code you never wrote."
Stop at the first rung that holds:
1. YAGNI - If not requested, omit it.
2. Existing Codebase - Search `@sloppy/core`, `@sloppy/kit`, etc., before creating new helpers.
3. Standard Library - Leverage native TypeScript/Node/JavaScript APIs first.
4. Native Web Platform - Use native CSS and semantic HTML over heavy custom components.
5. Existing Dependencies - Never introduce unnecessary packages.
6. Minimal Effective Form - Keep implementations concise, surgical, and readable.
7. Boring Over Clever - Strive for simple, durable, maintainable code.

## 2. Professional Tone & Zero Emojis
- Maintain senior engineering rigor across all code comments, documentation, and commit messages.
- Avoid all slang, informal filler, or colloquial wording.
- Enforce the Strict Zero Emojis Policy in all generated assets.

## 3. Zero-Tolerance Anti-Slop Gate
Before marking any UI task complete:
- Execute `sloppy check <file> --json`: Must return `ok: true`, exit 0, and 0/100 slop score.
- Execute `sloppy rubric <file>`: Must score Grade A+ (>=95/100).
- Eliminate unanchored floating windows, purple gradients, sparkle icons, unearned keyframe animations, and excessive text.
- Never claim a file is clean without a fresh `sloppy check` result.

## 4. Conventional Commits
- Always use Conventional Commits format: `<type>(<scope>): <subject>`.
- Keep commit subjects concise, lowercase, imperative, and strictly professional.

## 5. Continuous README & Documentation Maintenance
- Always keep `README.md` and repository docs synchronized whenever features, flags, configurations, rules, or test suites are modified.
- Never allow documentation drift; verify command snippets and tables match current behavior.

