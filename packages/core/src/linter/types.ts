export type SlopSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RuleTier = 'floor' | 'reflex' | 'finish';

export type SlopViolationType =
  | 'PURPLE_GRADIENT_SLOP'
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
  | 'FABRICATED_SOCIAL_PROOF'
  | 'CHATBOT_SIGN_OFF_SLOP'
  | 'FAKE_CONTROL_SLOP'
  | 'LOREM_IPSUM_SLOP'
  | 'EMOJI_ICON_SLOP'
  | 'Z_INDEX_CHAOS'
  | 'SCROLL_HIJACKING'
  | 'AI_NARRATION_COMMENT_SLOP'
  | 'STERILE_SURFACE_SLOP';

export const CANONICAL_RULES: Record<SlopViolationType, { ruleId: string; title: string; defaultSeverity: SlopSeverity; tier: RuleTier }> = {
  HERO_GRADIENT_TEXT: { ruleId: 'VIS-01', title: 'Hero Gradient Text', defaultSeverity: 'high', tier: 'reflex' },
  PURPLE_GRADIENT_SLOP: { ruleId: 'VIS-02', title: 'Purple/Indigo Gradient Palette', defaultSeverity: 'critical', tier: 'reflex' },
  SPARKLE_ICON_OVERLOAD: { ruleId: 'VIS-03', title: 'Sparkle Icon Overload', defaultSeverity: 'high', tier: 'reflex' },
  LOW_CONTRAST_GRAY: { ruleId: 'VIS-08', title: 'Low Contrast Gray Text', defaultSeverity: 'high', tier: 'floor' },
  MADE_UP_AI_BADGE: { ruleId: 'VIS-09', title: 'Fabricated AI Badge', defaultSeverity: 'medium', tier: 'reflex' },
  BOXED_CARD_SYNDROME: { ruleId: 'STR-01', title: 'Boxed Card Monotony', defaultSeverity: 'medium', tier: 'reflex' },
  UNANCHORED_FLOATING_WINDOW: { ruleId: 'STR-02', title: 'Unanchored Floating Window', defaultSeverity: 'high', tier: 'reflex' },
  FLAT_SURFACE_MONOTONY: { ruleId: 'STR-03', title: 'Flat Surface Monotony', defaultSeverity: 'medium', tier: 'reflex' },
  WORD_BUDGET_EXCEEDED: { ruleId: 'TYP-08', title: 'Word Budget Exceeded', defaultSeverity: 'high', tier: 'reflex' },
  UNEARNED_ANIMATION: { ruleId: 'MOT-01', title: 'Unearned Looping Animation', defaultSeverity: 'high', tier: 'reflex' },
  CENTER_ALIGNED_EVERYTHING: { ruleId: 'LAY-01', title: 'Center-Aligned Monotony', defaultSeverity: 'medium', tier: 'reflex' },
  FABRICATED_SOCIAL_PROOF: { ruleId: 'CPY-01', title: 'Fabricated Social Proof Metrics', defaultSeverity: 'high', tier: 'floor' },
  AI_COPY_CLICHE: { ruleId: 'CPY-03', title: 'Generic Marketing Clichés', defaultSeverity: 'medium', tier: 'reflex' },
  NEGATIVE_PARALLELISM: { ruleId: 'CPY-04', title: 'Negative Parallelism Cliché', defaultSeverity: 'medium', tier: 'reflex' },
  CHATBOT_SIGN_OFF_SLOP: { ruleId: 'CPY-06', title: 'Chatbot Conversational Artifacts', defaultSeverity: 'medium', tier: 'reflex' },
  LOREM_IPSUM_SLOP: { ruleId: 'CPY-07', title: 'Placeholder & Lorem Ipsum Copy', defaultSeverity: 'high', tier: 'floor' },
  DEAD_PLACEHOLDER_SLOP: { ruleId: 'UX-02', title: 'Dead Placeholder Handlers', defaultSeverity: 'medium', tier: 'floor' },
  SCROLL_HIJACKING: { ruleId: 'UX-05', title: 'Scroll Hijacking & Wheel Interference', defaultSeverity: 'high', tier: 'floor' },
  FAKE_CONTROL_SLOP: { ruleId: 'AX-01', title: 'Inaccessible Fake Control', defaultSeverity: 'high', tier: 'floor' },
  EMOJI_ICON_SLOP: { ruleId: 'MED-01', title: 'Raw Emojis as UI Icons', defaultSeverity: 'medium', tier: 'reflex' },
  Z_INDEX_CHAOS: { ruleId: 'TOK-01', title: 'Arbitrary Z-Index Escalation', defaultSeverity: 'medium', tier: 'floor' },
  AI_NARRATION_COMMENT_SLOP: { ruleId: 'COD-01', title: 'AI Narration Comment Slop', defaultSeverity: 'low', tier: 'finish' },
  STERILE_SURFACE_SLOP: { ruleId: 'LIV-01', title: 'Sterile Surface & Missing Liveliness', defaultSeverity: 'low', tier: 'finish' }
};

