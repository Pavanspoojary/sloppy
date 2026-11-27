# Motion Review

The craft rules for animation live in `motion.md`; this file is the audit that decides
whether a page's motion is designed or generated. Use it before shipping any page with
hover, enter, scroll, loop, or gesture motion, and when reviewing motion the linter
flagged. Every threshold here is grounded in the sources at the end.

## Index

1. [The gate: should it animate at all](#the-gate-should-it-animate-at-all)
2. [The motion contract](#the-motion-contract)
3. [Timing and easing by job](#timing-and-easing-by-job)
4. [Property discipline](#property-discipline)
5. [The AI motion-slop catalog](#the-ai-motion-slop-catalog)
6. [Accessibility gates](#accessibility-gates)
7. [The review procedure](#the-review-procedure)
8. [Sources](#sources)

## The gate: should it animate at all

Ask in this order and stop at the first "no":

1. **How often will a person see it?** Motion on a keyboard-repeated action (command
   palette open, tab switch, row selection, submit) is a tax paid hundreds of times a
   day. Do not animate it. Motion on a rare, delightful moment is where the budget goes.
2. **What does it explain?** Motion must explain where something came from, where it
   went, or how a value changed. If the answer is "it makes the page feel alive", cut it.
3. **What is the cheapest tool that works?** CSS transition before CSS animation, CSS
   before a library, `@starting-style`/View Transitions before hand-rolled JS. A motion
   library is for gestures, interruption, and shared layout, not for fades.
4. **What happens with reduced motion?** Reduced motion simplifies, it does not delete
   the state change: opacity and instant position changes remain, travel and scale go.

The most common failure is not a bad curve. It is animating an element that had no
reason to move.

## The motion contract

A page has one motion personality, in the same way it has one palette. Decide these
before writing a transition, record them in `DESIGN.md`, and keep every component on
them.

| Token | Rule |
| :--- | :--- |
| Duration scale | Three durations, chosen by size: `fast` = 150–200ms (hover, press, tooltip), `base` = 200–300ms (dropdown, popover, small panel), `slow` = 300–500ms (sheet, drawer, full-screen surface). Storytelling may exceed this; product feedback may not. |
| Curves | One entrance curve (`ease-out`, e.g. `cubic-bezier(0.16, 1, 0.3, 1)`), one exit/travel curve. `ease-in` is wrong for entrances. `linear` is wrong for anything a person watches. |
| Spring | Springs are for gestures and direct manipulation, never for a hover or a tooltip. An overshoot is allowed on one small expressive icon, never on readable text or a whole surface. |
| Feedback ceiling | One maximum for hovers, presses, and focus. Default 600ms; a project may declare a tighter value (`motion-max-feedback`) and `MOT-07` enforces it. |
| Signature | One signature move per page. Everything else stays quiet. Two competing signature moves read as a template. |
| Triggers | Familiar triggers: hover, press, open, navigate, drop. Never a background loop, never a scroll-jack, never a cursor follower as the main event. |
| Origin | A popover grows from the trigger (`transform-origin: var(--transform-origin)`), a sheet from its edge. Never from the centre of the screen unless the trigger is there. |

## Timing and easing by job

| Job | Curve | Duration | Notes |
| :--- | :--- | :--- | :--- |
| Hover and press feedback | `ease-out` | 100–150ms | Start on the input. A presentation delay reads as lag. `:active` scale 0.97 is enough. |
| Tooltip, chip, small popover | `ease-out` | 150–200ms | Grow from the trigger. Skip the delay and animation on subsequent tooltips in the same group. |
| Dropdown, menu, combobox | `ease-out` | 160–240ms | Enter from 0.96 scale plus fade, not from 0. Never mid-fade at a standstill. |
| Modal, sheet, drawer | `ease-out` (enter), `ease-in` (exit) | 250–400ms | Exit faster than entrance. Large surfaces may be a little slower than small ones. |
| Tab or page body swap | `ease-out` | 150–250ms | Crossfade the body, keep chrome and tab indicator steady. |
| Shared-element or layout change | spring or `ease-in-out` | 300–500ms | The only place a spring belongs on non-gesture motion. Interruptions must retarget from the current geometry. |
| Scroll-driven reveal | `ease-out` | 300–600ms | One motif, content must exist and be readable without JS. |
| Story beat in a product demo | `cubic-bezier(0.45, 0, 0.1, 1)` travel | 0.8–1s travel | Demo motion is allowed to be slower than product feedback; never use demo pacing in a real control. |

Rules that survive every table:

- **Duration scales with distance and size,** not with taste. A 4px tooltip nudge and a
  full-screen sheet cannot share a duration.
- **One duration/easing for everything flattens the hierarchy.** If every element on
  the page arrives in 500ms on the same curve, nothing has emphasis.
- **Exit follows the way in,** quicker. If a panel grew from the top-right, it leaves
  toward the top-right.
- **Interruptible by default.** State changes use transitions so a reversed hover or a
  reopened menu retargets mid-flight instead of restarting.
- **Nothing pops.** Every entrance has an exit; nothing appears at full size in one
  frame. This includes borders, dashed outlines, and text that swaps.
- **Hold the result.** After the payoff, stop. A useful still needs no pulse, shimmer,
  or repeated count.

## Property discipline

Animate only what the compositor can carry:

| Safe | Costly | Never |
| :--- | :--- | :--- |
| `transform` (translate, scale, rotate) | `clip-path`, `filter: blur()`, `backdrop-filter` (paint-bound; small regions only) | `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `gap` |
| `opacity` | `box-shadow` (repaint; animate a pseudo-element's opacity instead) | `transition: all` |
| `color`, `background-color`, `border-color` (short, small areas) | `border-radius` on a large surface | `display` / `visibility` without `@starting-style` or `allow-discrete` |

- `will-change` is a hint for a known upcoming animation, added just before it and
  removed after. Leaving it on many elements creates layers and memory pressure
  (`MOT-17` flags a page that declares it three or more times).
- A single 60fps frame budget is ~16.7ms for everything on the page. Two backdrop
  filters, a particle canvas, and a scroll smoother in one viewport do not fit.
- Animate the child, not the layer that holds readable text. Scaling a text container
  blurs glyphs mid-flight or leaves them on a half-pixel at rest.
- Use `@starting-style` and `transition-behavior: allow-discrete` for entry/exit of
  popovers and modals instead of mounting a wrapper with a JS timeout.
- Prefer CSS scroll-driven animations (`animation-timeline: scroll()`) over JS scroll
  listeners for non-essential effects.

## The AI motion-slop catalog

These are the tells. Each maps to a canonical rule where the scanner can prove it.

| Tell | Why it reads as generated | Rule | Fix |
| :--- | :--- | :--- | :--- |
| **Everything fades up on scroll** — every section enters with the same `opacity 0 → 1`, `translateY(20px)` | The default of every page builder; content is invisible until JS runs | `MOT-08` | Render content visible. Keep one restrained reveal, or none. |
| **The same entrance on every block** — four or more elements share one identical `initial`/`animate` pair, one `fadeInUp` keyframe on many selectors, or any mount motion on `h1`-`h6`, `p`, or `nav` | Polish applied uniformly with no hierarchy; reading is delayed to show off the fade | `MOT-15` | One entrance motif on the focal element; text and navigation render visible. |
| **Blur-in on every card and heading** — `filter: blur(4px)` in every entering element | The polished-entrance recipe copied everywhere; blurs text on first paint | `MOT-15` | Blur only one focal surface, never readable text; prefer opacity and 8-12px travel. |
| **Bouncy dialog and spring on routine surfaces** — `cubic-bezier(…, 1.56, …)`, `animate-bounce`, overshoot springs on modals and cards | Copying a playful gesture recipe where no gesture exists | `MOT-16` | Routine surfaces enter on `ease-out`; overshoot stays on one small expressive icon. |
| **One curve and one duration everywhere** | Reads as a single template transition applied globally | `MOT-07` (slow), `MOT-18` (off-contract), motion contract | Three durations, entrance vs exit curves, and values from the declared scale. |
| **`transition-all`** | Animates properties nobody chose, including layout | `MOT-06` | Name the properties. |
| **Hover lift on static cards** (`hover:-translate-y-1`, `hover:scale-105` on a non-interactive `div`) | Promises a click that does not exist | `MOT-14` | Remove it, or make the whole card a real control. |
| **Infinite marquee / logo strip / auto-carousel** | Autoplay decoration with no pause, often over 5s | `MOT-09` | Add a keyboard pause, or make it finite. |
| **Blinking status dot / pulse badge** | Decorative liveness with no telemetry | `CPY-02`, `MOT-01` | Bind it to real state or delete it. |
| **Entrance from `scale(0)`** | Object appears from nowhere instead of growing | `MOT-11` | Start at 0.9–0.96. |
| **Sparkle shimmer, gradient sweep, aurora blobs behind text** | Atmosphere standing in for product content | `VIS-02`, `VIS-07`, `MOT-01` | Real product surface or nothing. |
| **Magnetic buttons, custom cursor followers, cursor spotlight** | Novelty that delays the actual click and disappears on touch | — | Delete unless the cursor is the product. |
| **3D tilt on every card** (`perspective` + `rotateX/Y` on hover) | Awwwards-kit default; large-area motion, often unguarded | `MOT-13` | One tilt at most, small angle, reduced-motion guarded. |
| **Parallax and fixed backgrounds on mobile** | Jank plus vestibular risk | `MOT-13`, `MOT-03` | Disable under reduced motion and on small screens. |
| **Scroll-jacking / smoothed wheel (Lenis) on a marketing page** | Hijacks native scroll for a page that did not need it | `UX-05` | Remove it unless scroll storytelling is the product. |
| **Letter-by-letter heading animation** | Slow to read, hurts LCP, degrades screen readers | `MOT-08` (when repeated) | Animate the line, not the letters. |
| **Counting numbers on scroll with no cause** | Number moves without a data change | — | Animate on a real value update, and hold the final value. |
| **Skeleton shimmer everywhere** | Perpetual motion where a quiet placeholder would do | `MOT-01`, `MOT-12` | Static placeholder, or one short shimmer with reduced-motion fallback. |
| **Animated gradient text/background** | The Gen-1 AI signature, still common | `VIS-01`, `MOT-01` | Solid ink, single accent. |
| **`animate-bounce` on a scroll-down chevron** | Decoration with no state | `MOT-01` | Static affordance. |

A page that fixes every table row but still animates a keyboard action is worse off
than a quiet page. Frequency beats aesthetics.

## Accessibility gates

- **`prefers-reduced-motion` is a requirement, not a nicety.** Simplify: remove travel,
  zoom, parallax, and loops; keep opacity/instant state changes. Do not set every
  duration to 0 and leave the element unmounted mid-state.
- **WCAG 2.2.2 Pause, Stop, Hide:** any motion that starts automatically, lasts more
  than five seconds, and sits beside other content needs a visible, keyboard-operable
  pause/stop/hide control. `prefers-reduced-motion` does not replace the control.
- **WCAG 2.3.1 Three Flashes:** nothing may flash more than three times in any one
  second, regardless of motion preference. No strobe, no rapid invert.
- **WCAG 2.3.3 Animation from Interactions (AAA):** interaction-triggered motion that
  can cause vestibular symptoms (parallax, large zoom, tilt, full-screen travel) must be
  disableable unless it is essential.
- **2.5.8 / pointer targets:** motion must not shrink or move the hit area under the
  pointer; a button that scales down on press still needs a 24×24 CSS px target.
- Do not animate a keyboard-initiated action. If the flow is reachable by repeated key
  presses, the animation becomes latency.
- Check the reduced-motion view for broken layout: content that only appears after a
  scroll observer must still exist when motion is off.
- Check the no-JavaScript view: first-screen content must be present in the HTML.

## The review procedure

1. **Static pass.** Run `sloppy check <path> --strict --compact`. Read every MOT
   finding; do not silence one without a written rationale in `sloppy.config.json` or
   `sloppy-override`.
2. **Rendered pass.** Run `sloppy verify <url> --a11y --multi-width`, and for declared
   flows `sloppy verify <url> --motion <spec.json>`. The interaction audit re-runs every
   declared interaction under `prefers-reduced-motion: reduce` and reports leftover
   travel (`motion.reducedMotionTravel`), a state change that disappears
   (`motion.reducedMotionHidesContent`), and loops that keep running
   (`motion.reducedMotionKeepsLoop`). The a11y pass adds infinite autoplay without a
   pause control, slow interaction transitions, 320px overflow, and target-size failures.
3. **Slow-motion pass.** In devtools, slow animations to 10–25% and watch one change
   end to end: onset, travel, overlap, landing, hold. Check the first and last frames
   as stills; text blurred mid-flight or a half-pixel landing counts as a defect.
4. **Interruption pass.** Reverse the hover, reopen the menu mid-close, press the
   submit twice. Nothing should restart from zero, jump, or leave two overlapping
   surfaces.
5. **Reduced-motion pass.** Emulate `prefers-reduced-motion: reduce`; the page must stay
   complete and legible, and loops/travel must stop.
6. **Absence pass.** Turn JavaScript off. First-screen content must be readable and the
   primary action usable.
7. **Budget pass.** Record a performance profile of the first interaction. If the
   animation drops frames on a mid-range laptop, it is not a motion problem to tune; it
   is a property or layer problem to fix.

Report what you watched and what you could not judge. A static scan alone is not
evidence that motion feels right.

## Sources

- [Chrome: Modern Web Guidance — Motion](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion) — compositor-only properties, `@starting-style`, View Transitions, WCAG 2.2.2 and 2.3.1 guidance.
- [Emil Kowalski: Great Animations](https://emilkowal.ski/ui/great-animations) — under 300ms, ease-out for entrances, never animate keyboard actions, purposeful motion.
- [Emil Kowalski: 7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips) — press scale, do not animate from `scale(0)`, tooltip delay, enter/exit curves, transform-origin.
- [WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [WCAG 2.3.1 Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Apple Human Interface Guidelines: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) — reduced motion, purposeful motion, custom easing.
- [Impeccable: Slop — Motion rules](https://impeccable.style/slop) — pulsing status dots, fake carets, auto-marquees, bouncy dialogs.
- [design-motion-principles anti-checklist](https://github.com/kylezantos/design-motion-principles/blob/main/skills/design-motion-principles/references/anti-checklist.md) — uniform fade-ups (flag at four or more components), blur-everywhere entrances, motion on static content.
- [Adamarant: Functional UI animation in 2026 checklist](https://adamarant.com/en/blog/functional-ui-animation-in-2026-the-checklist-before-it-ships) — duration bands, easing as a verb, `ease-in` never on UI.
- [Paralect: signs of AI slop in design](https://www.paralect.com/blog/signs-of-ai-slop-in-design) — heavy appear animations on every block, motion with nothing to say.
