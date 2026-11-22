import { auditCode } from './index.js';
import { transformSlopToCraft } from './transform.js';
import { unifiedDiff } from './diff.js';
import { validateSyntax, SyntaxErrorItem } from './syntax.js';
import { SlopViolation, TransformationItem } from './types.js';

export type RepairConfidence = 'high' | 'medium' | 'low';
export type RepairRisk = 'none' | 'low' | 'medium' | 'high';
export interface PlannedPatch {
  id: string; ruleId: string; title: string; confidence: RepairConfidence; risk: RepairRisk; autoApplicable: boolean;
  originalSnippet: string; replacementSnippet: string; rationale: string; line?: number;
  astNodeType?: 'JSXElement' | 'JSXAttribute' | 'JSXText' | 'StyleRule';
}
export interface RepairPlan {
  filepath?: string; initialScore: number; projectedScore: number; scoreImprovement: number; patches: PlannedPatch[];
  safePatchesCount: number; manualReviewCount: number; repairedCode: string; isValidSyntax: boolean;
  unifiedDiff: string; syntaxErrors: SyntaxErrorItem[];
}

// Automatic patches mirror a transformation exactly. Manual patches carry the
// concrete remediation text so a reviewer always has something to act on.
function autoPatch(transformation: TransformationItem, idx: number, line?: number): PlannedPatch {
  return {
    id: `patch-${idx + 1}`, ruleId: transformation.type, title: transformation.explanation,
    confidence: 'high', risk: transformation.type === 'SPARKLE_ICON_OVERLOAD' ? 'low' : 'none', autoApplicable: true,
    originalSnippet: transformation.original, replacementSnippet: transformation.replacement,
    rationale: transformation.explanation, line
  };
}

function manualPatch(violation: SlopViolation, idx: number): PlannedPatch {
  const contextual = violation.type === 'WORD_BUDGET_EXCEEDED' || violation.type === 'UNANCHORED_FLOATING_WINDOW';
  return {
    id: `patch-${idx + 1}`, ruleId: violation.type, title: violation.message,
    confidence: 'medium', risk: contextual ? 'medium' : 'low', autoApplicable: false,
    originalSnippet: violation.snippet || violation.message, replacementSnippet: violation.recommendation,
    rationale: contextual
      ? 'Requires contextual review before replacing copy or changing viewport framing.'
      : violation.recommendation,
    line: violation.line
  };
}

export function createRepairPlan(code: string, options: { filepath?: string; strict?: boolean; look?: string } = {}): RepairPlan {
  const initial = auditCode(code, { strict: options.strict, filepath: options.filepath });
  const transformed = transformSlopToCraft(code, { look: (options.look as any) || 'linear', filepath: options.filepath });
  const repairedCode = transformed.isValidSyntax ? transformed.transformedCode : code;
  const consumed = new Set<number>();
  const patches: PlannedPatch[] = [];

  for (const violation of initial.violations) {
    const match = transformed.transformations.findIndex((item, index) => !consumed.has(index) && item.type === violation.type);
    if (match >= 0) {
      consumed.add(match);
      patches.push(autoPatch(transformed.transformations[match], patches.length, violation.line));
    } else {
      patches.push(manualPatch(violation, patches.length));
    }
  }
  transformed.transformations.forEach((item, index) => {
    if (!consumed.has(index)) patches.push(autoPatch(item, patches.length));
  });

  const projected = auditCode(repairedCode, { strict: options.strict, filepath: options.filepath }).slopScore;
  const projectedScore = Math.min(initial.slopScore, projected);
  const syntax = validateSyntax(repairedCode);
  const isValidSyntax = transformed.isValidSyntax && syntax.valid;

  return {
    filepath: options.filepath, initialScore: initial.slopScore, projectedScore,
    scoreImprovement: Math.max(0, initial.slopScore - projectedScore), patches,
    safePatchesCount: patches.filter(p => p.autoApplicable).length,
    manualReviewCount: patches.filter(p => !p.autoApplicable).length,
    repairedCode, isValidSyntax,
    unifiedDiff: unifiedDiff(code, repairedCode, options.filepath || 'file.tsx'),
    syntaxErrors: isValidSyntax ? [] : (transformed.syntaxErrors.length ? transformed.syntaxErrors : syntax.errors)
  };
}
