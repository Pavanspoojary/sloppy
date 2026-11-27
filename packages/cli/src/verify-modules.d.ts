declare module '@sloppy-ai/verify' {
  export interface VerifyViolation {
    rule: string;
    message: string;
    evidence?: string;
  }
  export interface VerifyResult {
    ok: boolean;
    mode: 'static' | 'browser';
    target: string;
    violations: VerifyViolation[];
    unavailable?: string;
  }
  export function verifyTarget(target: string, options?: { timeoutMs?: number }): Promise<VerifyResult>;
  export function calculateContrastRatio(a: string, b: string): number;
  export function parseRgba(value: string): number[];
  const verifyTargetDefault: typeof verifyTarget;
  export default verifyTargetDefault;
}

declare module '@sloppy-ai/verify/multi-width' {
  export interface MultiWidthFinding {
    width: number;
    viewportName: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }
  export interface MultiWidthResult {
    target: string;
    isStaticFallback: boolean;
    totalViewportsTested: number;
    viewportsPassed: number;
    allPassed: boolean;
    findings: MultiWidthFinding[];
    summary: string;
  }
  export function runMultiWidthVerification(target: string, options?: { staticOnly?: boolean }): Promise<MultiWidthResult>;
}

declare module '@sloppy-ai/verify/accessibility' {
  export interface A11yEvidence {
    kind: string;
    description: string;
    selector?: string;
    viewport?: { width: number; height: number };
    criterion?: string;
  }
  export interface A11yFinding {
    rule: string;
    message: string;
    severity: string;
    confidence: string;
    objective: boolean;
    evidence: A11yEvidence;
  }
  export interface AuditA11yOptions {
    timeoutMs?: number;
    viewport?: { width: number; height: number };
  }
  export function auditA11ySnapshot(snapshot: unknown[], options?: AuditA11yOptions): A11yFinding[];
  export function runAccessibilityAudit(target: string, options?: AuditA11yOptions): Promise<{
    target: string;
    ok: boolean;
    mode: string;
    isStaticFallback: boolean;
    findings: A11yFinding[];
    summary: string;
    unavailable?: string;
    checked?: string[];
  }>;
}

declare module '@sloppy-ai/verify/motion-interactions' {
  export interface MotionInteractionFinding {
    rule: string;
    message: string;
    severity: string;
    confidence: string;
    objective: boolean;
    evidence: {
      kind: string;
      description: string;
      selector?: string;
      viewport?: { width: number; height: number };
      criterion?: string;
    };
  }
  export interface MotionInteractionSpec {
    interactions: Array<{
      name?: string;
      trigger: string;
      target: string;
      anchor?: string;
      closeTrigger?: string;
      kind?: 'click' | 'hover';
      waitMs?: number;
    }>;
  }
  export interface MotionInteractionResult {
    target: string;
    ok: boolean;
    mode: 'browser' | 'unavailable';
    findings: MotionInteractionFinding[];
    checked: string[];
    summary: string;
    unavailable?: string;
  }
  export function auditMotionInteractionSamples(samples: unknown[], options?: { viewport?: { width: number; height: number } }): MotionInteractionFinding[];
  export function runMotionInteractionAudit(target: string, options?: { spec?: MotionInteractionSpec; timeoutMs?: number; width?: number; height?: number }): Promise<MotionInteractionResult>;
}

declare module '@sloppy/verify' {
  export * from '@sloppy-ai/verify';
  const verifyTargetDefault: typeof import('@sloppy-ai/verify').verifyTarget;
  export default verifyTargetDefault;
}

declare module '@sloppy/verify/multi-width' {
  export * from '@sloppy-ai/verify/multi-width';
}

declare module '@sloppy/verify/accessibility' {
  export * from '@sloppy-ai/verify/accessibility';
}

declare module '@sloppy/verify/motion-interactions' {
  export * from '@sloppy-ai/verify/motion-interactions';
}
