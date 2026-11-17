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
  | 'FLAT_SURFACE_MONOTONY';

export interface SlopViolation {
  id: string;
  type: SlopViolationType;
  severity: SlopSeverity;
  message: string;
  line?: number;
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
  };
  summary: string;
  remediationPlan: string[];
}

export interface AuditOptions {
  strict?: boolean;
  filepath?: string;
  componentType?: 'illustration' | 'feature-card' | 'hero' | 'application' | 'bento';
}
