import { auditCode } from './index.js';
import {
  AuditResult,
  TransformationItem,
  TransformOptions,
  TransformResult
} from './types.js';

export function transformSlopToCraft(code: string, options: TransformOptions = {}): TransformResult {
  const preAudit = auditCode(code, { strict: true });
  const transformations: TransformationItem[] = [];
  let transformed = code;
  const isLight = options.look === 'minimal' || options.look === 'radix';

  // 1. Transform Purple / Indigo Gradient Slop
  const purpleGradientRegex = /bg-gradient-to-[a-z]+\s+(?:from|to|via)-(?:purple|indigo|violet|fuchsia)-(?:300|400|500|600|700)[^"']*/g;
  if (purpleGradientRegex.test(transformed)) {
    const replacement = isLight
      ? 'bg-neutral-50/80 border border-neutral-200 text-neutral-900 shadow-sm'
      : 'bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-2xl backdrop-blur-sm';
    
    transformed = transformed.replace(purpleGradientRegex, (match) => {
      transformations.push({
        type: 'PURPLE_GRADIENT_SLOP',
        original: match,
        replacement,
        explanation: 'Replaced unwarranted purple/indigo gradient with calm, grounded surface depth tokens.'
      });
      return replacement;
    });
  }

  // 1b. Linear-gradient inline CSS
  const inlinePurpleRegex = /linear-gradient\([^)]*(?:#7c3aed|#6366f1|#8b5cf6|#a855f7|rgba\(\s*124,\s*58,\s*237|rgba\(\s*99,\s*102,\s*241|purple|violet)[^)]*\)/gi;
  if (inlinePurpleRegex.test(transformed)) {
    const replacement = isLight
      ? 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)'
      : 'linear-gradient(180deg, #18181b 0%, #09090b 100%)';

    transformed = transformed.replace(inlinePurpleRegex, (match) => {
      transformations.push({
        type: 'PURPLE_GRADIENT_SLOP',
        original: match,
        replacement,
        explanation: 'Converted inline purple gradient to subtle monochromatic surface elevation.'
      });
      return replacement;
    });
  }

  // 2. Transform Sparkle Icon Overload
  const sparkleIconTagRegex = /<(?:LucideSparkles|Sparkles|MagicWand|Sparkle|IconSparkles|AiSparkle)\b([^>]*)>/g;
  if (sparkleIconTagRegex.test(transformed)) {
    transformed = transformed.replace(sparkleIconTagRegex, (match, attrs) => {
      const cleanAttrs = attrs.replace(/\btext-(?:yellow|amber|purple|indigo)-[0-9]+\b/g, 'text-neutral-400');
      const replacement = `<Zap${cleanAttrs}>`;
      transformations.push({
        type: 'SPARKLE_ICON_OVERLOAD',
        original: match,
        replacement,
        explanation: 'Replaced speculative magic sparkles with crisp, functional Zap/Activity icon.'
      });
      return replacement;
    });

    // Update import from lucide-react if present
    if (/from\s+['"]lucide-react['"]/.test(transformed) && !/Zap\b/.test(transformed)) {
      transformed = transformed.replace(
        /(import\s*\{[^}]*?)\b(Sparkles|LucideSparkles|Sparkle)\b([^}]*?\}\s*from\s*['"]lucide-react['"])/g,
        '$1Zap$3'
      );
    }
  }

  // 3. Transform Unearned Animations
  const unearnedAnimationRegex = /\b(animate-bounce|animate-pulse|animate-spin|animate-ping)\b/g;
  if (unearnedAnimationRegex.test(transformed)) {
    transformed = transformed.replace(unearnedAnimationRegex, (match) => {
      let replacement = 'transition-all duration-200 ease-out';
      if (match === 'animate-bounce') {
        replacement = 'transition-transform duration-200 ease-out hover:-translate-y-0.5';
      } else if (match === 'animate-pulse') {
        replacement = 'transition-opacity duration-300';
      }
      transformations.push({
        type: 'UNEARNED_ANIMATION',
        original: match,
        replacement,
        explanation: `Replaced chaotic unearned "${match}" with purposeful, cause-driven transition.`
      });
      return replacement;
    });
  }

  // 4. Transform Made-Up AI Badges
  const aiBadgeRegex = /(?:Powered by AI|AI-Powered|Smart AI|Magical AI|AI Assistant|AI Generated|Generate with AI)/g;
  if (aiBadgeRegex.test(transformed)) {
    transformed = transformed.replace(aiBadgeRegex, (match) => {
      const replacement = 'Autonomous System';
      transformations.push({
        type: 'MADE_UP_AI_BADGE',
        original: match,
        replacement,
        explanation: `Replaced cliché marketing label "${match}" with authentic operational description.`
      });
      return replacement;
    });
  }

  // 5. Transform Floating Ungrounded Windows
  if (options.groundFraming !== false) {
    const floatingWindowRegex = /\b(?:mx-auto\s+my-[4-8]\s+max-w-[a-z0-9]+|max-w-[a-z0-9]+\s+mx-auto\s+p-[6-9]|m-[6-9]\s+max-w-[a-z0-9]+)\b/g;
    if (floatingWindowRegex.test(transformed)) {
      const replacement = 'w-full max-w-4xl mx-auto rounded-t-xl border-t border-x border-neutral-800 bg-neutral-950/90 shadow-2xl';
      transformed = transformed.replace(floatingWindowRegex, (match) => {
        transformations.push({
          type: 'UNANCHORED_FLOATING_WINDOW',
          original: match,
          replacement,
          explanation: 'Grounded floating window to fill viewport frame and bleed off bottom edge.'
        });
        return replacement;
      });
    }
  }

  // 6. Word Budgeting & Lorem Ipsum reduction
  const loremRegex = /<p[^>]*>\s*(?:Lorem ipsum|Ut enim ad minim|Duis aute irure)[^<]*<\/p>/gi;
  if (loremRegex.test(transformed)) {
    const replacement = `<div className="space-y-1.5 py-1">
  <div className="h-2 w-3/4 bg-neutral-800/80 rounded-full" />
  <div className="h-2 w-1/2 bg-neutral-800/50 rounded-full" />
</div>`;
    transformed = transformed.replace(loremRegex, (match) => {
      transformations.push({
        type: 'WORD_BUDGET_EXCEEDED',
        original: match,
        replacement,
        explanation: 'Replaced wall of generic filler text with disciplined structural placeholder bars.'
      });
      return replacement;
    });
  }

  const postAudit = auditCode(transformed, { strict: true });

  return {
    originalCode: code,
    transformedCode: transformed,
    changesApplied: transformations.length,
    transformations,
    preAudit,
    postAudit
  };
}