export const RULE_ALIASES: Record<string, SlopViolationType> = {
  'VIS-01': 'HERO_GRADIENT_TEXT',
  'HERO_GRADIENT_TEXT': 'HERO_GRADIENT_TEXT',
  'VIS-02': 'PURPLE_GRADIENT_SLOP',
  'PURPLE_GRADIENT_SLOP': 'PURPLE_GRADIENT_SLOP',
  'VIS-03': 'SPARKLE_ICON_OVERLOAD',
  'SPARKLE_ICON_OVERLOAD': 'SPARKLE_ICON_OVERLOAD',
  'STR-01': 'BOXED_CARD_SYNDROME',
  'BOXED_CARD_SYNDROME': 'BOXED_CARD_SYNDROME',
  'STR-02': 'UNANCHORED_FLOATING_WINDOW',
  'UNANCHORED_FLOATING_WINDOW': 'UNANCHORED_FLOATING_WINDOW',
  'MOT-01': 'UNEARNED_ANIMATION',
  'UNEARNED_ANIMATION': 'UNEARNED_ANIMATION',
  'LAY-01': 'CENTER_ALIGNED_EVERYTHING',
  'CENTER_ALIGNED_EVERYTHING': 'CENTER_ALIGNED_EVERYTHING',
  'CPY-01': 'FABRICATED_SOCIAL_PROOF',
  'FABRICATED_SOCIAL_PROOF': 'FABRICATED_SOCIAL_PROOF',
  'CPY-04': 'NEGATIVE_PARALLELISM',
  'NEGATIVE_PARALLELISM': 'NEGATIVE_PARALLELISM',
  'CPY-06': 'CHATBOT_SIGN_OFF_SLOP',
  'CHATBOT_SIGN_OFF_SLOP': 'CHATBOT_SIGN_OFF_SLOP',
  'CPY-07': 'LOREM_IPSUM_SLOP',
  'LOREM_IPSUM_SLOP': 'LOREM_IPSUM_SLOP',
  'AX-01': 'FAKE_CONTROL_SLOP',
  'FAKE_CONTROL_SLOP': 'FAKE_CONTROL_SLOP',
  'CPY-03': 'AI_COPY_CLICHE',
  'AI_COPY_CLICHE': 'AI_COPY_CLICHE',
  'UX-02': 'DEAD_PLACEHOLDER_SLOP',
  'DEAD_PLACEHOLDER_SLOP': 'DEAD_PLACEHOLDER_SLOP',
  'UX-05': 'SCROLL_HIJACKING',
  'SCROLL_HIJACKING': 'SCROLL_HIJACKING',
  'VIS-08': 'LOW_CONTRAST_GRAY',
  'LOW_CONTRAST_GRAY': 'LOW_CONTRAST_GRAY',
  'STR-03': 'FLAT_SURFACE_MONOTONY',
  'FLAT_SURFACE_MONOTONY': 'FLAT_SURFACE_MONOTONY',
  'TYP-08': 'WORD_BUDGET_EXCEEDED',
  'WORD_BUDGET_EXCEEDED': 'WORD_BUDGET_EXCEEDED',
  'VIS-09': 'MADE_UP_AI_BADGE',
  'MADE_UP_AI_BADGE': 'MADE_UP_AI_BADGE',
  'MED-01': 'EMOJI_ICON_SLOP',
  'MED-01_EMOJI_ICON_SLOP': 'EMOJI_ICON_SLOP',
  'TOK-01': 'Z_INDEX_CHAOS',
  'Z_INDEX_CHAOS': 'Z_INDEX_CHAOS',
  'COD-01': 'AI_NARRATION_COMMENT_SLOP',
  'AI_NARRATION_COMMENT_SLOP': 'AI_NARRATION_COMMENT_SLOP',
  'LIV-01': 'STERILE_SURFACE_SLOP',
  'STERILE_SURFACE_SLOP': 'STERILE_SURFACE_SLOP'
};

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
    estimatedWordCount: number;
    byRule?: Partial<Record<SlopViolationType, number>>;
    suppressedCount?: number;
  };
  summary: string;
  remediationPlan: string[];
  reportPath?: string;
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
  floorOnly?: boolean;
  tier?: RuleTier;
  mode?: 'during' | 'after';
  report?: boolean;
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
