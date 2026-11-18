import { auditCode } from './index.js';
import { SlopViolation } from './types.js';

export interface CraftDimension {
  id: string;
  name: string;
  score: number; // 0 to 10
  maxScore: 10;
  weight: number;
  status: 'flawless' | 'good' | 'needs-attention' | 'critical-slop';
  feedback: string;
}

export type CraftGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface CraftCertification {
  totalScore: number; // 0 to 100
  grade: CraftGrade;
  isCertified: boolean;
  verdict: string;
  dimensions: CraftDimension[];
  violations: SlopViolation[];
  markdownBadge: string;
  svgBadge: string;
}

export function evaluateCraftRubric(code: string, options: { strict?: boolean; filepath?: string } = {}): CraftCertification {
  const audit = auditCode(code, { strict: options.strict, filepath: options.filepath });
  const violations = audit.violations;

  // Dimension 1: Surface Elevation & Grounding (0-10)
  let surfaceScore = 10;
  if (violations.some(v => v.type === 'UNANCHORED_FLOATING_WINDOW')) surfaceScore -= 6;
  if (violations.some(v => v.type === 'BOXED_CARD_SYNDROME')) surfaceScore -= 4;
  if (violations.some(v => v.type === 'FLAT_SURFACE_MONOTONY')) surfaceScore -= 3;
  surfaceScore = Math.max(0, surfaceScore);

  // Dimension 2: Word Budget & Text Restraint (0-10)
  let wordScore = 10;
  if (violations.some(v => v.type === 'WORD_BUDGET_EXCEEDED')) wordScore -= 7;
  if (audit.stats.estimatedWordCount > 25) wordScore -= 4;
  else if (audit.stats.estimatedWordCount > 15) wordScore -= 2;
  wordScore = Math.max(0, wordScore);

  // Dimension 3: Motion Intentionality & Easing (0-10)
  let motionScore = 10;
  if (violations.some(v => v.type === 'UNEARNED_ANIMATION')) motionScore -= 8;
  if (/\banimate-spin\b/.test(code) && !/<(?:Spinner|Loader|RefreshCw)/.test(code)) motionScore -= 4;
  motionScore = Math.max(0, motionScore);

  // Dimension 4: Visual Focal Hierarchy (0-10)
  let hierarchyScore = 10;
  if (violations.some(v => v.type === 'CENTER_ALIGNED_EVERYTHING')) hierarchyScore -= 5;
  if (violations.some(v => v.type === 'BOXED_CARD_SYNDROME')) hierarchyScore -= 3;
  hierarchyScore = Math.max(0, hierarchyScore);

  // Dimension 5: Icon Authenticity (Zero Sparkle Slop) (0-10)
  let iconScore = 10;
  if (violations.some(v => v.type === 'SPARKLE_ICON_OVERLOAD')) iconScore -= 9;
  iconScore = Math.max(0, iconScore);

  // Dimension 6: Monochromatic Restraint & Accent Discipline (0-10)
  let accentScore = 10;
  if (violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP')) accentScore -= 9;
  accentScore = Math.max(0, accentScore);

  // Dimension 7: Framing & Bleeding Rules (0-10)
  let framingScore = 10;
  if (violations.some(v => v.type === 'UNANCHORED_FLOATING_WINDOW')) framingScore -= 8;
  if (!/(?:rounded-t-|border-t\s+border-x|overflow-hidden|Stage|Window)/.test(code) && /card|hero/i.test(code)) {
    framingScore -= 3;
  }
  framingScore = Math.max(0, framingScore);

  // Dimension 8: Density & Spacing Rhythm (0-10)
  let densityScore = 10;
  if (/\bp-[8-9]\s+m-[8-9]/.test(code)) densityScore -= 4;
  if (violations.some(v => v.type === 'BOXED_CARD_SYNDROME')) densityScore -= 3;
  densityScore = Math.max(0, densityScore);

  // Dimension 9: Real-World Chrome Integrity (0-10)
  let chromeScore = 10;
  if (violations.some(v => v.type === 'MADE_UP_AI_BADGE')) chromeScore -= 6;
  chromeScore = Math.max(0, chromeScore);

  // Dimension 10: Semantic Foundation & Accessibility (0-10)
  let a11yScore = 10;
  if (violations.some(v => v.type === 'LOW_CONTRAST_GRAY')) a11yScore -= 5;
  a11yScore = Math.max(0, a11yScore);

  const dimensions: CraftDimension[] = [
    {
      id: 'surface_elevation',
      name: 'Surface Elevation & Grounding',
      score: surfaceScore,
      maxScore: 10,
      weight: 1.0,
      status: surfaceScore >= 9 ? 'flawless' : surfaceScore >= 7 ? 'good' : surfaceScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: surfaceScore >= 9 
        ? 'Grounded, purposeful surface elevation with authentic depth.' 
        : 'Avoid floating shrunken cards with uniform air. Fill horizontal stage and bleed off edges.'
    },
    {
      id: 'word_budget',
      name: 'Word Budget & Text Restraint',
      score: wordScore,
      maxScore: 10,
      weight: 1.0,
      status: wordScore >= 9 ? 'flawless' : wordScore >= 7 ? 'good' : wordScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: wordScore >= 9 
        ? 'Disciplined 3 to 7 real strings budget observed.' 
        : 'Too much fake Latin text or repetitive words. Use quiet placeholder bars (<Bar />) for filler.'
    },
    {
      id: 'motion_intentionality',
      name: 'Motion Intentionality & Easing',
      score: motionScore,
      maxScore: 10,
      weight: 1.0,
      status: motionScore >= 9 ? 'flawless' : motionScore >= 7 ? 'good' : motionScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: motionScore >= 9 
        ? 'Cause-and-effect transitions with settled physical easing.' 
        : 'Unearned bouncing, pinging, or looping animations detected. Animate only when user-caused or progress-linked.'
    },
    {
      id: 'focal_hierarchy',
      name: 'Visual Focal Hierarchy',
      score: hierarchyScore,
      maxScore: 10,
      weight: 1.0,
      status: hierarchyScore >= 9 ? 'flawless' : hierarchyScore >= 7 ? 'good' : hierarchyScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: hierarchyScore >= 9 
        ? 'Clear primary focal point with disciplined secondary accents.' 
        : 'Multiple competing elements with uniform weights. Establish an unmistakable dominant focal node.'
    },
    {
      id: 'icon_authenticity',
      name: 'Icon Authenticity (Zero Sparkle Slop)',
      score: iconScore,
      maxScore: 10,
      weight: 1.0,
      status: iconScore >= 9 ? 'flawless' : 'critical-slop',
      feedback: iconScore >= 9 
        ? 'Zero decorative sparkle or magic-wand icons.' 
        : 'Decorative sparkles detected. Replace with honest functional system icons.'
    },
    {
      id: 'accent_discipline',
      name: 'Monochromatic Restraint & Accent Discipline',
      score: accentScore,
      maxScore: 10,
      weight: 1.0,
      status: accentScore >= 9 ? 'flawless' : 'critical-slop',
      feedback: accentScore >= 9 
        ? 'Disciplined neutral ground with single intentional signal accent.' 
        : 'Unwarranted purple, indigo, or rainbow gradients detected. Step from surface 1 to surface 3 in quiet grays.'
    },
    {
      id: 'framing_bleeding',
      name: 'Framing & Bleeding Rules',
      score: framingScore,
      maxScore: 10,
      weight: 1.0,
      status: framingScore >= 9 ? 'flawless' : framingScore >= 7 ? 'good' : framingScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: framingScore >= 9 
        ? 'Intentional viewport framing with edge bleeding.' 
        : 'Do not shrink entire interfaces into floating boxes. Bleed secondary panels off the stage frame.'
    },
    {
      id: 'density_spacing',
      name: 'Density & Spacing Rhythm',
      score: densityScore,
      maxScore: 10,
      weight: 1.0,
      status: densityScore >= 9 ? 'flawless' : densityScore >= 7 ? 'good' : densityScore >= 4 ? 'needs-attention' : 'critical-slop',
      feedback: densityScore >= 9 
        ? 'Tight, compact information density with deliberate rhythm.' 
        : 'Excessive padding or bloated margins inflating component size.'
    },
    {
      id: 'chrome_integrity',
      name: 'Real-World Chrome Integrity',
      score: chromeScore,
      maxScore: 10,
      weight: 1.0,
      status: chromeScore >= 9 ? 'flawless' : 'needs-attention',
      feedback: chromeScore >= 9 
        ? 'Authentic window chrome and status indicators.' 
        : 'Made-up AI marketing badges ("Powered by AI") detected. Use real system metadata.'
    },
    {
      id: 'semantic_contrast',
      name: 'Semantic Foundation & Contrast',
      score: a11yScore,
      maxScore: 10,
      weight: 1.0,
      status: a11yScore >= 9 ? 'flawless' : 'needs-attention',
      feedback: a11yScore >= 9 
        ? 'High contrast ratio and accessible typographic foundations.' 
        : 'Low-contrast gray text on gray backgrounds detected.'
    }
  ];

  const totalScore = dimensions.reduce((acc, d) => acc + d.score, 0);

  let grade: CraftGrade = 'F';
  if (totalScore >= 95) grade = 'A+';
  else if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 50) grade = 'D';

  const isCertified = totalScore >= 90;

  const verdict = isCertified
    ? `Sloppy Craft Certified: Grade ${grade} (${totalScore}/100). Pristine craftsmanship, disciplined word budgeting, and grounded framing.`
    : `Certification Failed: Grade ${grade} (${totalScore}/100). Substandard craftsmanship with detected AI slop anti-patterns.`;

  const colorHex = isCertified ? '38bdf8' : totalScore >= 75 ? 'eab308' : 'ef4444';
  const badgeLabel = `Sloppy%20Craft-Grade%20${encodeURIComponent(grade)}%20(${totalScore}%2F100)-${colorHex}`;
  const markdownBadge = `[![Sloppy Craft Certified](https://img.shields.io/badge/${badgeLabel}?style=flat-square)](#)`;

  const svgBadge = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="28" viewBox="0 0 180 28" fill="none">
  <rect width="180" height="28" rx="6" fill="#18181b" stroke="#27272a"/>
  <rect x="1" y="1" width="90" height="26" rx="5" fill="#27272a"/>
  <text x="12" y="18" fill="#a1a1aa" font-family="monospace" font-size="11" font-weight="600">SLOPPY</text>
  <text x="102" y="18" fill="#${colorHex}" font-family="monospace" font-size="11" font-weight="700">GRADE ${grade} (${totalScore})</text>
</svg>`;

  return {
    totalScore,
    grade,
    isCertified,
    verdict,
    dimensions,
    violations,
    markdownBadge,
    svgBadge
  };
}
