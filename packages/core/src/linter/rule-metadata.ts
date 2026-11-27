import type { SlopViolationType, RuleTier } from './types.js';

/**
 * Evidence and applicability metadata for the canonical rule table.
 *
 * CANONICAL_RULES remains the single source of truth for IDs. This module adds
 * the fields a finding needs to be explainable: where the evidence came from,
 * how confident the detector is, whether the claim is objective, and when the
 * rule must stay quiet. Keep this honest — declaring `dom` or `runtime` here
 * would promise evidence the scanner does not actually collect.
 */
export type RuleFamily =
  | 'visual'
  | 'structure'
  | 'layout'
  | 'typography'
  | 'motion'
  | 'content'
  | 'interaction'
  | 'accessibility'
  | 'tokens'
  | 'code';

export type EvidenceKind =
  | 'source'
  | 'dom'
  | 'computed-style'
  | 'screenshot'
  | 'interaction'
  | 'runtime'
  | 'standard'
  | 'human-review';

export type FindingConfidence = 'high' | 'medium' | 'low';

export interface RuleMetadata {
  family: RuleFamily;
  confidence: FindingConfidence;
  /** True when the finding is a verifiable defect, not a visual opinion. */
  objective: boolean;
  evidenceKinds: EvidenceKind[];
  falsePositives: string[];
  notApplicableWhen: string[];
  validation: string[];
  sourceUrls: string[];
  /** Required when an auto-fix is narrower than "rewrite the whole finding". */
  autoFixScope?: string;
}

const WCAG_CONTRAST = 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html';
const WCAG_NAME_ROLE = 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html';
const WCAG_KEYBOARD = 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html';
const NN_G_HEURISTICS = 'https://www.nngroup.com/articles/ten-usability-heuristics/';
const APPLE_HIG = 'https://developer.apple.com/design/human-interface-guidelines';

const meta = (
  family: RuleFamily,
  confidence: FindingConfidence,
  objective: boolean,
  falsePositives: string[],
  notApplicableWhen: string[],
  validation: string[],
  evidenceKinds: EvidenceKind[] = ['source'],
  sourceUrls: string[] = []
): RuleMetadata => ({ family, confidence, objective, evidenceKinds, falsePositives, notApplicableWhen, validation, sourceUrls });

