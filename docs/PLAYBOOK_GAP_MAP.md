# Research Playbook Gap Map

This maps `SLOPPY_RESEARCH_PLAYBOOK.md` to the current repository. It is intentionally
honest about what Sloppy can and cannot evidence today. Update it when a gap closes.

## 1. Evidence layers

| Layer | Current capability | Where | Gap |
| :--- | :--- | :--- | :--- |
| Static/source | Tag, class, attribute, text, and comment scanning. Findings now carry file, line, selector, confidence, evidence kind, and applicability notes. | `packages/core/src/linter/index.ts`, `rule-metadata.ts` | Cross-file semantics and type inference remain out of scope. |
| Browser/DOM/computed | Multi-width overflow and rendered contrast via Playwright, with a labeled static fallback. | `packages/verify/multi-width.mjs` | No accessible-role/name tree, focus order, state-machine, or interaction suite yet. |
| Visual/perceptual | None in the core scanner. The rubric is a source heuristic, not a screenshot judgment. | `packages/core/src/linter/rubric.ts` | No screenshot regions, DOM anchors, or human-calibrated visual model. |
| Standards | Contrast findings cite WCAG 1.4.3; fake controls cite 4.1.2/2.1.1. | `rule-metadata.ts` | Target size, reflow, zoom, focus appearance, and reduced motion are not verified. |
| Runtime | `verify` fails closed when the browser is unavailable; no console/network/layout-shift collection. | `packages/verify/browser.mjs` | Add runtime logs and deterministic task assertions. |

## 2. Objective vs craft separation

- Every finding now has `objective`, `confidence`, `evidence.kind`, and `evidence.description`.
- Reports and `sloppy check` totals separate **objective defects** from **craft judgments**.
- Floor rules are not automatically objective; the rule metadata decides. For example,
  `LOW_CONTRAST_GRAY` is objective, while `CENTER_ALIGNED_EVERYTHING` is a craft judgment.
- The slop score remains a summary. It is not a quality certificate and never overrides
  a failed Floor gate.

## 3. Rule families

| Family | Canonical IDs |
| :--- | :--- |
| Visual | `VIS-01`, `VIS-02`, `VIS-03`, `VIS-06`, `VIS-07`, `MED-01`, `MED-02`, `LIV-01` |
| Structure | `STR-01`, `STR-02`, `STR-03` |
| Layout | `LAY-01` |
| Typography | `TYP-08` |
| Motion | `MOT-01` |
| Content | `CPY-01`–`CPY-07`, `VIS-09` |
| Interaction | `UX-02`, `UX-05` |
| Accessibility | `VIS-08`, `AX-01` |
| Tokens | `TOK-01`, `TOK-02` |
| Code | `COD-01`–`COD-06` |

Catalog-only patterns (`VIS-04`, `VIS-05`, `TYP-01`–`TYP-07`, `LAY-02`–`LAY-07`,
`MED-03`, `MED-04`, `COD-07`–`COD-10`) are documented but not enforced. They are
not assigned to a canonical ID until a detector and fixtures exist.

## 4. False-positive controls

- Each canonical rule has documented false positives, non-applicable contexts, and
  validation steps in `docs/RULES.md` and `sloppy rules --json`.
- Auto-fix is limited to high-confidence rules or a declared narrowed scope
  (`WORD_BUDGET_EXCEEDED`, `AI_NARRATION_COMMENT_SLOP`).
- `brand.allowGradients`, `brand.allowColors`, `DESIGN.md` accent, blur cap, and
  palette locks suppress the matching visual findings without disabling the rest.
- `test/evidence.test.mjs` proves a dense dashboard with a table, three metric
  cards, and restrained surfaces stays clean.
- Remaining gap: rules such as `BOXED_CARD_SYNDROME` still use thresholds, not
  task context. Intentional card systems should use `sloppy-ignore` with a written
  rationale until a DOM-based context predicate exists.

## 5. Safe repair loop

Currently implemented: scan → repair plan → `--only` filtering → wiring guard →
syntax check → post-audit → diff. Missing: browser re-run, before/after screenshots,
and automatic rollback on regression. The CLI refuses writes on failed wiring or
syntax, but a visual regression is still a human decision.

## 6. Benchmarks

- `benchmarks/fixtures/` has two real-world-style specimens (v0 dashboard, Bolt pricing).
- `benchmarks/manifest.json` records what is known about provenance and license status.
- There is no stratified dataset, blinded pairwise review, precision/recall history,
  or task-completion harness yet. Do not quote benchmark numbers until those exist.
- Existing tests are regression fixtures, not a quality benchmark.

## 7. Deliberate non-goals

Sloppy must not ban gradients, cards, rounded corners, shadows, asymmetry, centered
heroes, large typography, or motion globally. It must not invent testimonials,
metrics, logos, or imagery. It must not claim WCAG conformance from a static scan.
The rule metadata and report wording are written to keep those limits visible.

## 8. Next slices, in order

1. Add DOM/computed evidence to `verify`: accessible role/name, focus order, target
   size, 200% zoom/reflow, and reduced-motion checks with cited criteria.
2. Add deterministic interaction fixtures: tab switch, menu open/close, form
   validation, filter updates, and loading/empty/error states.
3. Add screenshot capture with DOM anchors and viewport metadata; keep visual
   findings in Reflex/Finish until calibrated.
4. Build the stratified benchmark manifest and record precision/false-positive
   counts per rule before adding more aesthetic heuristics.
5. Add before/after repair evidence and rollback when a Floor or interaction
   regression appears.
