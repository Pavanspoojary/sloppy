import type { EvidenceKind, FindingConfidence } from './rule-metadata.js';

import type { DesignContract } from './design-contract.js';

export type SlopSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RuleTier = 'floor' | 'reflex' | 'finish';

export type SlopViolationType =
  | 'PURPLE_GRADIENT_SLOP'
  | 'EMERALD_MONOCULTURE'
  | 'BLUR_OVERUSE'
  | 'GLOW_SHADOW'
  | 'SPARKLE_ICON_OVERLOAD'
  | 'BOXED_CARD_SYNDROME'
  | 'UNANCHORED_FLOATING_WINDOW'
  | 'WORD_BUDGET_EXCEEDED'
  | 'UNEARNED_ANIMATION'
  | 'CENTER_ALIGNED_EVERYTHING'
  | 'MADE_UP_AI_BADGE'
  | 'LOW_CONTRAST_GRAY'
  | 'FLAT_SURFACE_MONOTONY'
  | 'AI_COPY_CLICHE'
  | 'DEAD_PLACEHOLDER_SLOP'
  | 'HERO_GRADIENT_TEXT'
  | 'NEGATIVE_PARALLELISM'
  | 'STATUS_DOT_SLOP'
  | 'AI_PROSE_FILLER'
  | 'FABRICATED_SOCIAL_PROOF'
  | 'CHATBOT_SIGN_OFF_SLOP'
  | 'FAKE_CONTROL_SLOP'
  | 'LOREM_IPSUM_SLOP'
  | 'EMOJI_ICON_SLOP'
  | 'Z_INDEX_CHAOS'
  | 'DESIGN_TOKEN_DRIFT'
  | 'SCROLL_HIJACKING'
  | 'AI_NARRATION_COMMENT_SLOP'
  | 'STERILE_SURFACE_SLOP'
  | 'CHAINED_TYPE_ASSERTION'
  | 'UNVALIDATED_DYNAMIC_RETURN'
  | 'BROAD_RECORD_SLOP'
  | 'EMPTY_OBJECT_SPREAD'
  | 'NON_NULL_ASSERTION_SLOP'
  | 'UNBOUNDED_INFINITE_MOTION'
  | 'REDUCED_MOTION_BLINDNESS'
  | 'LAYOUT_THRASH_ANIMATION'
  | 'UNMANAGED_WEBGL_OR_MEDIA_LOOP'
  | 'TRANSITION_ALL_SLOP'
  | 'SLOW_INTERACTION_MOTION'
  | 'SCROLL_REVEAL_SATURATION'
  | 'AUTOPLAY_MOTION_WITHOUT_CONTROL'
  | 'FLASHING_ANIMATION'
  | 'SCALE_FROM_ZERO'
  | 'CSS_LOOP_NO_REDUCED_GUARD'
  | 'VESTIBULAR_RISK_MOTION'
  | 'UNEARNED_HOVER_LIFT'
  | 'UNIFORM_ENTRANCE_MOTION'
  | 'ELASTIC_UI_EASING'
  | 'WILL_CHANGE_LEAK'
  | 'OFF_CONTRACT_MOTION';

export type RuleMode = 'auto-fix' | 'detect-only';

export interface FindingEvidence {
  kind: EvidenceKind;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  selector?: string;
  viewport?: { width: number; height: number };
  criterion?: string;
}

export interface CanonicalRule {
  ruleId: string;
  title: string;
  defaultSeverity: SlopSeverity;
  tier: RuleTier;
  mode: RuleMode;
}

