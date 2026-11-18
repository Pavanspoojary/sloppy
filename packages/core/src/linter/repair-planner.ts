import { auditCode } from './index.js';
import { transformSlopToCraft } from './transform.js';
import { AuditResult, SlopViolation } from './types.js';

export type RepairConfidence = 'high' | 'medium' | 'low';
export type RepairRisk = 'none' | 'low' | 'medium' | 'high';

export interface PlannedPatch {
  id: string;
  ruleId: string;
  title: string;
  confidence: RepairConfidence;
  risk: RepairRisk;
  autoApplicable: boolean;
  originalSnippet: string;
  replacementSnippet: string;
  rationale: string;
  astNodeType?: 'JSXElement' | 'JSXAttribute' | 'JSXText' | 'StyleRule';
}

export interface RepairPlan {
  filepath?: string;
  initialScore: number;
  projectedScore: number;
  scoreImprovement: number;
  patches: PlannedPatch[];
  safePatchesCount: number;
  manualReviewCount: number;
  repairedCode: string;
  isValidSyntax: boolean;
}

export function createRepairPlan(code: string, options: { filepath?: string; strict?: boolean; look?: string } = {}): RepairPlan {
  const initialAudit = auditCode(code, { strict: options.strict, filepath: options.filepath });
  const patches: PlannedPatch[] = [];

  const transformResult = transformSlopToCraft(code, {
    look: (options.look as any) || 'linear',
    groundFraming: true
  });

  // Convert each detected violation into a planned patch with confidence & risk
  initialAudit.violations.forEach((v: SlopViolation, idx: number) => {
    let confidence: RepairConfidence = 'high';
    let risk: RepairRisk = 'none';
    let autoApplicable = true;
    let replacement = '';
    let rationale = v.recommendation;

    switch (v.type) {
      case 'PURPLE_GRADIENT_SLOP':
        confidence = 'high';
        risk = 'none';
        autoApplicable = true;
        replacement = 'bg-neutral-900/90 border border-neutral-800 text-neutral-100 backdrop-blur-sm';
        rationale = 'Replaces speculative neon purple gradient with restrained surface depth steps.';
        break;

      case 'SPARKLE_ICON_OVERLOAD':
        confidence = 'high';
        risk = 'low';
        autoApplicable = true;
        replacement = '<Zap className="w-4 h-4 text-neutral-400" />';
        rationale = 'Replaces magical sparkle trope with authentic functional icon.';
        break;

      case 'UNEARNED_ANIMATION':
        confidence = 'high';
        risk = 'none';
        autoApplicable = true;
        replacement = 'transition-all duration-200 ease-out hover:-translate-y-0.5';
        rationale = 'Replaces unearned bouncing keyframe with purposeful physical hover transition.';
        break;

      case 'MADE_UP_AI_BADGE':
        confidence = 'high';
        risk = 'low';
        autoApplicable = true;
        replacement = '<span className="text-[11px] font-mono text-neutral-400">Autonomous System</span>';
        rationale = 'Replaces cliché "Powered by AI" marketing badge with authentic system status.';
        break;

      case 'UNANCHORED_FLOATING_WINDOW':
        confidence = 'medium';
        risk = 'low';
        autoApplicable = true;
        replacement = 'w-full max-w-4xl mx-auto rounded-t-xl border-t border-x border-neutral-800 bg-neutral-950/90';
        rationale = 'Anchors floating ungrounded window to fill horizontal stage and bleed off bottom edge.';
        break;

      case 'WORD_BUDGET_EXCEEDED':
        confidence = 'medium';
        risk = 'medium';
        autoApplicable = false; // requires manual confirmation so real copy is not accidentally replaced
        replacement = '<div className="space-y-1.5 py-1"><div className="h-2 w-3/4 bg-neutral-800/80 rounded-full" /></div>';
        rationale = 'Text density exceeds word budget. Replace non-focal filler paragraphs with quiet placeholder bars.';
        break;

      default:
        confidence = 'low';
        risk = 'medium';
        autoApplicable = false;
        replacement = v.recommendation;
        break;
    }

    patches.push({
      id: `patch-${idx + 1}`,
      ruleId: v.type,
      title: v.message,
      confidence,
      risk,
      autoApplicable,
      originalSnippet: v.snippet || '',
      replacementSnippet: replacement,
      rationale
    });
  });

  const projectedScore = transformResult.postAudit.slopScore;
  const scoreImprovement = Math.max(0, initialAudit.slopScore - projectedScore);

  // Syntax sanity check (ensure no broken JSX tags or unfinished blocks)
  const openTags = (transformResult.transformedCode.match(/<[A-Za-z][A-Za-z0-9]*(?:\s+[^>]*?)?(?<!\/)>/g) || []).length;
  const closeTags = (transformResult.transformedCode.match(/<\/[A-Za-z][A-Za-z0-9]*>/g) || []).length;
  const selfClosingTags = (transformResult.transformedCode.match(/<[A-Za-z][A-Za-z0-9]*[^>]*?\/>/g) || []).length;
  const isValidSyntax = Math.abs(openTags - closeTags) <= 1;

  return {
    filepath: options.filepath,
    initialScore: initialAudit.slopScore,
    projectedScore,
    scoreImprovement,
    patches,
    safePatchesCount: patches.filter(p => p.autoApplicable).length,
    manualReviewCount: patches.filter(p => !p.autoApplicable).length,
    repairedCode: transformResult.transformedCode,
    isValidSyntax
  };
}
