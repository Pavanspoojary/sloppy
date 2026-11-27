# Research Playbook Gap Map

This maps `SLOPPY_RESEARCH_PLAYBOOK.md` to the current repository. It is intentionally
honest about what Sloppy can and cannot evidence today. Update it when a gap closes.

## 1. Evidence layers

| Layer | Current capability | Where | Gap |
| :--- | :--- | :--- | :--- |
| Static/source | Tag, class, attribute, text, and comment scanning. Findings now carry file, line, selector, confidence, evidence kind, and applicability notes. | `packages/core/src/linter/index.ts`, `rule-metadata.ts` | Cross-file semantics and type inference remain out of scope. |
| Browser/DOM/computed | Multi-width overflow, rendered contrast, and rendered accessibility (names, labels, focus visibility, tab-sequence order, 24x24 target size with spacing exception, aria references, duplicate ids, 320px reflow, 200% text resize clipping, reduced motion) via Playwright. Motion budget probes measure infinite autoplay with no pause control and interaction transitions at 600ms or more. Declared motion interactions are executed from a spec and checked for post-settle handoff shift, anchor drift, stuck finite transitions, and half-recovered interruptions; every declared interaction is re-run under `prefers-reduced-motion: reduce` to check leftover travel, a deleted state change, and loops that keep running. First paint is also rendered with JavaScript disabled, and declared interactions may open and close from the keyboard. Static fallback is labeled and never reports a pass. | `packages/verify/multi-width.mjs`, `accessibility.mjs`, `motion-interactions.mjs` | Interaction coverage is limited to what a spec declares; it does not discover flows or assert application semantics. Focus order and text-resize checks are heuristics with medium/low confidence, not full conformance evidence. Frame-budget evidence is low-confidence and not a CI threshold. |
| Visual/perceptual | None in the core scanner. The rubric is a source heuristic, not a screenshot judgment. | `packages/core/src/linter/rubric.ts` | No screenshot regions, DOM anchors, or human-calibrated visual model. |
| Standards | Source findings cite WCAG 1.4.3, 4.1.2, and 2.1.1. Rendered checks cite 4.1.2, 3.3.2, 2.4.3, 2.4.7, 2.5.8, 1.4.10, and 1.4.4. Reduced-motion evidence is collected but classified as craft, not conformance. | `rule-metadata.ts`, `accessibility.mjs` | Focus appearance (2.4.11/2.4.13), full keyboard task completion, and non-heuristic 1.4.4 verification are not covered. |
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
| Motion | `MOT-01`–`MOT-18` |
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

Done: rendered accessible names, form labels, focus visibility, tab-sequence
order, 24x24 target size, aria references, duplicate ids, 320px reflow, 200% text
resize clipping, reduced-motion checks, and rendered motion-budget probes (autoplay
without a pause control, slow interaction feedback) in `verify --a11y` / `check --a11y`,
with an honest `unavailable` result instead of a pass.

Done: the motion rule family expanded from `MOT-01`–`MOT-05` to `MOT-01`–`MOT-18`,
covering `transition: all`, slow interaction feedback, scroll-reveal saturation,
autoplay without pause, flashing, `scale(0)` entrances, unguarded CSS loops,
vestibular-risk parallax/tilt, hover lift on static surfaces, uniform entrance motion,
overshoot/elastic easing on routine surfaces, permanent `will-change` hints, and
durations outside a declared motion scale. `verify` now runs every requested pass in
one browser, proves first paint without JavaScript, follows keyboard open/close paths,
and can repeat runs into a stable baseline. The research and remaining motion roadmap
live in `docs/MOTION_RESEARCH.md`.

1. Done: deterministic motion interaction evidence. A declared spec (`trigger`, `target`, `anchor`, optional `closeTrigger`) runs menu, tab, form, and filter changes and reports post-settle handoff shift, anchor drift, stuck transitions, and half-recovered interruptions. `sloppy init` now scaffolds a starter spec and `DESIGN.md` motion lock, and an absent selector is reported as `motion.missingSelector` instead of a pass. Remaining scope: loading/empty/error state transitions and declared keyboard paths. Layout shift is collected as craft evidence; a calibrated threshold is still pending.
2. Add screenshot capture with DOM anchors and viewport metadata; keep visual
   findings in Reflex/Finish until calibrated.
3. Build the stratified benchmark manifest and record precision/false-positive
   counts per rule before adding more aesthetic heuristics.
4. Add before/after repair evidence and rollback when a Floor or interaction
   regression appears.
5. Replace the focus-order and text-resize heuristics with calibrated checks once
   the interaction fixtures provide ground truth.