export const RULE_METADATA: Record<SlopViolationType, RuleMetadata> = {
  HERO_GRADIENT_TEXT: meta(
    'visual', 'high', false,
    ['A brand gradient explicitly declared in DESIGN.md or brand assets.', 'A reference recreation where the source headline is genuinely gradient-filled.'],
    ['The gradient is decorative background, not clipped text.'],
    ['Confirm the headline still passes contrast after replacement.']
  ),
  PURPLE_GRADIENT_SLOP: meta(
    'visual', 'high', false,
    ['Purple is the declared brand accent in DESIGN.md.', 'The project enables brand gradients through `brand.allowGradients`.'],
    ['A single semantic status color uses purple without a gradient.'],
    ['Check the flat replacement against the declared palette and surrounding surfaces.'],
    ['source'], [APPLE_HIG]
  ),
  EMERALD_MONOCULTURE: meta(
    'visual', 'high', false,
    ['Emerald is declared as the brand accent in DESIGN.md or `brand.allowColors`.', 'Emerald communicates a specific success state rather than decorating the page.'],
    ['The page has no dark ground; this rule targets the Gen-2 dark-emerald default.'],
    ['Verify the replacement accent against the declared token and contrast.']
  ),
  BLUR_OVERUSE: meta(
    'visual', 'high', false,
    ['Functional overlays such as dialogs, popovers, and navigation scrims within the declared cap.', 'A design contract raises `blur-cap` for a glass-based brand system.'],
    ['The page intentionally uses a glass material as its primary metaphor and declares it.'],
    ['Screenshot the affected surface; confirm content behind it is not used as decoration.'],
    ['source', 'computed-style']
  ),
  GLOW_SHADOW: meta(
    'visual', 'medium', false,
    ['Focus rings or semantic status glows that communicate state.', 'A single brand-colored shadow declared in the design system.'],
    ['The shadow is neutral or part of a documented elevation scale.'],
    ['Check that the neutral replacement preserves elevation hierarchy.']
  ),
  SPARKLE_ICON_OVERLOAD: meta(
    'visual', 'high', false,
    ['Sparkle is the product domain (for example a generation action that literally creates sparkles).', 'The icon is decorative inside an illustration, not attached to a generic action.'],
    ['The icon communicates a documented AI capability the product actually provides.'],
    ['Confirm the replacement icon names the action rather than inventing a metaphor.']
  ),
  LOW_CONTRAST_GRAY: meta(
    'accessibility', 'high', true,
    ['Large text at 3:1 or better is permitted.', 'Disabled controls are exempt under WCAG 1.4.3.', 'Text over an image or gradient cannot be resolved from classes alone.'],
    ['The foreground or background color cannot be resolved statically.'],
    ['Re-measure rendered contrast in the browser at the actual computed colors.'],
    ['source', 'standard'], [WCAG_CONTRAST]
  ),
  MADE_UP_AI_BADGE: meta(
    'content', 'medium', false,
    ['The product genuinely exposes an AI capability and the badge describes it accurately.'],
    ['The badge is part of a documented product name.'],
    ['Confirm the replacement copy describes a real action or state.']
  ),
  BOXED_CARD_SYNDROME: meta(
    'structure', 'medium', false,
    ['An intentional card-based dashboard or design system where cards carry distinct roles and data.', 'A responsive grid whose cards have varied internal composition.'],
    ['Cards are the documented product pattern and each card has a distinct heading or metric.'],
    ['Compare the layout before/after; do not remove grouping that aids scanning.'],
    ['source'], [NN_G_HEURISTICS]
  ),
  UNANCHORED_FLOATING_WINDOW: meta(
    'structure', 'medium', false,
    ['A deliberately floating dialog, command palette, or overlay.', 'A device mockup whose framing is the subject of the illustration.'],
    ['The frame is anchored to a stage edge or bleeds through at least one boundary.'],
    ['Screenshot the composition at the target viewport.']
  ),
  FLAT_SURFACE_MONOTONY: meta(
    'structure', 'medium', false,
    ['An intentionally flat editorial or brutalist system with typographic hierarchy.', 'Repeated rows in a data table that should remain uniform.'],
    ['Sibling surfaces perform genuinely different roles.'],
    ['Verify hierarchy through typography and spacing, not decoration alone.']
  ),
  WORD_BUDGET_EXCEEDED: {
    ...meta(
      'typography', 'medium', false,
      ['Dense operational screens, tables, and documentation where copy is the product.', 'A long-form editorial surface.'],
      ['The selected component type is not the surface actually being rendered.'],
      ['Read the rendered copy; auto-fix must not delete real instructions or data.'],
      ['source'], [NN_G_HEURISTICS]
    ),
    autoFixScope: 'Only replaces explicit lorem ipsum paragraphs when --budget-words is enabled; authored product copy is never truncated.'
  },
  UNEARNED_ANIMATION: meta(
    'motion', 'high', false,
    ['Loading spinners and progress indicators that communicate real progress.', 'Motion that is triggered by a user action and settles.'],
    ['The animation is the only way the product communicates an asynchronous state.'],
    ['Check `prefers-reduced-motion` and confirm a non-motion state cue exists.'],
    ['source'], ['https://developer.apple.com/design/human-interface-guidelines/motion']
  ),
  UNBOUNDED_INFINITE_MOTION: meta(
    'motion', 'high', false,
    ['Explicit loading spinners, progress indicators, or subtle ambient canvases gated by reduced motion.'],
    ['The infinite loop lives inside a verified spinner or user-paused playback widget.'],
    ['Replace `repeat: Infinity` or `loop: true` with a finite caused settle or add an explicit spinner/reduced-motion guard.'],
    ['source'], ['https://developer.apple.com/design/human-interface-guidelines/motion']
  ),
  REDUCED_MOTION_BLINDNESS: meta(
    'motion', 'high', true,
    ['Reduced-motion handling is centralized in a root `<MotionConfig reducedMotion="user">` provider outside this file.'],
    ['The file only wraps or exports static types without executing runtime animations or render loops.'],
    ['Verify `prefers-reduced-motion: reduce` disables or simplifies movement in the browser.'],
    ['source', 'standard'], ['https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html']
  ),
  LAYOUT_THRASH_ANIMATION: meta(
    'motion', 'medium', true,
    ['Accordion height reveals (`height: "auto"`) bounded by `overflow-hidden`.'],
    ['The animation is handled via CSS transforms (`x`, `y`, `scale`) and `opacity`.'],
    ['Inspect browser performance flamecharts and swap geometry properties for `transform` and `opacity`.'],
    ['source']
  ),
  UNMANAGED_WEBGL_OR_MEDIA_LOOP: meta(
    'motion', 'high', true,
    ['Cleanup or throttling is managed by a parent controller or custom hook outside this component.'],
    ['The file creates a one-shot static export rather than a mounted browser render loop.'],
    ['Confirm `.dispose()`/`.destroy()` runs on unmount and `<Canvas>` specifies `frameloop="demand"` or capped `dpr`.'],
    ['source']
  ),
  TRANSITION_ALL_SLOP: meta(
    'motion', 'high', false,
    ['A deliberate cross-property transition on a single known state swap (for example a theme toggle that must move color and border together).'],
    ['The element transitions exactly one named property through an explicit property list.'],
    ['Replace `transition-all` / `transition: all` with an explicit property list, then confirm hover, focus, and active states still animate.'],
    ['source'], ['https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion']
  ),
  SLOW_INTERACTION_MOTION: meta(
    'motion', 'medium', false,
    ['Storytelling or demo motion, which is allowed to run longer than product feedback.'],
    ['The element is a page-level surface (sheet, drawer, full-screen menu) where 300-400ms reads as lighter, not sluggish.'],
    ['Time the hover, press, and state change at normal speed; direct feedback should start immediately and settle inside ~300ms.'],
    ['source'], ['https://emilkowal.ski/ui/great-animations']
  ),
  SCROLL_REVEAL_SATURATION: meta(
    'motion', 'medium', false,
    ['A single deliberate reveal on the one section that earns it, with content rendered and readable before JavaScript runs.'],
    ['The page needs scroll-linked storytelling and states that in its design contract.'],
    ['Disable JavaScript and load with throttling: first-screen content must be present and legible; keep at most one scroll-reveal motif.'],
    ['source'], ['https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion']
  ),
  AUTOPLAY_MOTION_WITHOUT_CONTROL: meta(
    'motion', 'high', true,
    ['Decorative motion that runs under five seconds, or a loader that communicates real progress.'],
    ['The marquee or carousel pauses when hovered/focused and offers no motion under `prefers-reduced-motion: reduce`.'],
    ['Add a visible keyboard-operable pause control, or make the motion finite. Verify under WCAG 2.2.2 Pause, Stop, Hide.'],
    ['source', 'standard'], ['https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html']
  ),
  FLASHING_ANIMATION: meta(
    'motion', 'high', true,
    ['A single non-repeating flash used as a screenshot or shutter affordance.'],
    ['Nothing flashes more than three times in any one-second period.'],
    ['Remove the flash, or reduce it below three flashes per second; verify with a slow-motion capture.'],
    ['source', 'standard'], ['https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html']
  ),
  SCALE_FROM_ZERO: meta(
    'motion', 'medium', false,
    ['A spring gesture that legitimately collapses an object to zero while the finger holds it.'],
    ['The element is a loader or icon drawing, not an entering surface.'],
    ['Start the entrance at 0.9-0.96 scale instead of 0 and check the first frame reads as a shape, not a pop-in.'],
    ['source'], ['https://emilkowal.ski/ui/7-practical-animation-tips']
  ),
  CSS_LOOP_NO_REDUCED_GUARD: meta(
    'motion', 'medium', false,
    ['Reduced-motion handling lives in a global stylesheet or provider outside this file.'],
    ['The animation is a progress affordance that communicates real asynchronous state.'],
    ['Add `@media (prefers-reduced-motion: reduce)` (or `motion-safe:`) and confirm the loop stops or simplifies in the browser.'],
    ['source', 'standard'], ['https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html']
  ),
  VESTIBULAR_RISK_MOTION: meta(
    'motion', 'medium', false,
    ['Parallax confined to a small decorative accent that stops under reduced motion.'],
    ['The 3D tilt is a direct manipulation preview the user actively drags, not an ambient hover effect.'],
    ['Guard full-viewport parallax, tilt, and zoom with reduced motion and keep the moving area small; WCAG 2.3.3 Animation from Interactions applies.'],
    ['source', 'standard'], ['https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html']
  ),
  UNEARNED_HOVER_LIFT: meta(
    'motion', 'high', false,
    ['The lifted surface is itself the click target (`<a>`, `<button>`, or a row with a real handler).'],
    ['The lift communicates a draggable object during an active drag, not on idle hover.'],
    ['Remove hover lift from static surfaces; if the card is interactive, make the whole card the semantic control and keep the lift subtle.'],
    ['source'], ['https://emilkowal.ski/ui/great-animations']
  ),
  CENTER_ALIGNED_EVERYTHING: meta(
    'layout', 'medium', false,
    ['A centered hero or campaign page with deliberately limited content.', 'Centered empty states and dialogs.'],
    ['Centered text is a minority of layout elements and leading-edge anchors exist.'],
    ['Review the rendered page; centered composition may be the intended art direction.'],
    ['source'], [APPLE_HIG]
  ),
  FABRICATED_SOCIAL_PROOF: meta(
    'content', 'medium', false,
    ['Metrics with a verifiable source, date, and scope.', 'Testimonials with attributable names and permission.'],
    ['The number is a real product limit or documented benchmark.'],
    ['Ask for the source of any metric before replacing it; never invent a number.'],
    ['source'], [NN_G_HEURISTICS]
  ),
  STATUS_DOT_SLOP: meta(
    'content', 'medium', false,
    ['The dot is bound to a real health endpoint, status URL, or query result.', 'A demo fixture explicitly labels itself as sample data.'],
    ['No live-status claim is made in the surrounding copy.'],
    ['Verify the binding in the DOM/runtime, not only the class names.'],
    ['source', 'interaction']
  ),
  AI_COPY_CLICHE: meta(
    'content', 'medium', false,
    ['The phrase is literal domain terminology (for example "supercharge" in an energy product).'],
    ['The copy is quoted from a real customer or source.'],
    ['Confirm the replacement states the concrete capability.'],
    ['source']
  ),
  NEGATIVE_PARALLELISM: meta(
    'content', 'high', false,
    ['A genuine before/after comparison or migration description.'],
    ["The contrast is the product's actual value proposition and names both states."],
    ['Read the rewritten sentence; it must stay truthful.'],
    ['source']
  ),
  AI_PROSE_FILLER: meta(
    'content', 'low', false,
    ['Em dashes used intentionally and sparingly in editorial prose.', 'A real range between two documented values.'],
    ['The copy is legal, medical, or quoted text where punctuation is deliberate.'],
    ['Human review; these are style signals, not defects.'],
    ['source']
  ),
  CHATBOT_SIGN_OFF_SLOP: meta(
    'content', 'high', false,
    ['The product is a chat interface and the text is part of the conversation.'],
    ['The copy is a quoted assistant response inside a demo.'],
    ['Confirm the surrounding UI is product copy, not chat content.'],
    ['source']
  ),
  LOREM_IPSUM_SLOP: meta(
    'content', 'high', true,
    ['The page is a documented specimen or design-system demo page.'],
    ['The placeholder is explicitly labelled as sample content.'],
    ['Replace with domain nouns or an explicit placeholder state.'],
    ['source']
  ),
  DEAD_PLACEHOLDER_SLOP: meta(
    'interaction', 'high', true,
    ['The handler is attached through a component wrapper, delegated listener, or router link not visible in this file.', 'A `href="#"` link is intercepted by a documented client router.'],
    ['The element is a non-interactive decorative anchor in a design specimen.'],
    ['Verify focus, activation, and navigation in the browser before removing anything.'],
    ['source'], [NN_G_HEURISTICS]
  ),
  SCROLL_HIJACKING: meta(
    'interaction', 'high', true,
    ['A contained canvas, map, or carousel legitimately uses wheel events while preserving page scroll.'],
    ['The page is a full-screen experience that explicitly opts into scroll capture.'],
    ['Check keyboard and trackpad scrolling at multiple viewports.'],
    ['source'], [WCAG_KEYBOARD]
  ),
  FAKE_CONTROL_SLOP: meta(
    'accessibility', 'high', true,
    ['The element receives role, tabIndex, and keyboard handling through spread props or a wrapper.'],
    ['The clickable element is a documented third-party primitive.'],
    ['Verify accessible name, role, focus, and keyboard activation in the DOM.'],
    ['source', 'standard'], [WCAG_NAME_ROLE, WCAG_KEYBOARD]
  ),
  EMOJI_ICON_SLOP: meta(
    'visual', 'high', false,
    ['Emoji is actual content (chat message, user-generated text).'],
    ['Emoji appears in a code sample or documentation string.'],
    ['Replace only UI chrome; leave user content untouched.'],
    ['source']
  ),
  Z_INDEX_CHAOS: meta(
    'tokens', 'high', true,
    ['A third-party overlay or portal sets an extreme z-index internally.'],
    ['The value is generated by a library rather than authored here.'],
    ['Inspect the stacking context in the browser.'],
    ['source']
  ),
  DESIGN_TOKEN_DRIFT: meta(
    'tokens', 'high', true,
    ['No palette is declared in DESIGN.md, so there is nothing to enforce.', 'The color is computed at runtime from user data or a chart scale.'],
    ['The DESIGN.md palette is absent or does not lock colors.'],
    ['Confirm the replacement token exists and preserves contrast.'],
    ['source', 'computed-style']
  ),
  AI_NARRATION_COMMENT_SLOP: {
    ...meta(
      'code', 'medium', false,
      ['The comment explains why an invariant exists, an edge case, or a tradeoff.'],
      ['The file is generated code where comments are part of the output contract.'],
      ['Read the diff; never remove comments that carry non-obvious intent.'],
      ['source']
    ),
    autoFixScope: 'Only removes comments classified as narration by the heuristic; comments explaining intent are retained.'
  },
  STERILE_SURFACE_SLOP: meta(
    'visual', 'low', false,
    ['Intentional minimalism, brutalism, or editorial restraint with deliberate typography.'],
    ['The surface is a utility screen where decoration would harm scanning.'],
    ['Human review only; do not auto-fix art direction.'],
    ['human-review']
  ),
  CHAINED_TYPE_ASSERTION: meta(
    'code', 'high', true,
    ['The assertion is isolated in a documented adapter whose runtime validator is tested.'],
    ['The value genuinely has an unknown boundary and is validated immediately.'],
    ['Run `tsc` and the relevant runtime test.'],
    ['source']
  ),
  UNVALIDATED_DYNAMIC_RETURN: meta(
    'code', 'medium', false,
    ['The function is a generic utility with a documented caller-side validator.'],
    ['The return type is intentionally unknown at a plugin boundary.'],
    ['Trace the value to its validator or add one.'],
    ['source']
  ),
  BROAD_RECORD_SLOP: meta(
    'code', 'high', false,
    ['The dictionary is a short-lived boundary object validated by a schema.'],
    ['The keys are genuinely unbounded and documented as such.'],
    ['Run `tsc`; prefer explicit keys or a bounded union.'],
    ['source']
  ),
  EMPTY_OBJECT_SPREAD: meta(
    'code', 'medium', false,
    ['The conditional spread expresses a deliberate optional-prop merge.'],
    ['The surrounding object is itself dynamic.'],
    ['Check that both branches produce a valid typed shape.'],
    ['source']
  ),
  NON_NULL_ASSERTION_SLOP: meta(
    'code', 'high', true,
    ['The invariant is established immediately above and covered by a test.'],
    ['The value is guaranteed by an external contract with a runtime guard.'],
    ['Run the failure-path test; prefer optional chaining plus a guard.'],
    ['source']
  )
};

export const RULE_FAMILIES: RuleFamily[] = [
  'visual', 'structure', 'layout', 'typography', 'motion', 'content', 'interaction', 'accessibility', 'tokens', 'code'
];

export function tierIsObjective(tier: RuleTier): boolean {
  return tier === 'floor';
}
