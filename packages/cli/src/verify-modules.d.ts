declare module '@sloppy/verify' {
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

declare module '@sloppy/verify/multi-width' {
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