// This table is the single source of truth for rule IDs. docs/RULES.md, the
// README table, and the catalog table are generated from it by
// scripts/sync-rules.mjs, so a rule can never carry two different IDs.
export const CANONICAL_RULES: Record<SlopViolationType, CanonicalRule> = {
  HERO_GRADIENT_TEXT: { ruleId: 'VIS-01', title: 'Hero Gradient Text', defaultSeverity: 'high', tier: 'reflex', mode: 'detect-only' },
  PURPLE_GRADIENT_SLOP: { ruleId: 'VIS-02', title: 'Purple/Indigo Gradient Palette', defaultSeverity: 'critical', tier: 'reflex', mode: 'auto-fix' },
  EMERALD_MONOCULTURE: { ruleId: 'VIS-03', title: 'Gen-2 Emerald Dark-Mode Monoculture', defaultSeverity: 'high', tier: 'reflex', mode: 'detect-only' },
  BLUR_OVERUSE: { ruleId: 'VIS-06', title: 'Glassmorphism Blur Overuse', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  GLOW_SHADOW: { ruleId: 'VIS-07', title: 'Colored Glow Shadows', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  SPARKLE_ICON_OVERLOAD: { ruleId: 'MED-02', title: 'Sparkle / Magic-Wand Icon Overload', defaultSeverity: 'high', tier: 'reflex', mode: 'auto-fix' },
  LOW_CONTRAST_GRAY: { ruleId: 'VIS-08', title: 'Low Contrast Gray Text', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  MADE_UP_AI_BADGE: { ruleId: 'VIS-09', title: 'Fabricated AI Badge', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  BOXED_CARD_SYNDROME: { ruleId: 'STR-01', title: 'Boxed Card Monotony', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  UNANCHORED_FLOATING_WINDOW: { ruleId: 'STR-02', title: 'Unanchored Floating Window', defaultSeverity: 'high', tier: 'reflex', mode: 'detect-only' },
  FLAT_SURFACE_MONOTONY: { ruleId: 'STR-03', title: 'Flat Surface Monotony', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  WORD_BUDGET_EXCEEDED: { ruleId: 'TYP-08', title: 'Word Budget Exceeded', defaultSeverity: 'high', tier: 'reflex', mode: 'auto-fix' },
  UNEARNED_ANIMATION: { ruleId: 'MOT-01', title: 'Unearned Looping Animation', defaultSeverity: 'high', tier: 'reflex', mode: 'auto-fix' },
  UNBOUNDED_INFINITE_MOTION: { ruleId: 'MOT-02', title: 'Unbounded Infinite Programmatic Motion', defaultSeverity: 'high', tier: 'reflex', mode: 'detect-only' },
  REDUCED_MOTION_BLINDNESS: { ruleId: 'MOT-03', title: 'Missing Reduced-Motion Guard', defaultSeverity: 'medium', tier: 'floor', mode: 'detect-only' },
  LAYOUT_THRASH_ANIMATION: { ruleId: 'MOT-04', title: 'Layout-Thrashing Property Animation', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  UNMANAGED_WEBGL_OR_MEDIA_LOOP: { ruleId: 'MOT-05', title: 'Unmanaged WebGL, Lottie, or Scroll Loop', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  TRANSITION_ALL_SLOP: { ruleId: 'MOT-06', title: 'Cross-Property Transition Slop (transition: all)', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  SLOW_INTERACTION_MOTION: { ruleId: 'MOT-07', title: 'Slow Interaction Feedback', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  SCROLL_REVEAL_SATURATION: { ruleId: 'MOT-08', title: 'Scroll-Reveal Saturation', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  AUTOPLAY_MOTION_WITHOUT_CONTROL: { ruleId: 'MOT-09', title: 'Autoplay Motion Without Pause Control', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  FLASHING_ANIMATION: { ruleId: 'MOT-10', title: 'Flashing or Strobe Animation', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  SCALE_FROM_ZERO: { ruleId: 'MOT-11', title: 'Entrance From scale(0)', defaultSeverity: 'low', tier: 'reflex', mode: 'detect-only' },
  CSS_LOOP_NO_REDUCED_GUARD: { ruleId: 'MOT-12', title: 'CSS Loop Without Reduced-Motion Guard', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  VESTIBULAR_RISK_MOTION: { ruleId: 'MOT-13', title: 'Vestibular-Risk Parallax or 3D Tilt', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  UNEARNED_HOVER_LIFT: { ruleId: 'MOT-14', title: 'Hover Motion on a Non-Interactive Surface', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  UNIFORM_ENTRANCE_MOTION: { ruleId: 'MOT-15', title: 'Uniform Entrance Motion', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  ELASTIC_UI_EASING: { ruleId: 'MOT-16', title: 'Overshoot/Elastic Easing on UI Motion', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  WILL_CHANGE_LEAK: { ruleId: 'MOT-17', title: 'Permanent will-change Layer Hint', defaultSeverity: 'low', tier: 'finish', mode: 'detect-only' },
  OFF_CONTRACT_MOTION: { ruleId: 'MOT-18', title: 'Off-Contract Motion Duration', defaultSeverity: 'low', tier: 'finish', mode: 'detect-only' },
  CENTER_ALIGNED_EVERYTHING: { ruleId: 'LAY-01', title: 'Center-Aligned Monotony', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  FABRICATED_SOCIAL_PROOF: { ruleId: 'CPY-01', title: 'Fabricated Social Proof Metrics', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  STATUS_DOT_SLOP: { ruleId: 'CPY-02', title: 'Unwired Pulsing Status Dots', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  AI_COPY_CLICHE: { ruleId: 'CPY-03', title: 'Generic Marketing Clichés', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  NEGATIVE_PARALLELISM: { ruleId: 'CPY-04', title: 'Negative Parallelism Cliché', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  AI_PROSE_FILLER: { ruleId: 'CPY-05', title: 'Em-Dash, Rule-of-Three & Filler Copy', defaultSeverity: 'medium', tier: 'finish', mode: 'detect-only' },
  CHATBOT_SIGN_OFF_SLOP: { ruleId: 'CPY-06', title: 'Chatbot Conversational Artifacts', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  LOREM_IPSUM_SLOP: { ruleId: 'CPY-07', title: 'Placeholder & Lorem Ipsum Copy', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  DEAD_PLACEHOLDER_SLOP: { ruleId: 'UX-02', title: 'Dead Placeholder Handlers', defaultSeverity: 'medium', tier: 'floor', mode: 'detect-only' },
  SCROLL_HIJACKING: { ruleId: 'UX-05', title: 'Scroll Hijacking & Wheel Interference', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  FAKE_CONTROL_SLOP: { ruleId: 'AX-01', title: 'Inaccessible Fake Control', defaultSeverity: 'high', tier: 'floor', mode: 'detect-only' },
  EMOJI_ICON_SLOP: { ruleId: 'MED-01', title: 'Raw Emojis as UI Icons', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  Z_INDEX_CHAOS: { ruleId: 'TOK-01', title: 'Arbitrary Z-Index Escalation', defaultSeverity: 'medium', tier: 'floor', mode: 'detect-only' },
  DESIGN_TOKEN_DRIFT: { ruleId: 'TOK-02', title: 'Off-Contract Design Token', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  AI_NARRATION_COMMENT_SLOP: { ruleId: 'COD-01', title: 'AI Narration Comment Slop', defaultSeverity: 'low', tier: 'finish', mode: 'auto-fix' },
  STERILE_SURFACE_SLOP: { ruleId: 'LIV-01', title: 'Sterile Surface & Missing Liveliness', defaultSeverity: 'low', tier: 'finish', mode: 'detect-only' },
  CHAINED_TYPE_ASSERTION: { ruleId: 'COD-02', title: 'Chained Type Assertion (as unknown as)', defaultSeverity: 'high', tier: 'reflex', mode: 'detect-only' },
  UNVALIDATED_DYNAMIC_RETURN: { ruleId: 'COD-03', title: 'Unvalidated Contract Return (any/unknown)', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  BROAD_RECORD_SLOP: { ruleId: 'COD-04', title: 'Broad Dictionary Type (Record<string, any>)', defaultSeverity: 'medium', tier: 'reflex', mode: 'detect-only' },
  EMPTY_OBJECT_SPREAD: { ruleId: 'COD-05', title: 'Conditional Empty Object Spread', defaultSeverity: 'low', tier: 'finish', mode: 'detect-only' },
  NON_NULL_ASSERTION_SLOP: { ruleId: 'COD-06', title: 'Unsafe Chained Non-Null Assertion (!.)', defaultSeverity: 'medium', tier: 'floor', mode: 'detect-only' }
};

// IDs and slugs are interchangeable everywhere. Derived from CANONICAL_RULES so
// an alias can never drift from the rule table.
export const RULE_ALIASES: Record<string, SlopViolationType> = Object.fromEntries(
  (Object.entries(CANONICAL_RULES) as Array<[SlopViolationType, CanonicalRule]>).flatMap(([type, rule]) => [
    [rule.ruleId, type] as [string, SlopViolationType],
    [type, type] as [string, SlopViolationType]
  ])
);
RULE_ALIASES['MED-01_EMOJI_ICON_SLOP'] = 'EMOJI_ICON_SLOP';

export const AUTO_FIX_RULE_TYPES: SlopViolationType[] = (Object.entries(CANONICAL_RULES) as Array<[SlopViolationType, CanonicalRule]>)
  .filter(([, rule]) => rule.mode === 'auto-fix')
  .map(([type]) => type);

export interface SlopViolation {
  id: string;
  ruleId: string;
  type: SlopViolationType;
  severity: SlopSeverity;
  tier: RuleTier;
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  recommendation: string;
  confidence: FindingConfidence;
  objective: boolean;
  evidence: FindingEvidence;
  context?: string;
  overruled?: boolean;
  overruleRationale?: string;
  index?: number; // Sequential finding index (1, 2, 3...) for approval-gated fixes
}

export interface AuditResult {
  filepath?: string;
  slopScore: number; // 0 (pristine craft) to 100 (pure slop)
  isSlopFree: boolean;
  passedFloor: boolean;
  passedReflex: boolean;
  violations: SlopViolation[];
  floorViolations: SlopViolation[];
  reflexViolations: SlopViolation[];
  finishViolations: SlopViolation[];
  objectiveViolations: SlopViolation[];
  craftViolations: SlopViolation[];
  overruledViolations: SlopViolation[];
  stats: {
    totalViolations: number;
    floorCount: number;
    reflexCount: number;
    finishCount: number;
    overruledCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    objectiveCount: number;
    craftCount: number;
    estimatedWordCount: number;
    byRule?: Partial<Record<SlopViolationType, number>>;
    byConfidence?: { high: number; medium: number; low: number };
    byEvidenceKind?: Partial<Record<EvidenceKind, number>>;
    suppressedCount?: number;
  };
  summary: string;
  remediationPlan: string[];
  reportPath?: string;
  designContract?: {
    found: boolean;
    path?: string;
    brandAccent?: string;
    blurCap?: number;
    lockedTokens: string[];
    motion?: {
      fast?: number;
      base?: number;
      slow?: number;
      maxFeedback?: number;
      easeEnter?: string;
      easeExit?: string;
      signature?: string;
    };
  };
}

export type RuleSeverity = 'off' | 'warn' | 'error';

export interface SloppyConfig {
  strict?: boolean;
  failOn?: SlopSeverity;
  brand?: {
    name?: string;
    allowColors?: string[];
    allowGradients?: boolean;
    fontSans?: string;
    fontMono?: string;
  };
  rules?: Partial<Record<string, RuleSeverity>>;
  design?: {
    contractPath?: string;
    brandAccent?: string;
    blurCap?: number;
    lockedTokens?: string[];
  };
  overrules?: Record<string, string>; // Rule -> written rationale for reflex overrides
  wordBudget?: {
    illustration?: number;
    'feature-card'?: number;
    hero?: number;
    application?: number;
    bento?: number;
    default?: number;
  };
  ignorePaths?: string[];
}

export interface AuditOptions {
  strict?: boolean;
  filepath?: string;
  componentType?: 'illustration' | 'feature-card' | 'hero' | 'application' | 'bento';
  config?: SloppyConfig;
  designContract?: DesignContract;
  floorOnly?: boolean;
  tier?: RuleTier;
  mode?: 'during' | 'after';
  report?: boolean;
  codeOnly?: boolean;
  compact?: boolean;
}

export interface TransformOptions {
  look?: 'linear' | 'minimal' | 'dark-hero' | 'raycast' | 'radix' | 'blueprint' | 'glass';
  budgetWords?: boolean;
  filepath?: string;
  kept?: boolean;
  only?: (number | string)[]; // Surgical list of violation indices (e.g. [1, 3, 5]) or rule IDs (e.g. ['VIS-02', 'COD-01'])
}

export interface TransformationItem {
  type: string;
  original: string;
  replacement: string;
  explanation: string;
}

export interface TransformResult {
  originalCode: string;
  transformedCode: string;
  changesApplied: number;
  transformations: TransformationItem[];
  preAudit: AuditResult;
  postAudit: AuditResult;
}
