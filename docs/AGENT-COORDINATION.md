# Agent Coordination: Sloppy and Antigravity

Two agents work this repository. This document is the shared contract so the work
stays additive instead of colliding.

- **OpenCode** leads the anti-slop engine: `packages/core`, `packages/cli`, `packages/mcp`, and the test suite.
- **Antigravity** owns the Refero Styles MCP server and the visual playground verification loop.

Neither agent rewrites the other's files without an explicit handoff. Append a task
below instead, or open a branch and link it.

---

## Shared contract

1. **Tokens are evidence, not decoration.** A Refero look must carry `source.site`,
   `source.url`, and `source.styleId`. Never invent a hex value when the DESIGN.md
   token table has one.
2. **Surface order is semantic.** `background`, `surface1`, `surface2`, `surface3`
   follow the source site's own canvas, panel, and border roles.
3. **Contrast is a gate, not a preference.** Body text must clear AAA (7:1) and muted
   text must clear AA (4.5:1) against every surface. `test/looks.test.mjs` enforces
   this for hex and alpha-composited colors.
4. **One accent.** The accent is a signal. It must differ from the canvas and must
   not be used as a decorative gradient.
5. **Conventional Commits.** `feat(looks): ...`, `fix(looks): ...`, `test(looks): ...`.

---

## Work board

### Completed by OpenCode

- Added `packages/core/src/looks/refero.ts` with eight production looks sourced from
  the Refero cache: `nuxt`, `linearity`, `grafana`, `modern-treasury`, `milanote`,
  `bunny`, `heptabase`, `glyphs`.
- Extended `LookDefinition` with optional `fontSans`, `fontMono`, and `source`.
- Merged the Refero set into `LOOKS` without changing the existing seven looks.
- Corrected muted-text tokens in `minimal`, `radix`, `blueprint`, `modern-treasury`,
  `milanote`, `bunny`, and `heptabase` to clear AA on every surface.
- Added `scripts/refero-looks.mjs`, which reads the Refero SQLite cache directly and
  prints palette, typography, and provenance for any cached brand.
- Added `test/looks.test.mjs`: token integrity, surface distinctness, contrast, and
  provenance checks.
- Updated the CLI `looks` output, the MCP `sloppy_get_look` description, the skill,
  and the README.

### Open for Antigravity

| Task | Files | Acceptance |
|---|---|---|
| Expand the Refero cache with the next production set (for example Vercel, Raycast, Stripe, Notion, Framer, Superhuman, Clerk, Resend) using the Refero MCP tools. | `~/.refero-styles/refero.db` | `node scripts/refero-looks.mjs list` shows the new brands |
| Derive and append the next look batch. Use `node scripts/refero-looks.mjs "<brand>" --json` for palette and fonts, then follow the surface-role mapping above. | `packages/core/src/looks/refero.ts` | `node --test test/looks.test.mjs` passes |
| Surface the Refero looks in the playground look switcher and visually verify each one. | `packages/playground` | `sloppy verify` reports no framing or accent violations |
| Re-run the craft rubric on the archetypes against the new looks. | `scripts/verify-archetypes.js` | `npm run test:rubric` stays at Grade A+ |

### Shared guardrails

- Do not add a runtime dependency to `@sloppy/core`. The Refero bridge is a dev
  script and uses `node:sqlite`, which is built in on Node 22.5+.
- Do not copy a brand's logo or proprietary artwork into the repository. Tokens and
  typography families only.
- Do not change the shape of `cssVariables`. It mirrors the eight `--ss-*` tokens.

---

## Handoff protocol

1. Claim a row by moving it to a branch name in the table.
2. Run `npm run build && npm run typecheck && npm test` before handing back.
3. Record the exact commands and results in the pull request. A claim without a fresh
   verification run is not a handoff.

## Verification commands

```bash
node scripts/refero-looks.mjs list
node scripts/refero-looks.mjs "Grafana Labs" --json
npm run build
npm run typecheck
npm test
node packages/cli/bin/sloppy.js looks
```
