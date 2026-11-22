# Claude Code Guidelines - Sloppy Repository

## 1. Professional Tone & Zero Emojis
- Maintain senior engineering rigor across all code comments, documentation, and commit messages.
- Avoid all slang, informal filler, or colloquial wording.
- Enforce the Strict Zero Emojis Policy in all generated assets.

## 2. Zero-Tolerance Anti-Slop Gate
Before marking any UI task complete:
- Execute `sloppy check <file> --json`: Must return `ok: true`, exit 0, and 0/100 slop score.
- Execute `sloppy rubric <file>`: Must score Grade A+ (>=95/100).
- Eliminate unanchored floating windows, purple gradients, sparkle icons, unearned keyframe animations, and excessive text.
- Never claim a file is clean without a fresh `sloppy check` result.

## 3. Conventional Commits
- Always use Conventional Commits format: `<type>(<scope>): <subject>`.
- Keep commit subjects concise, lowercase, imperative, and strictly professional.
