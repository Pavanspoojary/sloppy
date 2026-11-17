import { AuditOptions, AuditResult, SlopViolation, SlopViolationType } from './types.js';

export * from './types.js';

export function auditCode(code: string, options: AuditOptions = {}): AuditResult {
  const violations: SlopViolation[] = [];
  const lines = code.split('\n');

  // 1. Detect Purple / Indigo Gradient Slop
  const purpleGradientRegex = /(bg-gradient-to-[a-z]+\s+(?:from|to|via)-(?:purple|indigo|violet|fuchsia)-(?:400|500|600|700)|linear-gradient\([^)]*(?:#7c3aed|#6366f1|#8b5cf6|#a855f7|rgba\(\s*124,\s*58,\s*237|rgba\(\s*99,\s*102,\s*241|purple|violet)[^)]*\))/i;
  
  // 2. Detect Sparkle Icon Overload
  const sparkleIconRegex = /<(?:LucideSparkles|Sparkles|Wand|MagicWand|Sparkle|IconSparkles|AiSparkle)\b/i;

  // 3. Detect Unearned Animations
  const unearnedAnimationRegex = /\b(animate-bounce|animate-pulse|animate-spin|animate-ping)\b/;

  // 4. Detect Made-Up AI Badges
  const aiBadgeRegex = /(?:Powered by AI|AI-Powered|Smart AI|Magical AI|AI Assistant|AI Generated|Generate with AI)/i;

  // 5. Detect Boxed Card Monotony
  const boxedCardRegex = /\b(rounded-(?:lg|xl|2xl)\s+border\s+p-[4-8]\s+shadow-(?:sm|md|lg)|border\s+rounded-(?:lg|xl)\s+bg-(?:white|card|neutral-900)\s+p-[4-8])/;

  // 6. Detect Floating Window on Canvas
  const floatingWindowRegex = /<(?:Window|Mockup|BrowserWindow|DeviceFrame)\b[^>]*(?:className=["'][^"']*\bp-[8-9]|p-1[0-9]|mx-auto my-8|m-8)/;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Check Purple Gradient
    const purpleMatch = trimmed.match(purpleGradientRegex);
    if (purpleMatch) {
      violations.push({
        id: `purple-gradient-${lineNumber}`,
        type: 'PURPLE_GRADIENT_SLOP',
        severity: 'critical',
        line: lineNumber,
        snippet: trimmed,
        message: 'Unwarranted purple/indigo gradient detected. This is a telltale sign of AI-generated slop.',
        recommendation: 'Replace generic purple gradients with purposeful surface depth (quiet grays, subtle steps like linear dark or light-accent) and a single intentional accent color reserved for true signals.'
      });
    }

    // Check Sparkle Icons
    const sparkleMatch = trimmed.match(sparkleIconRegex);
    if (sparkleMatch) {
      violations.push({
        id: `sparkle-icon-${lineNumber}`,
        type: 'SPARKLE_ICON_OVERLOAD',
        severity: 'high',
        line: lineNumber,
        snippet: trimmed,
        message: 'Sparkle/magic-wand icon detected on feature. Modern craft avoids magical sparkles on interfaces.',
        recommendation: 'Remove sparkle icons. Let the interface speak through real system state, thoughtful typography, or clean product iconography rather than AI tropes.'
      });
    }

    // Check Unearned Animation
    const animMatch = trimmed.match(unearnedAnimationRegex);
    if (animMatch) {
      violations.push({
        id: `unearned-anim-${lineNumber}`,
        type: 'UNEARNED_ANIMATION',
        severity: 'high',
        line: lineNumber,
        snippet: trimmed,
        message: `Unearned animation "${animMatch[1]}" detected. Every motion must have a visible cause.`,
        recommendation: 'Remove arbitrary looping/bouncing animations. Animate only state transitions, cursor interactions, or user-initiated actions with deliberate easing and settling.'
      });
    }

    // Check Made-up AI badges
    const badgeMatch = trimmed.match(aiBadgeRegex);
    if (badgeMatch) {
      violations.push({
        id: `ai-badge-${lineNumber}`,
        type: 'MADE_UP_AI_BADGE',
        severity: 'medium',
        line: lineNumber,
        snippet: trimmed,
        message: `Made-up AI marketing label "${badgeMatch[0]}" detected.`,
        recommendation: 'State what the tool actually accomplishes (e.g. "Auto-complete", "Analyze MRR") rather than shouting "AI".'
      });
    }

    // Check Boxed Card Syndrome
    const boxedMatch = trimmed.match(boxedCardRegex);
    if (boxedMatch) {
      violations.push({
        id: `boxed-card-${lineNumber}`,
        type: 'BOXED_CARD_SYNDROME',
        severity: 'medium',
        line: lineNumber,
        snippet: trimmed,
        message: 'Repetitive boxed card structure with uniform padding and border.',
        recommendation: 'Break monotony with varied surface depth, gutters, or borderless rows. Use structural hierarchy rather than placing every item in an identical rounded box.'
      });
    }

    // Check Floating Window
    const floatMatch = trimmed.match(floatingWindowRegex);
    if (floatMatch) {
      violations.push({
        id: `floating-window-${lineNumber}`,
        type: 'UNANCHORED_FLOATING_WINDOW',
        severity: 'high',
        line: lineNumber,
        snippet: trimmed,
        message: 'Mock window floating inside a padded box with air on all four sides.',
        recommendation: 'Framing Rule: The window must fill at least two thirds of the stage and run off an edge. Crop to the panel where the action happens; bleed filler off the boundary.'
      });
    }
  });

  // 7. Word Budget Restraint Check (Word count estimation)
  // Strip code syntax and measure real text tokens
  const textMatches = code
    .replace(/<[^>]+>/g, ' ')
    .replace(/import\s+.*?;/g, ' ')
    .replace(/const\s+.*?=/g, ' ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/[a-zA-Z_$][a-zA-Z0-9_$]*\(.*?\)/g, ' ')
    .match(/[A-Z][a-z]{2,}/g) || [];
  
  const distinctWords = Array.from(new Set(textMatches));
  const usesBarComponent = /<(?:Bar|Placeholder|Skeleton)\b/.test(code);

  if (distinctWords.length > 18 && !usesBarComponent) {
    violations.push({
      id: 'word-budget-exceeded',
      type: 'WORD_BUDGET_EXCEEDED',
      severity: 'high',
      message: `Word budget exceeded: found approx ${distinctWords.length} distinct text words without placeholder bars.`,
      recommendation: 'Restraint Rule: Use real words only on what the story is about (3 to 7 key strings). Use calm placeholder bars (<Bar />) for the rest. Filling every row with fake numbers and text makes it look AI-generated.'
    });
  }

  // Calculate slop score
  let score = 0;
  violations.forEach(v => {
    switch (v.severity) {
      case 'critical': score += 35; break;
      case 'high': score += 20; break;
      case 'medium': score += 10; break;
      case 'low': score += 5; break;
    }
  });
  score = Math.min(100, score);

  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const highCount = violations.filter(v => v.severity === 'high').length;
  const mediumCount = violations.filter(v => v.severity === 'medium').length;

  const remediationPlan: string[] = [];
  if (criticalCount > 0) {
    remediationPlan.push('Purge purple/indigo gradients and replace with monochromatic surface steps and quiet grays.');
  }
  if (violations.some(v => v.type === 'SPARKLE_ICON_OVERLOAD')) {
    remediationPlan.push('Eliminate sparkle and magic-wand iconography; use authentic system icons.');
  }
  if (violations.some(v => v.type === 'UNANCHORED_FLOATING_WINDOW')) {
    remediationPlan.push('Fix framing: crop the window to the panel of interest, let non-focal filler bleed off edges, and avoid floating miniature windows with air on 4 sides.');
  }
  if (violations.some(v => v.type === 'WORD_BUDGET_EXCEEDED')) {
    remediationPlan.push('Enforce the 3-7 word budget: replace peripheral data with calm placeholder bars (<Bar />).');
  }
  if (violations.some(v => v.type === 'UNEARNED_ANIMATION')) {
    remediationPlan.push('Strip unearned bouncing/pulsing keyframes; ensure every animation has an explicit cause and payoff.');
  }

  let summary = 'Pristine craft: zero AI slop detected.';
  if (score > 70) {
    summary = `Severe AI slop detected (Score: ${score}/100) with ${criticalCount} critical and ${highCount} high severity violations.`;
  } else if (score > 30) {
    summary = `Moderate AI slop detected (Score: ${score}/100) with ${violations.length} total issues requiring refinement.`;
  } else if (score > 0) {
    summary = `Minor craft issues detected (Score: ${score}/100). Quick adjustments will bring this to gold standard.`;
  }

  return {
    filepath: options.filepath,
    slopScore: score,
    isSlopFree: violations.length === 0,
    violations,
    stats: {
      totalViolations: violations.length,
      criticalCount,
      highCount,
      mediumCount,
      estimatedWordCount: distinctWords.length
    },
    summary,
    remediationPlan
  };
}
