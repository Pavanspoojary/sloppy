# Motion Research & Roadmap

What good UI motion requires, what generated pages get wrong, what Sloppy enforces
today, and the evidence gaps that remain. This is the research behind the
`MOT-01`..`MOT-18` rule set and `skills/sloppy/references/motion-review.md`.

## 1. Method

Reviewed the sources that actually define UI motion craft rather than trend posts:

- Chrome's Modern Web Guidance motion guide: compositor-only properties, `@starting-style`,
  View Transitions, WCAG 2.2.2 pause controls, flashing limits.
- Emil Kowalski's animation writing (`Great Animations`, `7 Practical Animation Tips`):
  duration, easing, triggers, `scale(0)`, tooltips, transform-origin.
- WCAG 2.2.2 Pause, Stop, Hide; 2.3.1 Three Flashes; 2.3.3 Animation from Interactions.
- Apple HIG Motion: purposeful motion, reduced motion, custom easing.
- Practitioners' anti-slop work: everything-fades-up defaults, one-easing-everywhere,
  mixed motion physics across sections, and the "one motion personality per page" rule.
- Sloppy's own 74 pattern directories and the Stageshow-derived `motion.md`
  (story, loops, choreography, cursor, drags) for the craft rules that a scanner
  cannot prove.

The conclusion: **motion quality is decided before the curve.** Frequency, purpose, and
budget decide whether motion belongs; properties decide whether it is smooth; curves
and durations decide whether it feels designed; accessibility decides whether it is
allowed to exist at all.

## 2. Findings: what makes motion read as designed

1. **Frequency decides.** Motion on a repeated keyboard action is latency, not delight.
   Rare moments get the budget; frequent ones get none.
2. **One motion contract per page.** Three durations (fast feedback, small surface,
   large surface), one entrance curve, one exit curve, springs only for gestures, one
   signature move. Mixed physics is the loudest "template" tell.
3. **Feedback under ~300ms.** A 400ms dropdown is measurably worse than 180ms. Large
   surfaces may take 300-400ms; hovers and presses should not.
4. **Ease-out enters, ease-in exits, linear is a defect.** `ease-in` on an entrance
   delays the moment the user is watching.
5. **Compositor properties only.** `transform` and `opacity`; never `width`, `height`,
   `top`, `left`, `margin`, `padding`; avoid `transition: all` so nothing unknown moves.
6. **Physical correctness.** Grow from the trigger, start scale at 0.9-0.96, keep the
   container while its content changes, hold the payoff, and stop.
7. **Reduced motion simplifies, never deletes.** Remove travel, zoom, parallax, and
   loops; keep the state change and layout complete.
8. **Autoplay needs a control.** Over five seconds beside other content, a visible
   keyboard pause is required, independent of motion preference.

## 3. Findings: what generated pages get wrong

| Rank | Tell | Root cause | Rule |
| :--- | :--- | :--- | :--- |
| 1 | Every section `opacity 0 -> 1` + 20px rise on scroll | Page-builder default; JS-dependent content | `MOT-08` |
| 2 | One duration and easing for every element | No motion contract | `MOT-07`, reference doc |
| 3 | Hover lift/scale on non-interactive cards | "Make it feel alive" without interaction semantics | `MOT-14` |
| 4 | Infinite marquee, logo strip, auto-carousel | Signed-off decoration | `MOT-09` |
| 5 | `transition-all` | Convenience | `MOT-06` |
| 6 | `scale(0)` entrances | Wrong mental model of "appear" | `MOT-11` |
| 7 | 3D tilt and parallax everywhere | Awwwards-kit copying | `MOT-13` |
| 8 | Looping CSS with no reduced-motion fallback | Accessibility treated as optional | `MOT-12` |
| 9 | Flash/strobe status effects | Novelty | `MOT-10` |
| 10 | Unearned loops and shimmers | Content thinness masked by motion | `MOT-01`, `MOT-02` |
| 11 | The same fade-up on four or more blocks, and mount motion on headings and navigation | Polish applied uniformly with no hierarchy | `MOT-15` |
| 12 | Bouncy/elastic easing on dialogs and cards | Playful gesture recipe copied onto routine surfaces | `MOT-16` |
| 13 | `will-change` left on every animated element | Layer hint treated as a permanent style | `MOT-17` |

## 4. What Sloppy enforces now

| Rule | Evidence | Gate |
| :--- | :--- | :--- |
| `MOT-01` Unearned looping animation | Source classes/tags | Reflex, auto-fix |
| `MOT-02` Unbounded infinite programmatic motion | Source (`repeat: Infinity`, `loop: true`) | Reflex |
| `MOT-03` Missing reduced-motion guard (runtime libraries) | Source + standard | Floor |
| `MOT-04` Layout-thrashing property animation | Source | Reflex |
| `MOT-05` Unmanaged WebGL/Lottie/scroll lifecycle | Source | Floor |
| `MOT-06` `transition: all` | Source (classes, CSS, inline strings) | Reflex |
| `MOT-07` Slow interaction feedback (>=600ms) | Source (durations on controls/hover variants) | Reflex |
| `MOT-08` Scroll-reveal saturation | Source (`whileInView`, AOS, observer + `opacity: 0`) | Reflex |
| `MOT-09` Autoplay without pause control | Source + WCAG 2.2.2 | Floor |
| `MOT-10` Flashing/strobe animation | Source + WCAG 2.3.1 | Floor |
| `MOT-11` Entrance from `scale(0)` | Source (motion props, keyframes, classes) | Reflex |
| `MOT-12` Unguarded CSS loop | Source + `prefers-reduced-motion` presence | Reflex |
| `MOT-13` Parallax / fixed background / 3D tilt | Source + WCAG 2.3.3 | Reflex |
| `MOT-14` Hover motion on non-interactive surface | Source + DOM ancestry | Reflex |
| `MOT-15` Uniform entrance motion (4+ identical, or on reading text) | Source (`initial`/`animate` pairs, element names) | Reflex |
| `MOT-16` Overshoot/elastic easing on routine surfaces | Source (`cubic-bezier` y outside 0-1) | Reflex |
| `MOT-17` Permanent `will-change` layer hint | Source (3+ declarations or tokens) | Finish |
| `MOT-18` Duration outside the declared motion scale | Source + `DESIGN.md` motion lock | Finish |

