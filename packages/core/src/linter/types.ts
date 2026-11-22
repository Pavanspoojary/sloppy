export type SlopSeverity = 'critical' | 'high' | 'medium' | 'low';

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
  | 'FAKE_CONTROL_SLOP';

export interface SlopViolation {
  id: string;
  type: SlopViolationType;
  severity: SlopSeverity;
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
  recommendation: string;
}

export interface AuditResult {
  filepath?: string;
  slopScore: number; // 0 (pristine craft) to 100 (pure slop)
  isSlopFree: boolean;
  violations: SlopViolation[];
  stats: {
    totalViolations: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    estimatedWordCount: number;
    byRule?: Partial<Record<SlopViolationType, number>>;
    suppressedCount?: number;
  };
  summary: string;
  remediationPlan: string[];
}

export type RuleSeverity = 'off' | 'warn' | 'error';

export interface SloppyConfig {
  strict?: boolean;
  failOn?: SlopSeverity;
  brand?: {
    name?: string;
    allowColors?: string[];
    allowGradients?: boolean;
  };
  rules?: Partial<Record<SlopViolationType, RuleSeverity>>;
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
}

export interface TransformOptions {
  look?: 'linear' | 'minimal' | 'dark-hero' | 'raycast' | 'radix' | 'blueprint' | 'glass';
  budgetWords?: boolean;
  filepath?: string;
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