Rendered (`sloppy verify --a11y`) now also measures:

- infinite animations running with no pause control (large-area or marquee/carousel-named),
- interactive controls whose computed transition duration is 600ms or more,
- infinite animations still running under `prefers-reduced-motion: reduce`,
- first paint with JavaScript disabled (`motion.jsDependentFirstPaint`) when most visible
  text only appears after a script runs,
- 320px reflow and 200% text-resize clipping, which motion-adjacent layouts break often.

All requested passes share one browser launch: `--a11y --multi-width --motion` is one
Chrome process and one JSON object.

Rendered interaction evidence (`sloppy verify --motion <spec>`):

- executes only declared selectors (`trigger`, `target`, `anchor`, optional `closeTrigger`),
- samples boxes and `requestAnimationFrame` deltas across the interaction,
- reports `motion.handoffShift` (movement after settle), `motion.anchorDrift`
  (surrounding geometry moves), `motion.stuckTransition` (finite animation still
  running), `motion.interruptNotRecovered` (reversed open left half-open),
  `motion.layoutShift` (observed layout movement during the interaction, craft
  evidence), `motion.focusLoss` (focus not returned to the trigger), and
  `motion.missingSelector` (a declared selector is absent, so nothing ran),
- opens a surface from the keyboard (`openKey`) and closes it with a key (`closeKey`),
  reporting `motion.keyboardOpenIgnored` and `motion.keyboardCloseIgnored`,
- runs `precondition` steps before measuring, so tabs, filters, and staged states are
  auditable without a bespoke page,
- re-runs every declared interaction under `prefers-reduced-motion: reduce` and reports
  `motion.reducedMotionTravel` (the target still moves), `motion.reducedMotionHidesContent`
  (the state change was deleted instead of simplified), and
  `motion.reducedMotionKeepsLoop` (an infinite animation keeps running),
- keeps frame-budget evidence low-confidence craft rather than a CI threshold, and
- `--repeat N` separates findings that held in every run from machine-dependent ones,
  with `--baseline <path>` writing the stable set for calibration.

## 5. Remaining gaps, in priority order

1. **State-transition coverage.** Declared interactions now cover menus, tabs, forms,
   and filters. Loading, empty, and error states, plus declared keyboard paths, are
   still uncovered.
2. **Calibrated layout-shift evidence.** Observed shift entries are summed and reported
   as craft (`motion.layoutShift`). `--repeat` now separates stable findings from
   machine-dependent ones; a CI threshold still needs a recorded baseline.
3. **Calibrated frame budget.** `requestAnimationFrame` deltas are sampled and reported
   as low-confidence craft; repeated runs and a baseline now exist, but no threshold
   should gate CI until two machines agree on one.
4. Done: **motion contract tokens in `DESIGN.md`.** `motion-fast`, `motion-base`,
   `motion-slow`, `motion-max-feedback`, `motion-ease-enter`, `motion-ease-exit`, and
   `motion-signature` are parsed from the token lock. `MOT-07` uses the declared feedback
   ceiling and `MOT-18` reports durations beyond the declared slow token; with no contract
   the default ceiling stays 600ms and no off-contract judgment is made.
5. **Screenshot motion review.** Capture the first/last frame of a declared transition
   and compare geometry, text pixels, and masks. Keep findings in Reflex/Finish until
   calibrated.
6. Done: **No-JavaScript first paint.** `verify --a11y` renders the page with
   JavaScript disabled and reports when the visible text only appears after a script.
   Throttled-load evidence (slow CPU or network before first paint) is still missing.
7. **Flash frequency measurement.** `MOT-10` detects named flashes; a rendered check
   could count luminance inversions per second.
8. Done: **Keyboard paths.** `openKey` and `closeKey` exercise keyboard activation and
   dismissal per declared interaction. Focus trapping inside an open dialog is still
   unmeasured.

## 6. Non-goals

Sloppy must not ban motion, springs, GSAP/Motion/Lenis, scroll effects, tilt, marquees,
or video. It flags specific, evidenced failures: missing pause, missing reduced-motion
handling, flashing, hidden first-screen content, slow feedback, unknown-property
transitions, layout animation, and motion on surfaces that cannot be clicked. A page
with one well-built signature move and everything else quiet must stay clean.

## 7. Sources

- https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion
- https://emilkowal.ski/ui/great-animations
- https://emilkowal.ski/ui/7-practical-animation-tips
- https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://impeccable.style/slop
- https://github.com/kylezantos/design-motion-principles/blob/main/skills/design-motion-principles/references/anti-checklist.md
- https://adamarant.com/en/blog/functional-ui-animation-in-2026-the-checklist-before-it-ships
- https://www.paralect.com/blog/signs-of-ai-slop-in-design
