import { AuditOptions, AuditResult, SlopViolation, SlopViolationType, SlopSeverity, FindingEvidence, CANONICAL_RULES, RULE_ALIASES } from './types.js';
import { RULE_METADATA } from './rule-metadata.js';
import { scanSource, classTokens, getClasses, sourceLocation, lineAt, SourceTag } from './source-scan.js';
import { loadSloppyConfig } from './config.js';
import { DEFAULT_BLUR_CAP, declaredAccentAllows, resolveDesignContract } from './design-contract.js';
import { getNodeEnv } from '../node-env.js';

export * from './types.js';
export * from './rule-metadata.js';
export * from './design-contract.js';
export * from './transform.js';
export * from './rubric.js';
export * from './repair-planner.js';
export * from './config.js';
export * from './wiring-guard.js';

const severity: Record<SlopSeverity, number> = { critical: 40, high: 20, medium: 10, low: 4 };
const advice: Record<SlopViolationType, string> = {
  PURPLE_GRADIENT_SLOP: 'Replace purple-family gradients with a restrained surface palette and a purposeful accent.',
  EMERALD_MONOCULTURE: 'Replace the unconfigured emerald-on-dark accent with the brand accent declared in DESIGN.md.',
  BLUR_OVERUSE: 'Cap backdrop-blur to 1–2 functional overlays; use solid surfaces with a 1px border for cards.',
  GLOW_SHADOW: 'Replace colored glow shadows with a neutral grounded shadow or flat border elevation.',
  STATUS_DOT_SLOP: 'Bind the status dot to real health telemetry, or remove the decorative indicator.',
  AI_PROSE_FILLER: 'Replace em-dash chains, adjective triplets, and vague attribution with direct concrete prose.',
  SPARKLE_ICON_OVERLOAD: 'Replace decorative sparkle or magic-wand iconography with authentic product iconography.',
  UNEARNED_ANIMATION: 'Use looping motion only for explicit progress affordances; otherwise animate cause-driven state changes.',
  MADE_UP_AI_BADGE: 'Describe the product action or system state without generic AI marketing language.',
  BOXED_CARD_SYNDROME: 'Vary surface hierarchy with layout, spacing, and elevation instead of repeating identical cards.',
  UNANCHORED_FLOATING_WINDOW: 'Let the frame fill its stage and bleed through at least one boundary.',
  CENTER_ALIGNED_EVERYTHING: 'Reserve centered alignment for focal content and vary alignment in supporting layout.',
  LOW_CONTRAST_GRAY: 'Increase text and background contrast to meet WCAG contrast thresholds.',
  FLAT_SURFACE_MONOTONY: 'Introduce a clear surface or elevation step among repeated sibling elements.',
  WORD_BUDGET_EXCEEDED: 'Keep visible copy focused and replace secondary content with quiet placeholders.',
  AI_COPY_CLICHE: 'Replace generic AI copy clichés with concrete product capabilities and authentic metrics.',
  DEAD_PLACEHOLDER_SLOP: 'Connect buttons and links to real actions or handlers instead of dead "#" or empty callback placeholders.',
  HERO_GRADIENT_TEXT: 'Replace gradient text with solid high-contrast typography, weight contrast, and intentional tracking.',
  NEGATIVE_PARALLELISM: 'Rewrite contrast reframes ("It\'s not just X, it\'s Y") as direct affirmative statements.',
  FABRICATED_SOCIAL_PROOF: 'Replace unverified round-number metrics or ratings with verified product data or explicit TODOs.',
  CHATBOT_SIGN_OFF_SLOP: 'Strip meta-commentary, AI assistant sign-offs, and filler introductions.',
  FAKE_CONTROL_SLOP: 'Use semantic <button> or provide role="button", tabIndex={0}, and onKeyDown handler for keyboard accessibility.',
  LOREM_IPSUM_SLOP: 'Replace generic placeholder text (Lorem ipsum, John Doe) with authentic product copy or explicit placeholders.',
  EMOJI_ICON_SLOP: 'Replace raw emojis in UI chrome with disciplined SVG icons or clean typographic labels.',
  Z_INDEX_CHAOS: 'Enforce disciplined, layered stacking tokens rather than arbitrary extreme z-indexes.',
  DESIGN_TOKEN_DRIFT: 'Use a color declared in DESIGN.md instead of an off-contract hard-coded value.',
  SCROLL_HIJACKING: 'Avoid global scroll locks or intercepting native wheel events; let viewport scrolling flow naturally.',
  AI_NARRATION_COMMENT_SLOP: 'Strip low-signal AI narration comments ("// Render...", section divider banners); preserve invariant and rationale comments.',
  STERILE_SURFACE_SLOP: 'Add purposeful micro-interactions, hover states, or typographic depth to avoid sterile gray voids when eliminating slop.',
  CHAINED_TYPE_ASSERTION: 'Avoid chained type assertions ("as unknown as T"); validate shapes with type guards or schema validators.',
  UNVALIDATED_DYNAMIC_RETURN: 'Specify a concrete return type or runtime validator instead of returning unverified "any" or "unknown".',
  BROAD_RECORD_SLOP: 'Define explicit property keys or bounded unions instead of broad "Record<string, any>" dictionaries.',
  EMPTY_OBJECT_SPREAD: 'Use explicit optional properties instead of conditional empty object spreads ("...(cond ? { a } : {})").',
  NON_NULL_ASSERTION_SLOP: 'Use optional chaining ("?.") or defensive null checks instead of chained non-null assertions ("!.").',
  UNBOUNDED_INFINITE_MOTION: 'Replace unbounded infinite loops ("repeat: Infinity", "loop: true") with caused, finite transitions that settle cleanly.',
  REDUCED_MOTION_BLINDNESS: 'Honor reduced-motion accessibility via useReducedMotion(), <MotionConfig reducedMotion="user">, or prefers-reduced-motion checks.',
  LAYOUT_THRASH_ANIMATION: 'Animate compositor-friendly transform (x, y, scale, rotate) and opacity instead of layout-thrashing width, height, top, left, margin, or padding.',
  UNMANAGED_WEBGL_OR_MEDIA_LOOP: 'Clean up WebGL/Lottie/scroll instances with .dispose()/.destroy() on unmount, and throttle R3F <Canvas> with frameloop="demand" and bounded dpr.',
  TRANSITION_ALL_SLOP: 'Replace `transition: all` / `transition-all` with an explicit property list so layout and inherited properties never animate by accident.',
  SLOW_INTERACTION_MOTION: 'Keep direct interaction feedback inside roughly 300ms; reserve longer durations for large surfaces or storytelling, not hovers and taps.',
  SCROLL_REVEAL_SATURATION: 'Render first-screen content visible in HTML; if the page reveals on scroll, keep it to one restrained motif that works without JavaScript.',
  AUTOPLAY_MOTION_WITHOUT_CONTROL: 'Add a visible keyboard-operable pause control to any motion that starts automatically and runs longer than five seconds.',
  FLASHING_ANIMATION: 'Remove the flash or keep it below three flashes per second; rapid light-to-dark alternation risks seizures.',
  SCALE_FROM_ZERO: 'Enter from 0.9-0.96 scale with opacity instead of scale(0), so the element reads as a real object rather than a pop-in.',
  CSS_LOOP_NO_REDUCED_GUARD: 'Add an `@media (prefers-reduced-motion: reduce)` (or `motion-safe:`) fallback for CSS loops so the animation stops or simplifies.',
  VESTIBULAR_RISK_MOTION: 'Guard parallax, 3D tilt, and large zoom with reduced motion and keep the moving area small; large-area motion can trigger vestibular symptoms.',
  UNEARNED_HOVER_LIFT: 'Reserve hover lift and scale for real interactive controls; static cards should respond to content, not pretend to be clickable.',
  UNIFORM_ENTRANCE_MOTION: 'Keep one restrained entrance motif per page; render static text and navigation visible instead of fading in four or more identical blocks.',
  ELASTIC_UI_EASING: 'Use a plain ease-out for routine surfaces; keep overshoot easing for one small expressive icon, never a dialog or a whole card.',
  WILL_CHANGE_LEAK: 'Set will-change just before a known animation and remove it after; leaving it on many elements creates layers and memory pressure.',
  OFF_CONTRACT_MOTION: 'Use a duration from the motion scale declared in DESIGN.md, or update the contract first so the scale stays the source of truth.'
};

const BANNER_CHARS = new Set(['-', '=', '_', '*', '#', '~']);

function isDividerBanner(trimmed: string): boolean {
  let body = trimmed.startsWith('/*') ? trimmed.slice(2) : trimmed.startsWith('//') ? trimmed.slice(2) : '';
  if (trimmed.startsWith('/*') && body.endsWith('*/')) body = body.slice(0, -2);
  body = body.trim();
  if (body.length < 5) return false;
  let lead = 0;
  while (lead < body.length && BANNER_CHARS.has(body[lead])) lead++;
  if (lead < 5) return false;
  if (lead === body.length) return true;
  let trail = 0;
  while (trail < body.length - lead && BANNER_CHARS.has(body[body.length - 1 - trail])) trail++;
  if (trail < 5) return false;
  const mid = body.slice(lead, body.length - trail);
  return !/[^\w \t-]/.test(mid);
}

export function isAiNarrationComment(text: string): { isSlop: boolean; reason?: string } {
  const trimmed = text.trim();
  if (/sloppy-ignore|sloppy-allow|sloppy-override|@sloppy|eslint|@ts-|istanbul|prettier/i.test(trimmed)) {
    return { isSlop: false };
  }
  if (/^(?:\/\/|\/\*)\s*(?:invariant|workaround|safari|firefox|chrome|ios|android|todo|fixme|note|hack|perf|see:?|ref:?)\b/i.test(trimmed)) {
    return { isSlop: false };
  }
  if (isDividerBanner(trimmed)) {
    return { isSlop: true, reason: 'Decorative divider banner comment' };
  }
  if (trimmed.startsWith('//')) {
    const content = trimmed.slice(2).trim();
    const narrationPatterns = [
      /^(?:render|rendering)\s+(?:the\s+)?(?:header|footer|sidebar|card|modal|button|table|view|content|page|component|jsx|ui|elements?|container|wrapper|section|icons?)\b/i,
      /^(?:returns?|return\s+the)\s+(?:jsx|component|ui|elements?|view)\b/i,
      /^(?:main\s+|outer\s+|inner\s+|content\s+|card\s+|modal\s+|page\s+)?(?:container|wrapper|layout|body|section)\s*(?:div|element|view)?$/i,
      /^(?:state\s+management|define\s+state|component\s+state|state\s+variables?|hooks?\s+setup)\b/i,
      /^(?:handle|handling)\s+(?:click|submit|change|events?|actions?|input)\b/i,
      /^(?:helper|utility)\s+(?:functions?|methods?)\b/i,
      /^(?:props|interfaces?|types?)\s+(?:definition|declaration)?$/i,
      /^(?:sub-?components?|child\s+components?)\b/i
    ];
    for (const pat of narrationPatterns) {
      if (pat.test(content)) {
        return { isSlop: true, reason: `AI narration comment: "${content}"` };
      }
    }
  }
  return { isSlop: false };
}
const purple = '(?:purple|violet|indigo|fuchsia)';
function containsPurpleColor(value: string): boolean {
  if (new RegExp(`\\b${purple}\\b`, 'i').test(value)) return true;
  const colors: number[][] = [];
  for (const m of value.matchAll(/#([\da-f]{3}|[\da-f]{6})\b/ig)) {
    const raw = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1]; colors.push([0,2,4].map(i => parseInt(raw.slice(i, i + 2),16)));
  }
  for (const m of value.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/ig)) colors.push([Number(m[1]),Number(m[2]),Number(m[3])]);
  for (const m of value.matchAll(/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/ig)) if (Number(m[1]) % 360 >= 250 && Number(m[1]) % 360 <= 340 && Number(m[2]) > 12) return true;
  for (const rgb of colors) { const [r,g,b] = rgb.map(v => v / 255), max = Math.max(r,g,b), min = Math.min(r,g,b); let h = 0; if (max !== min) h = max === r ? 60 * (((g-b)/(max-min)) % 6) : max === g ? 60 * ((b-r)/(max-min)+2) : 60 * ((r-g)/(max-min)+4); if (h < 0) h += 360; if (h >= 250 && h <= 340 && max - min > 0.12) return true; }
  return false;
}

function contrast(a: number[], b: number[]): number {
  const lum = (rgb: number[]) => rgb.map(v => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const colorCache = new Map<string, number[] | undefined>();
function color(token: string): number[] | undefined {
  if (colorCache.has(token)) return colorCache.get(token);
  const m = token.match(/^(?:text|bg)-(white|black|(?:neutral|gray|zinc|slate|stone)-(50|100|200|300|400|500|600|700|800|900|950))(?:\/(\d+))?$/);
  if (!m) { colorCache.set(token, undefined); return; }
  let base: number[] | undefined;
  if (m[1] === 'white') { base = [255,255,255]; }
  else if (m[1] === 'black') { base = [0,0,0]; }
  else {
    const shade = Number(m[2]);
    const palettes: Record<string, Record<number, string>> = {
      neutral: {50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a'},
      gray: {50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827',950:'#030712'},
      zinc: {50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b',950:'#09090b'},
      slate: {50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617'},
      stone: {50:'#fafaf9',100:'#f5f5f4',200:'#e7e5e4',300:'#d6d3d1',400:'#a8a29e',500:'#78716c',600:'#57534e',700:'#44403c',800:'#292524',900:'#1c1917',950:'#0c0a09'}
    };
    const name = m[1].split('-')[0], hex = palettes[name]?.[shade];
    base = hex ? [1,3,5].map(i => parseInt(hex.slice(i, i + 2), 16)) : undefined;
  }
  if (!base) { colorCache.set(token, undefined); return; }
  if (m[3] !== undefined) {
    const alpha = Math.max(0, Math.min(100, Number(m[3]))) / 100;
    // Blend over neutral canvas surface [255, 255, 255] for light-mode approximation
    const blended = base.map(c => Math.round(c * alpha + 255 * (1 - alpha)));
    colorCache.set(token, blended);
    return blended;
  }
  colorCache.set(token, base);
  return base;
}
function has(tokens: string[], re: RegExp): boolean { return tokens.some(t => re.test(t)); }
function spacingAtLeastFour(token: string, prefix: string): boolean { const match = token.match(new RegExp(`^${prefix}-(\\d+(?:\\.\\d+)?)$`)); return !!match && Number(match[1]) >= 4; }
function extractVisibleText(code: string, tags: SourceTag[]): { text: string; offsetAt: (vIndex: number) => number } {
  const spans: Array<{ vStart: number; vEnd: number; cStart: number }> = [];
  const parts: string[] = [];
  let vCursor = 0, cursor = 0, depth = 0;

  const pushSpan = (segment: string, cStart: number) => {
    if (!segment) return;
    const maskedSegment = segment.replace(/https?:\/\/\S+/g, m => ' '.repeat(m.length));
    spans.push({ vStart: vCursor, vEnd: vCursor + maskedSegment.length, cStart });
    parts.push(maskedSegment);
    vCursor += maskedSegment.length;
  };

  // Only JSX text and single string literals render. Code inside expression
  // containers is discarded, including nested callbacks and inline comments.
  const visible = (chunkStart: number, chunkEnd: number) => {
    let i = chunkStart;
    while (i < chunkEnd) {
      const next = code.indexOf('{', i);
      if (next < 0 || next >= chunkEnd) { pushSpan(code.slice(i, chunkEnd), i); break; }
      pushSpan(code.slice(i, next), i);
      let braces = 1, j = next + 1, quote = '';
      for (; j < chunkEnd && braces > 0; j++) {
        const c = code[j];
        if (quote) { if (c === '\\') j++; else if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'" || c === '`') quote = c;
        else if (c === '{') braces++;
        else if (c === '}') braces--;
      }
      const exprRaw = code.slice(next + 1, j - 1);
      const trimmed = exprRaw.trim();
      if (!trimmed.startsWith('/*')) {
        const literal = trimmed.match(/^(['"`])([\s\S]*)\1$/);
        if (literal) {
          const leading = exprRaw.indexOf(literal[1]);
          const contentStart = next + 1 + leading + 1;
          pushSpan(' ', Math.max(0, contentStart - 1));
          pushSpan(literal[2], contentStart);
          pushSpan(' ', Math.min(code.length - 1, contentStart + literal[2].length));
        }
      }
      i = j;
    }
  };

  for (const tag of tags) {
    if (depth > 0) visible(cursor, tag.start);
    if (tag.closing) depth = Math.max(0, depth - 1);
    else if (!tag.selfClosing) depth++;
    cursor = tag.end;
  }

  const offsetAt = (vIndex: number): number => {
    for (const s of spans) {
      if (vIndex >= s.vStart && vIndex < s.vEnd) return s.cStart + (vIndex - s.vStart);
    }
    return spans[0]?.cStart ?? 0;
  };

  return { text: parts.join(''), offsetAt };
}

export function auditCode(code: string, options: AuditOptions = {}): AuditResult {
  const config = options.config || (options.filepath ? loadSloppyConfig(options.filepath) : null);
  const scan = scanSource(code), tags = scan.tags.filter(t => !t.closing), candidates: Array<{ type: SlopViolationType; severity: SlopSeverity; at: number; message: string; evidence?: Partial<FindingEvidence>; context?: string }> = [];
  const tagClassMap = new Map<SourceTag, string[]>();
  const classesFor = (tag: SourceTag): string[] => {
    let cached = tagClassMap.get(tag);
    if (!cached) { cached = getClasses(tag); tagClassMap.set(tag, cached); }
    return cached;
  };
  const parent = new Map<SourceTag, SourceTag | undefined>(), openStack: SourceTag[] = [];
  for (const tag of scan.tags) {
    if (tag.closing) { for (let i = openStack.length - 1; i >= 0; i--) if (openStack[i].name === tag.name) { openStack.length = i; break; } }
    else { parent.set(tag, openStack[openStack.length - 1]); if (!tag.selfClosing) openStack.push(tag); }
  }
  const ancestorsOf = (tag: SourceTag): SourceTag[] => { const found: SourceTag[] = []; let current = parent.get(tag); while (current) { found.push(current); current = parent.get(current); } return found; };
  const push = (type: SlopViolationType, at: number, message: string, level?: SlopSeverity, evidence?: Partial<FindingEvidence>, context?: string) => {
    const defaultLevel = CANONICAL_RULES[type]?.defaultSeverity ?? 'medium';
    candidates.push({ type, severity: level ?? defaultLevel, at, message, evidence, context });
  };
  const selectorAt = (at: number): string | undefined => {
    let found: SourceTag | undefined;
    for (const t of tags) { if (t.start <= at) found = t; else break; }
    if (!found) return undefined;
    const safeTokens = classesFor(found).filter(token => /^[A-Za-z0-9_-]+$/.test(token)).slice(0, 2);
    return `${found.name}${safeTokens.map(token => `.${token}`).join('')}`;
  };
  const tagClasses = tags.map(tag => ({ tag, tokens: classesFor(tag) }));
  const allowGradients = config?.brand?.allowGradients ?? false;
  // Gradient classes are grouped by element so gradient direction and stops can occur in any order.
  for (const { tag, tokens } of tagClasses) {
    const joined = tokens.join(' ');
    if (!allowGradients) {
      if (/(?:bg-gradient-to-[\w-]+|bg-(?:radial|conic))/.test(joined) && new RegExp(`(?:from|via|to)-${purple}(?:-|\\b)|(?:from|via|to)-\\[#`, 'i').test(joined) && containsPurpleColor(joined)) push('PURPLE_GRADIENT_SLOP', tag.start, 'Purple-family gradient stop detected.');
      const arbitrary = joined.match(/(?:bg-)?\[(?:linear|radial|conic)-gradient\([^\]]*\)\]/gi);
      if (arbitrary?.some(containsPurpleColor)) push('PURPLE_GRADIENT_SLOP', tag.start, 'Arbitrary gradient contains a purple-family color.');
      for (const attrName of ['style']) {
        const attr = tag.attributes.get(attrName);
        if (attr && /(?:linear|radial|conic)-gradient\(/i.test(attr.value) && containsPurpleColor(attr.value)) push('PURPLE_GRADIENT_SLOP', attr.valueStart, 'Inline gradient contains a purple-family color.');
      }
    }
    if (tokens.includes('bg-clip-text') && (tokens.includes('text-transparent') || joined.includes('text-transparent'))) {
      if (joined.includes('bg-gradient-') || joined.includes('bg-linear-') || (joined.includes('from-') && joined.includes('to-'))) {
        push('HERO_GRADIENT_TEXT', tag.start, 'Hero gradient text (bg-clip-text with text-transparent and gradient) detected.');
      }
    }
    const animation = tokens.find(t => /^(?:animate-(?:bounce|pulse|ping|spin)|animate-\[[^\]]+\])$/.test(t) && (/^animate-(?:bounce|pulse|ping|spin)$/.test(t) || /infinite|\b(?:infinite|alternate)\b/i.test(t)));
    if (animation) {
      const tagText = code.slice(tag.start, tag.end);
      const signal = /Spinner|Loader|Loading|Skeleton|Shimmer|Placeholder|Progress/i.test(tag.name + ' ' + tokens.join(' ')) || /\brole\s*=\s*["'](?:status|progressbar)["']|\baria-busy(?:\s*=|\s|\/|>)/i.test(tagText);
      const ancestors = ancestorsOf(tag).filter(x => /\baria-live\s*=/.test(code.slice(x.start, x.end)) || /\brole\s*=\s*["'](?:status|progressbar)["']|\baria-busy(?:\s*=|\s|\/|>)/i.test(code.slice(x.start, x.end)));
      if (!signal && ancestors.length === 0) push('UNEARNED_ANIMATION', tag.start, `Unearned looping animation "${animation}" detected.`);
    }
  }
  const importAliases = new Map<string, string>();
  let impPos = 0;
  while ((impPos = code.indexOf('import', impPos)) >= 0) {
    const prev = impPos > 0 ? code[impPos - 1] : '\n';
    const next = code[impPos + 6] || '';
    impPos += 6;
    if (/[A-Za-z0-9_$]/.test(prev) || (next && !/\s|\{/.test(next))) continue;
    const openBrace = code.indexOf('{', impPos);
    const semi = code.indexOf(';', impPos);
    if (openBrace < 0 || (semi >= 0 && semi < openBrace)) continue;
    const closeBrace = code.indexOf('}', openBrace + 1);
    if (closeBrace < 0) break;
    const afterBrace = code.slice(closeBrace + 1, closeBrace + 80);
    if (/^\s*from\s*["'][^"'\n]+["']/.test(afterBrace)) {
      for (const part of code.slice(openBrace + 1, closeBrace).split(',')) {
        const asIdx = part.search(/\sas\s/);
        if (asIdx > 0) {
          const original = part.slice(0, asIdx).trim();
          const alias = part.slice(asIdx + 4).trim();
          if (original && alias) importAliases.set(alias, original);
        }
      }
    }
    impPos = closeBrace + 1;
  }
  const iconNames = /^(?:Sparkles|LucideSparkles|Wand|MagicWand|Sparkle|IconSparkles|AiSparkle|SparkleIcon|MagicWand02)$/;
  for (const tag of tags) if (!tag.closing) { const base = tag.name.split('.').pop() || ''; if (iconNames.test(base) || iconNames.test(importAliases.get(base) || '')) push('SPARKLE_ICON_OVERLOAD', tag.start, `Decorative sparkle or magic-wand component <${tag.name}> detected.`); }
  const { text: visibleText, offsetAt } = extractVisibleText(code, scan.tags);
  const phrases = /Powered\s+by\s+AI|AI[- ]Powered|Smart\s+AI|Magical\s+AI|AI\s+Assistant|AI\s+Generated|Generate\s+with\s+AI|Supercharge\b[^.\n]{0,50}\bAI\b|\u{2728}/igu;
  let phrase: RegExpExecArray | null; while ((phrase = phrases.exec(visibleText))) { push('MADE_UP_AI_BADGE', offsetAt(phrase.index), `Made-up AI marketing phrase "${phrase[0]}" detected.`); }
  const cliches = /\b(?:Unlock\s+the\s+power\s+of|Supercharge\s+your\s+(?:workflow|productivity|team|growth)|Seamless(?:ly)?\s+(?:integrate|connect|automate)|10x\s+your\s+(?:productivity|growth|output)|Revolutionize\s+the\s+way)\b/igu;
  let clicheMatch: RegExpExecArray | null; while ((clicheMatch = cliches.exec(visibleText))) { push('AI_COPY_CLICHE', offsetAt(clicheMatch.index), `Generic AI marketing cliché "${clicheMatch[0]}" detected.`); }
  const negativeParallelism = /\b(?:not\s+just\s+[^,.!?\n]{2,40}[,—-]\s*(?:it['’]s|but)\b|\bnot\s+a\s+[^,.!?\n]{2,30}[,—-]\s*it['’]s\b)/igu;
  let npMatch: RegExpExecArray | null; while ((npMatch = negativeParallelism.exec(visibleText))) { push('NEGATIVE_PARALLELISM', offsetAt(npMatch.index), `Negative parallelism copy cliché ("${npMatch[0].trim()}") detected.`); }
  const socialProof = /\b(?:(?:(?:[1-9][0-9]{0,2}(?:,\d{3})+|\d+(?:\.\d+)?[kKMB])\+\s*(?:users?|customers?|teams?|companies|developers)|(?:99\.99?%|100%)\s*(?:uptime|guarantee)|Loved\s+by\s+(?:thousands|millions)|Rated\s+5(?:\.0)?\s*(?:\/|out\s+of)\s*5\s*stars?))\b/igu;
  let spMatch: RegExpExecArray | null; while ((spMatch = socialProof.exec(visibleText))) { push('FABRICATED_SOCIAL_PROOF', offsetAt(spMatch.index), `Fabricated social proof metric "${spMatch[0].trim()}" detected.`); }
  const chatbotPhrases = /\b(?:I\s+hope\s+this\s+helps[!.]?|In\s+conclusion,\s+|Overall,\s+(?:it|this)\s+|Let\s+me\s+know\s+if\s+you\s+(?:need|have)|It['’]s\s+important\s+to\s+note\s+that)\b/igu;
  let cbMatch: RegExpExecArray | null; while ((cbMatch = chatbotPhrases.exec(visibleText))) { push('CHATBOT_SIGN_OFF_SLOP', offsetAt(cbMatch.index), `Leftover chatbot conversational phrasing "${cbMatch[0].trim()}" detected.`); }
  const loremIpsum = /\b(?:lorem\s+ipsum|dolor\s+sit\s+amet|consectetur\s+adipiscing|sed\s+do\s+eiusmod|john\s+doe|jane\s+doe)\b/igu;
  let liMatch: RegExpExecArray | null; while ((liMatch = loremIpsum.exec(visibleText))) { push('LOREM_IPSUM_SLOP', offsetAt(liMatch.index), `Placeholder copy or filler name "${liMatch[0].trim()}" detected.`); }
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
  let emojiMatch: RegExpExecArray | null;
  while ((emojiMatch = emojiRegex.exec(visibleText))) {
    push('EMOJI_ICON_SLOP', offsetAt(emojiMatch.index), `Raw emoji "${emojiMatch[0]}" detected in UI text instead of an SVG icon.`);
  }
  for (const tag of tags) {
    const href = tag.attributes.get('href')?.value?.trim();
    if (href === '#' || href === 'javascript:void(0)') {
      push('DEAD_PLACEHOLDER_SLOP', tag.start, `Dead placeholder href="${href}" detected on <${tag.name}>.`);
    }
    const onClick = tag.attributes.get('onClick')?.value?.trim() || tag.attributes.get('onclick')?.value?.trim();
    if (onClick && /^\s*\(\s*\)\s*=>\s*\{\s*\}\s*$/.test(onClick)) {
      push('DEAD_PLACEHOLDER_SLOP', tag.start, 'Empty dead click handler onClick={() => {}} detected.');
    }
  }
  for (const tag of tags) {
    if (tag.name === 'div' || tag.name === 'span') {
      const hasOnClick = tag.attributes.has('onClick') || tag.attributes.has('onclick');
      if (hasOnClick) {
        const role = tag.attributes.get('role')?.value?.toLowerCase();
        const validRoles = ['button', 'tab', 'link', 'menuitem', 'option', 'switch', 'checkbox'];
        if (!role || !validRoles.includes(role)) {
          push('FAKE_CONTROL_SLOP', tag.start, `Inaccessible clickable <${tag.name}> lacks role="button" or keyboard accessibility.`);
        }
      }
    }
  }
  const cards = tagClasses.filter(({tokens}) => has(tokens,/^rounded(?:-|$)/) && has(tokens,/^border(?:-|$)/) && (tokens.some(t => spacingAtLeastFour(t,'p')) || (tokens.some(t => spacingAtLeastFour(t,'px')) && tokens.some(t => spacingAtLeastFour(t,'py')))) && (has(tokens,/^bg-/) || has(tokens,/^shadow-/)));
  if (cards.length >= (options.strict ? 3 : 4)) push('BOXED_CARD_SYNDROME', cards[0].tag.start, `Found ${cards.length} repeated boxed card elements.`);
  for (const {tag,tokens} of tagClasses) {
    const frame = /^(Window|Mockup|BrowserWindow|DeviceFrame|PhoneFrame)$/.test(tag.name.split('.').pop() || '');
    const windowSurface = has(tokens,/^rounded(?:-|$)/) && has(tokens,/^shadow(?:-|$)/) && has(tokens,/^max-w-(?:xs|sm|md|lg|xl|[2-7]xl)$/);
    const generic = has(tokens,/^mx-auto$/) && has(tokens,/^my-[6-9](?:\b|$)/) && has(tokens,/^p-[6-9](?:\b|$)/) && windowSurface;
    const margin = has(tokens,/^m-[4-9](?:\b|$)/) || (has(tokens,/^my-[4-9]/) && has(tokens,/^mx-/)) || (has(tokens,/^mx-auto$/) && has(tokens,/^my-[4-9]/));
    const bleed = has(tokens,/^-m[xtb]-/) || tokens.includes('w-full') || tokens.includes('h-full') || tokens.includes('absolute') || has(tokens,/^inset-/) || has(tokens,/^rounded-t-/) || tokens.includes('overflow-hidden');
    if ((frame && margin && !bleed) || generic) push('UNANCHORED_FLOATING_WINDOW', tag.start, `Unanchored ${frame ? 'frame' : 'container'} has uniform outer spacing.`);
  }
  const layoutTags = tagClasses.filter(({tokens}) => has(tokens,/^(?:flex|grid|inline-flex|inline-grid|items-|justify-|place-items-|text-center$|gap-|col-|row-)/));
  const centered = tagClasses.filter(({tokens}) => has(tokens,/^(?:text-center|items-center|justify-center|place-items-center)$/));
  const hasLeadingEdge = tags.some(tag => has(getClasses(tag),/^(?:text-left|items-start|justify-start)$/));
  if (centered.length >= 8 && layoutTags.length > 0 && centered.length / layoutTags.length >= 0.75 && !hasLeadingEdge) push('CENTER_ALIGNED_EVERYTHING', centered[0].tag.start, `${centered.length} centered class occurrences span ${layoutTags.length} layout elements with no leading-edge anchor.`);
  for (const {tag,tokens} of tagClasses) {
    if (tag.name.toLowerCase() === 'svg' || /(?:icon|glyph)$/i.test(tag.name)) continue;
    const fg = tokens.map(color).find((x,i) => x && tokens[i].startsWith('text-'));
    const hasOwnBackground = tokens.some(t => t.startsWith('bg-'));
    let bg = tokens.map(color).find((x,i) => x && tokens[i].startsWith('bg-'));
    // An unresolved own background (e.g. bg-emerald-500) must not be compared
    // against an ancestor surface; that produces a false contrast failure.
    if (fg && !bg && !hasOwnBackground) for (const ancestor of ancestorsOf(tag)) { const ancestorTokens = getClasses(ancestor); bg = ancestorTokens.map(color).find((x,i) => x && ancestorTokens[i].startsWith('bg-')); if (bg) break; }
    if (fg && bg) {
      const ratio = contrast(fg,bg);
      const isLarge = tokens.some(t => /text-(?:lg|xl|[2-9]xl)/.test(t) || (t === 'font-bold' && tokens.includes('text-base')));
      const minRatio = isLarge ? 3 : 4.5;
      if (ratio < minRatio) push('LOW_CONTRAST_GRAY', tag.start, `Text and background contrast is ${ratio.toFixed(2)}:1 (minimum ${minRatio}:1 required under WCAG).`);
    }
  }
  // Repeated sibling-like tags are approximated by contiguous repeated opening tags with matching surface tokens.
  const surfaces = new Map<string, SourceTag[]>();
  for (const {tag,tokens} of tagClasses) { const bg = tokens.find(t => /^bg-/.test(t)), border = tokens.filter(t => /^border(?:-|$)/.test(t)).join(' '), rounded = tokens.filter(t => /^rounded(?:-|$)/.test(t)).join(' '), shadow = tokens.filter(t => /^shadow(?:-|$)/.test(t)).join(' '), parentKey = parent.get(tag)?.start ?? -1; if (bg && (border || rounded)) { const key = `${parentKey}|${bg}|${border}|${rounded}|${shadow}`; surfaces.set(key,[...(surfaces.get(key) || []),tag]); } }
  for (const group of surfaces.values()) if (group.length >= 4) { push('FLAT_SURFACE_MONOTONY', group[0].start, `${group.length} elements repeat the same background, border, and rounding without an elevation step.`); break; }

  // Gen-2 defaults: the "anti-slop" palette swap. Detect-only, because the fix is
  // a brand decision declared in DESIGN.md, not a mechanical rewrite.
  const designContract = options.designContract ?? resolveDesignContract(options.filepath, config);
  const hasDarkGround = tagClasses.some(({ tokens }) => tokens.some(t =>
    /^bg-(?:black|neutral-(?:900|950)|slate-(?:900|950)|zinc-(?:900|950)|stone-(?:900|950)|gray-(?:900|950))$/.test(t) || /^bg-\[#0[0-9a-f]{5}\]$/i.test(t)
  ));
  if (!declaredAccentAllows(designContract, 'emerald') && !(config?.brand?.allowColors || []).some(c => /^(?:emerald|green|teal|lime)$/i.test(c))) {
    const emerald = tagClasses.flatMap(({ tag, tokens }) => tokens
      .filter(t => /(?:^|:)(?:bg|text|border|ring|from|via|to|fill|stroke|outline|decoration)-emerald-\d{3}(?:\/\d+)?$/.test(t))
      .map(token => ({ tag, token })));
    if (hasDarkGround && emerald.length) push('EMERALD_MONOCULTURE', emerald[0].tag.start, `Gen-2 emerald accent "${emerald[0].token}" on a dark ground with no declared brand token.`);
  }

  const blurCap = designContract.blurCap ?? config?.design?.blurCap ?? DEFAULT_BLUR_CAP;
  const blurElements = tagClasses.filter(({ tokens }) => tokens.some(t => /^backdrop-blur(?:-|$)/.test(t)));
  if (blurElements.length > blurCap) push('BLUR_OVERUSE', blurElements[blurCap].tag.start, `${blurElements.length} elements use backdrop-blur (cap ${blurCap}); glass is being used as the default surface.`);

  const glowPattern = /^(?:shadow|drop-shadow)-(?:emerald|green|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|red|orange|amber|yellow|lime)(?:-\d{3})?(?:\/\d+)?$/;
  const glow = tagClasses.flatMap(({ tag, tokens }) => tokens.filter(t => glowPattern.test(t) || /^drop-shadow-\[.*(?:#[0-9a-f]{3,8}|rgba?\()/i.test(t)).map(token => ({ tag, token })));
  if (glow.length) push('GLOW_SHADOW', glow[0].tag.start, `Colored glow shadow "${glow[0].token}" detected; colored ambient glow is a Gen-1/Gen-2 default.`);

  // CPY-02: a pulsing green dot claiming live status without any telemetry binding.
  const claimsLiveStatus = /\b(?:all\s+systems\s+operational|systems?\s+operational|currently\s+live|live\s+status)\b/i.test(visibleText);
  const pulsingDot = tagClasses.some(({ tokens }) => tokens.some(t => /^animate-(?:pulse|ping)$/.test(t)) && tokens.some(t => /^(?:bg|from|fill)-(?:emerald|green)-\d{3}$/.test(t)));
  const wiredToTelemetry = /\b(?:fetch\(|useSWR|useQuery|statusUrl|statusUri|healthz|health-check|\/api\/(?:status|health))\b/i.test(code);
  if (claimsLiveStatus && pulsingDot && !wiredToTelemetry) push('STATUS_DOT_SLOP', tagClasses.find(({ tokens }) => tokens.includes('animate-pulse') || tokens.includes('animate-ping'))?.tag.start ?? tags[0]?.start ?? 0, 'Pulsing status dot claims live operational status but no health endpoint or telemetry binding exists.');

  // CPY-05: formulaic prose tics. Each sub-signal is reported at most once.
  const emDashCount = (visibleText.match(/[—–]/g) || []).length;
  const firstDash = visibleText.match(/[—–]/);
  if (emDashCount >= 3 && firstDash) push('AI_PROSE_FILLER', offsetAt(firstDash.index ?? 0), `${emDashCount} em/en dashes in visible copy; use commas or parentheses where they belong.`);
  const adjectiveTriplet = /\b(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b\s*,\s*(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b\s*,\s*and\s+(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b/iu;
  const tripletMatch = visibleText.match(adjectiveTriplet);
  if (tripletMatch) push('AI_PROSE_FILLER', offsetAt(tripletMatch.index ?? 0), `Adjective triplet "${tripletMatch[0]}" detected.`);
  const falseRange = visibleText.match(/\branging\s+from\s+[^.\n]{2,40}\s+to\s+[^.\n]{2,40}/iu);
  if (falseRange) push('AI_PROSE_FILLER', offsetAt(falseRange.index ?? 0), `Formulaic false range "${falseRange[0].trim()}" detected.`);
  const vagueAttribution = visibleText.match(/\b(?:studies|research|experts|industry\s+reports?)\s+(?:show|shows|suggest|suggests|say|says|indicate|indicates)\b/iu);
  if (vagueAttribution) push('AI_PROSE_FILLER', offsetAt(vagueAttribution.index ?? 0), `Vague attribution "${vagueAttribution[0]}" detected.`);
  const spelledMetric = visibleText.match(/\b(?:across|for|with|in)\s+(?:three|four|five|six|seven|eight|nine|ten)\s+(?:tools|teams|steps|platforms|workflows|minutes|seconds)\b/iu);
  if (spelledMetric) push('AI_PROSE_FILLER', offsetAt(spelledMetric.index ?? 0), `Spelled-out metric "${spelledMetric[0]}" detected; use numerals in UI copy.`);

  const lockedColors = new Set<string>();
  for (const token of designContract.lockedTokens) {
    for (const match of token.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi)) {
      const hex = match[1].toLowerCase();
      lockedColors.add(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex);
    }
  }
  for (const { tag, tokens } of tagClasses) {
    if (lockedColors.size) {
      const colorSource = [...tokens, tag.attributes.get('style')?.value || ''].join(' ');
      for (const match of colorSource.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi)) {
        const raw = match[1].toLowerCase();
        const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
        if (!lockedColors.has(hex)) {
          push('DESIGN_TOKEN_DRIFT', tag.start, `Off-contract color "#${raw}" is not in the DESIGN.md palette (${[...lockedColors].map((c) => `#${c}`).join(', ')}).`);
          break;
        }
      }
    }
    const extremeZ = tokens.find(t => /^z-(?:\[?(?:999+|1000+|99999)\]?)$/.test(t) || /^z-\[\d{4,}\]/.test(t));
    if (extremeZ) {
      push('Z_INDEX_CHAOS', tag.start, `Arbitrary escalated z-index "${extremeZ}" detected instead of disciplined stacking tokens.`);
    }
    const styleAttr = tag.attributes.get('style')?.value;
    if (styleAttr && /zIndex\s*:\s*(?:9999|99999|10000)/i.test(styleAttr)) {
      push('Z_INDEX_CHAOS', tag.start, 'Arbitrary high z-index in inline style detected.');
    }
  }
  for (const tag of tags) {
    if (tag.name === 'html' || tag.name === 'body') {
      const tokens = getClasses(tag);
      if (tokens.includes('overflow-hidden')) {
        push('SCROLL_HIJACKING', tag.start, `Global overflow-hidden lock on <${tag.name}> disrupts native page scrolling.`);
      }
    }
    if (tag.attributes.has('onWheel') || tag.attributes.has('onwheel')) {
      push('SCROLL_HIJACKING', tag.start, 'Custom onWheel handler detected; risk of scroll hijacking or wheel interference.');
    }
  }
  // CSS and inline declaration text; comments are excluded using the scanner mask, while tag values retain authored strings.
  if (!allowGradients) {
    const gradientRe = /(?:linear|radial|conic)-gradient\(/gi;
    let gm: RegExpExecArray | null;
    while ((gm = gradientRe.exec(scan.masked))) {
      const at = gm.index;
      let depth = 1, p = at + gm[0].length;
      while (p < scan.masked.length && depth > 0) {
        if (scan.masked[p] === '(') depth++;
        else if (scan.masked[p] === ')') depth--;
        p++;
      }
      const expr = scan.masked.slice(at, p);
      if (containsPurpleColor(expr) && !candidates.some(v => v.type === 'PURPLE_GRADIENT_SLOP' && Math.abs(v.at - at) < 120)) {
        push('PURPLE_GRADIENT_SLOP', at, 'CSS gradient contains a purple-family color.');
      }
      gradientRe.lastIndex = p;
    }
  }
  const text = visibleText;
  const wordCount = (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || []).length;
  const limits = { illustration:12, 'feature-card':18, hero:32, application:150, bento:40 } as const;
  const configuredBudget = config?.wordBudget?.[options.componentType || 'default'];
  const threshold = configuredBudget ?? (options.componentType ? limits[options.componentType] : (config?.wordBudget?.default ?? 60));
  if (wordCount > threshold && !tags.some(tag => /^(?:Bar|Skeleton|Placeholder)$/.test(tag.name.split('.').pop() || ''))) push('WORD_BUDGET_EXCEEDED', tags[0]?.start ?? 0, `Visible word budget exceeded: ${wordCount} words, limit ${threshold}.`);
  const allComments = scan.comments.map(c => ({ ...c, line: sourceLocation(scan, c.at).line }));

  // COD-01: AI narration comments and decorative section divider banners
  for (const comment of allComments) {
    const check = isAiNarrationComment(comment.text);
    if (check.isSlop) {
      push('AI_NARRATION_COMMENT_SLOP', comment.at, `${check.reason || 'AI narration comment detected.'}`);
    }
  }

  // LIV-01: Sterile surface and missing liveliness check
  const interactiveControls = tags.filter(t => t.name === 'button' || (t.name === 'a' && t.attributes.has('href')));
  const hasStylesheetImport = /\bimport\s+['"][^'"]+\.(?:css|scss|sass|less)['"]/.test(code);
  if (interactiveControls.length >= 2) {
    const hasMicroInteractions = interactiveControls.some(ctrl => {
      const tokens = getClasses(ctrl);
      if (tokens.some(t => /^(?:hover:|focus:|focus-visible:|active:|transition-|duration-|ease-|group-hover:)/.test(t))) return true;
      const styleVal = ctrl.attributes.get('style')?.value || '';
      if (/\b(?:transition|animation)\s*:/.test(styleVal)) return true;
      return hasStylesheetImport && tokens.some(t => /^[a-z]+-[a-z0-9_-]+$/.test(t) && !/^(?:px|py|p|mx|my|m|bg|text|rounded|border|flex|grid|w|h)-/.test(t));
    });
    if (!hasMicroInteractions) {
      push('STERILE_SURFACE_SLOP', interactiveControls[0].start, 'Interactive controls lack hover, focus, or transition affordances, creating a sterile interface.');
    }
  }

  // COD-02: Chained type assertions (as unknown as T, as any as T)
  const chainedTypeRegex = /\bas\s+(?:unknown|any)\s+as\b/g;
  for (const match of scan.masked.matchAll(chainedTypeRegex)) {
    const at = match.index ?? 0;
    push('CHAINED_TYPE_ASSERTION', at, `Chained type assertion ("${match[0].trim()}") detected; use type guards or validated schemas.`);
  }

  // COD-03: Unvalidated contract return type (any / unknown)
  const dynamicReturnRegex = /\)\s*:\s*(?:Promise<\s*(?:any|unknown)\s*>|(?:any|unknown)\b)\s*(?:=>|\{)/g;
  for (const match of scan.masked.matchAll(dynamicReturnRegex)) {
    const closeParen = match.index ?? 0;
    let depth = 1, openParen = closeParen - 1;
    while (openParen >= 0 && depth > 0) {
      if (scan.masked[openParen] === ')') depth++;
      else if (scan.masked[openParen] === '(') depth--;
      openParen--;
    }
    if (depth !== 0) continue;
    const prefix = scan.masked.slice(Math.max(0, openParen - 64), openParen + 1).trimEnd();
    if (!/(?:function(?:\s+[A-Za-z0-9_$]+)?|[A-Za-z0-9_$]+|=|\basync)$/i.test(prefix)) continue;
    push('UNVALIDATED_DYNAMIC_RETURN', closeParen, `Unvalidated contract return type (${match[0].includes('any') ? 'any' : 'unknown'}) detected; specify a concrete shape or schema validator.`);
  }

  // COD-04: Broad Record<string, any/unknown>
  const broadRecordRegex = /\bRecord<\s*string\s*,\s*(?:any|unknown)\s*>/g;
  for (const match of scan.masked.matchAll(broadRecordRegex)) {
    const at = match.index ?? 0;
    push('BROAD_RECORD_SLOP', at, `Broad dictionary type "${match[0]}" erases type safety.`);
  }

  // COD-05: Conditional empty object spread: ...(cond ? { ... } : {})
  let spreadPos = 0;
  while ((spreadPos = scan.masked.indexOf('...', spreadPos)) >= 0) {
    let p = spreadPos + 3;
    while (p < scan.masked.length && (scan.masked[p] === ' ' || scan.masked[p] === '\t')) p++;
    if (scan.masked[p] === '(') {
      let depth = 1, q = p + 1;
      const limit = Math.min(scan.masked.length, q + 400);
      while (q < limit && depth > 0) {
        if (scan.masked[q] === '(') depth++;
        else if (scan.masked[q] === ')') depth--;
        q++;
      }
      if (depth === 0) {
        const inner = scan.masked.slice(p + 1, q - 1);
        const qMark = inner.indexOf('?');
        if (qMark > 0 && !inner.slice(0, qMark).includes('\n') && /:\s*\{\s*\}\s*$/.test(inner.slice(qMark + 1))) {
          push('EMPTY_OBJECT_SPREAD', spreadPos, `Conditional empty object spread ("${scan.masked.slice(spreadPos, q).trim().slice(0, 50)}") detected.`);
        }
        spreadPos = q;
        continue;
      }
    }
    spreadPos += 3;
  }

  // COD-06: Chained non-null assertion (!.)
  const nonNullRegex = /\b[A-Za-z0-9_$]+!\.[A-Za-z0-9_$]+/g;
  for (const match of scan.masked.matchAll(nonNullRegex)) {
    const at = match.index ?? 0;
    push('NON_NULL_ASSERTION_SLOP', at, `Unsafe non-null assertion ("${match[0]}") detected; use optional chaining or defensive guard.`);
  }

  // MOT-02: Unbounded infinite programmatic motion (Motion, Anime, Tween, Lottie, Rive, Magic UI)
  const isLoaderNear = (at: number) => /Spinner|Loader|Loading|Skeleton|Shimmer|Progress/i.test(code.slice(Math.max(0, at - 140), at + 140));
  for (const match of scan.masked.matchAll(/\brepeat\s*:\s*Infinity\b|\.repeat\s*\(\s*Infinity\s*\)/g)) {
    const at = match.index ?? 0;
    if (!isLoaderNear(at)) {
      push('UNBOUNDED_INFINITE_MOTION', at, `Unbounded infinite motion ("${match[0].trim()}") detected; animations should settle cleanly after a visible cause.`);
    }
  }
  for (const match of scan.masked.matchAll(/\b(?:anime|lottie\.loadAnimation|new\s+(?:DotLottie|Rive))\s*\(\s*\{[^}]*\bloop\s*:\s*true\b/g)) {
    const at = match.index ?? 0;
    if (!isLoaderNear(at)) {
      push('UNBOUNDED_INFINITE_MOTION', at, 'Infinite programmatic loop ("loop: true") detected; bind playback to user state or hold after payoff.');
    }
  }
  for (const tag of tags) {
    if (/^(?:DotLottieReact|Lottie)$/.test(tag.name) && tag.attributes.has('loop')) {
      const loopVal = tag.attributes.get('loop')?.value?.trim();
      if (!loopVal || loopVal === 'true') {
        push('UNBOUNDED_INFINITE_MOTION', tag.start, `<${tag.name} loop> runs indefinitely; trigger playback from an explicit interaction or finite state.`);
      }
    }
  }

  // MOT-03: Missing reduced-motion safeguard when active runtime motion/scroll/3D/Lottie libraries are invoked
  const runtimeMotionImport = /\bfrom\s+['"](?:motion(?:\/react)?|framer-motion|animejs|@react-spring\/[^'"]+|@formkit\/auto-animate|@tweenjs\/tween\.js|@theatre\/core|lenis|@studio-freight\/lenis|aos|rellax|lax\.js|atropos|splitting|vivus|three|@react-three\/fiber|pixi\.js|lottie-web|@lottiefiles\/dotlottie-(?:web|react)|@rive-app\/[^'"]+)['"]/.exec(code);
  const runtimeMotionCall = /<motion\.[a-z]+|\banime\s*\(|\buseSpring\s*\(|\buseAutoAnimate\s*\(|\bnew\s+(?:Lenis|Rellax|Vivus|THREE\.WebGLRenderer|PIXI\.Application|DotLottie|Rive)\b|\bAOS\.init\s*\(|\blax\.init\s*\(|\bSplitting\s*\(|<Canvas\b|\blottie\.loadAnimation\s*\(|\buseRive\s*\(|<DotLottieReact\b|<Atropos\b/.exec(code);
  if (runtimeMotionImport && runtimeMotionCall) {
    const hasReducedMotionGuard = /\b(?:useReducedMotion|MotionConfig|reducedMotion|prefers-reduced-motion|matchMedia)\b/.test(code);
    if (!hasReducedMotionGuard) {
      push('REDUCED_MOTION_BLINDNESS', runtimeMotionCall.index ?? runtimeMotionImport.index ?? 0, 'Active runtime animation/WebGL library used without a reduced-motion guard (useReducedMotion, MotionConfig, or prefers-reduced-motion).');
    }
  }

  // MOT-04: Layout-thrashing geometric animation (width/height/top/left/margin/padding)
  const layoutPropRe = /\b(?:width|height|top|left|right|bottom|margin(?:Top|Left|Right|Bottom)?|padding(?:Top|Left|Right|Bottom)?)\s*:/;
  const nonHeightLayoutPropRe = /\b(?:width|top|left|right|bottom|margin(?:Top|Left|Right|Bottom)?|padding(?:Top|Left|Right|Bottom)?)\s*:/;
  const layoutThrashMsg = 'Animating geometric layout properties triggers reflow thrashing; prefer transform (x, y, scale) and opacity.';
  const isPureAutoHeight = (expr: string, rawExpr: string): boolean =>
    /\bheight\s*:\s*['"]auto['"]/.test(rawExpr) && !nonHeightLayoutPropRe.test(expr);

  for (const tag of scan.tags) {
    for (const propName of ['animate', 'whileHover', 'whileTap', 'exit']) {
      const attr = tag.attributes.get(propName);
      if (!attr || !layoutPropRe.test(attr.value)) continue;
      const rawExpr = code.slice(attr.valueStart, attr.valueStart + attr.value.length);
      if (isPureAutoHeight(attr.value, rawExpr)) continue;
      push('LAYOUT_THRASH_ANIMATION', attr.valueStart, layoutThrashMsg);
    }
  }
  for (const match of scan.masked.matchAll(/\banime\s*\(\s*\{[^}]*\b(?:width|height|top|left|right|bottom|margin(?:Top|Left|Right|Bottom)?|padding(?:Top|Left|Right|Bottom)?)\s*:/g)) {
    const at = match.index ?? 0;
    const rawSlice = code.slice(at, at + match[0].length + 24);
    if (isPureAutoHeight(match[0], rawSlice)) continue;
    push('LAYOUT_THRASH_ANIMATION', at, layoutThrashMsg);
  }

  // MOT-05: Unmanaged WebGL, Lottie, or Smooth Scroll lifecycle / frame throttling
  for (const tag of tags) {
    if (tag.name === 'Canvas' && /\bfrom\s+['"]@react-three\/fiber['"]/.test(code)) {
      const hasFrameloop = tag.attributes.has('frameloop');
      const hasDpr = tag.attributes.has('dpr');
      if (!hasFrameloop && !hasDpr) {
        push('UNMANAGED_WEBGL_OR_MEDIA_LOOP', tag.start, 'React Three Fiber <Canvas> runs an unthrottled 60fps loop with unbounded DPR; set frameloop="demand" and/or dpr={[1, 2]}.');
      }
    }
  }
  const unmanagedInstance = /\b(?:new\s+(?:THREE\.WebGLRenderer|PIXI\.Application|DotLottie|Rive|Lenis|Rellax|Vivus)|lottie\.loadAnimation)\s*\(/.exec(scan.masked);
  if (unmanagedInstance) {
    const hasCleanup = /\.(?:dispose|destroy|cleanup|kill)\s*\(|\bcancelAnimationFrame\s*\(/.test(scan.masked);
    if (!hasCleanup) {
      push('UNMANAGED_WEBGL_OR_MEDIA_LOOP', unmanagedInstance.index ?? 0, `Imperative animation/WebGL instance ("${unmanagedInstance[0].trim()}") lacks .dispose()/.destroy() cleanup.`);
    }
  }

  // MOT-06: Cross-property transition (transition: all / transition-all)
  const transitionAllMessage = 'Cross-property transition ("transition: all") animates unknown properties and can drag layout with it.';
  for (const match of scan.masked.matchAll(/\btransition(?:-property)?\s*:\s*all\b/gi)) {
    push('TRANSITION_ALL_SLOP', match.index ?? 0, transitionAllMessage);
  }
  for (const match of code.matchAll(/\btransition(?:-property)?\s*:\s*['"`]\s*all\b/gi)) {
    push('TRANSITION_ALL_SLOP', match.index ?? 0, transitionAllMessage);
  }
  for (const { tag, tokens } of tagClasses) {
    if (tokens.includes('transition-all')) push('TRANSITION_ALL_SLOP', tag.start, transitionAllMessage);
    const styleAttr = tag.attributes.get('style');
    if (styleAttr && /\btransition(?:-property)?\s*:\s*all\b/i.test(styleAttr.value)) push('TRANSITION_ALL_SLOP', styleAttr.valueStart, transitionAllMessage);
  }

  // MOT-07: Slow interaction feedback (above the declared ceiling, 600ms by default).
  const motionContract = designContract.motion;
  const feedbackCeilingMs = motionContract?.maxFeedback ?? 600;
  const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary', 'label', 'option']);
  const hasInteractionVariant = (tokens: string[]) => tokens.some(t => /^(?:hover|active|focus|focus-visible|focus-within|group-hover|peer-hover|group-active):/.test(t));
  const durationMs = (token: string): number | null => {
    const match = token.match(/(?:^|:)duration-(\d+|\[[^\]]+\])$/);
    if (!match) return null;
    if (match[1].startsWith('[')) {
      const raw = match[1].slice(1, -1);
      const value = Number.parseFloat(raw);
      return /ms$/.test(raw) ? value : Number.isFinite(value) ? value * 1000 : null;
    }
    const value = Number(match[1]);
    return value >= 1 && value <= 30 ? value * 1000 : value;
  };
  for (const { tag, tokens } of tagClasses) {
    const slow = tokens.find(t => { const ms = durationMs(t); return ms !== null && ms >= feedbackCeilingMs; });
    if (!slow) continue;
    if (INTERACTIVE_TAGS.has(tag.name) || hasInteractionVariant(tokens) || tag.attributes.has('onClick')) {
      push('SLOW_INTERACTION_MOTION', tag.start, `Slow interaction feedback ("${slow}") keeps a direct response from feeling immediate; the declared ceiling is ${feedbackCeilingMs}ms.`);
    }
  }

  // MOT-08: Scroll-reveal saturation: repeated whileInView/AOS reveals hide first-screen content until JS runs
  const whileInViewCount = [...code.matchAll(/\bwhileInView\b/g)].length;
  const aosSignal = /\bdata-aos\b|\bAOS\.init\s*\(/.test(code);
  const observerReveal = /\buseInView\s*\(|\bIntersectionObserver\b/.test(code) && /\binitial\s*=\s*\{\{[^}]*\bopacity\s*:\s*0\b/.test(code);
  const revealHasReducedGuard = /prefers-reduced-motion|useReducedMotion|MotionConfig|reducedMotion/.test(code);
  if (!revealHasReducedGuard) {
    if (whileInViewCount >= 2 || aosSignal) {
      const at = code.search(/\bwhileInView\b|\bdata-aos\b|\bAOS\.init\s*\(/);
      push('SCROLL_REVEAL_SATURATION', Math.max(0, at), `Scroll-reveal saturation (${whileInViewCount >= 2 ? `${whileInViewCount} whileInView reveals` : 'AOS reveals'}) hides content until JavaScript runs.`);
    } else if (observerReveal) {
      push('SCROLL_REVEAL_SATURATION', Math.max(0, code.search(/\buseInView\s*\(|\bIntersectionObserver\b/)), 'Scroll-triggered reveal starts from opacity 0 and hides content until the observer runs.');
    }
  }

  // MOT-09: Autoplay motion without a pause control (WCAG 2.2.2 Pause, Stop, Hide)
  const hasPauseControl = /(?:aria-label|title|alt)\s*=\s*["'][^"']*\bpause\b|\bpauseOnHover\b|\btogglePause\b|\bisPaused\b|animationPlayState|<button[^>]*>\s*Pause\b/i.test(code);
  if (!hasPauseControl) {
    for (const tag of tags) {
      const classes = classesFor(tag).join(' ');
      const raw = code.slice(tag.start, tag.end);
      const marqueeClass = /(?:^|[\s:])(?:animate-(?:marquee|ticker)|marquee|ticker)\b/i.test(classes);
      const isMarquee = tag.name === 'marquee' || marqueeClass || /\bdata-marquee\b/.test(raw);
      const autoplayVideo = tag.name === 'video' && /\b(?:autoPlay|autoplay)\b/.test(raw) && /\bloop\b/.test(raw) && !/\bcontrols\b/.test(raw);
      if (isMarquee) push('AUTOPLAY_MOTION_WITHOUT_CONTROL', tag.start, 'Automatically running marquee/ticker motion offers no pause control; WCAG 2.2.2 requires one for motion over five seconds.');
      else if (autoplayVideo) push('AUTOPLAY_MOTION_WITHOUT_CONTROL', tag.start, 'Looping autoplay video offers no pause control; WCAG 2.2.2 requires one for motion over five seconds.');
    }
    if (/\bautoplay\s*=\s*\{\{/.test(code) && /\bloop\b/.test(code)) {
      push('AUTOPLAY_MOTION_WITHOUT_CONTROL', Math.max(0, code.search(/\bautoplay\s*=\s*\{\{/)), 'Carousel autoplay with looping slides has no pause control; add a keyboard-operable pause (WCAG 2.2.2).');
    }
  }

  // MOT-10: Flashing or strobe animation (WCAG 2.3.1 Three Flashes or Below Threshold)
  const flashKeyframes = /@keyframes\s+(?:blink|flash|strobe)\b/i.exec(scan.masked);
  const flashAnimation = /\banimation(?:-name)?\s*:\s*['"]?(?:blink|flash|strobe)\b/i.exec(scan.masked);
  const flashToken = tags.find(tag => classesFor(tag).some(token => /^animate-\[[^\]]*(?:blink|flash|strobe)/i.test(token)));
  if (flashKeyframes || flashAnimation || flashToken) {
    const at = flashKeyframes?.index ?? flashAnimation?.index ?? flashToken?.start ?? 0;
    push('FLASHING_ANIMATION', at, 'Flashing or strobe animation detected; rapid light-to-dark alternation risks seizures (WCAG 2.3.1).');
  }

  // MOT-11: Entrance from scale(0)
  for (const tag of tags) {
    const initial = tag.attributes.get('initial');
    if (initial && /\bscale\s*:\s*0(?:\s*[,}])/.test(initial.value)) {
      push('SCALE_FROM_ZERO', initial.valueStart, 'Entrance starts at scale(0); begin at 0.9-0.96 so the element reads as a shape, not a pop-in.');
    }
  }
  const keyframeScaleZero = /@keyframes[^{]*\{(?:[^{}]|\{[^{}]*\})*?\bfrom\s*\{[^}]*scale\(\s*0(?:\s*,\s*0)?\s*\)/i.exec(scan.masked);
  if (keyframeScaleZero) push('SCALE_FROM_ZERO', keyframeScaleZero.index ?? 0, 'Entrance keyframe starts at scale(0); begin at 0.9-0.96 to avoid a pop-in.');
  for (const { tag, tokens } of tagClasses) {
    if (!tokens.includes('scale-0')) continue;
    if (tokens.some(t => /^(?:hover|group-hover|active|focus):|^animate-|^transition|^duration-/.test(t))) {
      push('SCALE_FROM_ZERO', tag.start, 'Animated state starts at scale(0); begin at 0.9-0.96 so the element reads as a shape.');
    }
  }

  // MOT-12: CSS loop without a reduced-motion guard
  const progressAffordance = /\brole\s*=\s*["'](?:status|progressbar)["']|\baria-busy\b|Spinner|Loader|Loading|Skeleton/.test(code);
  const cssInfinite = /\binfinite\b/.test(scan.masked) && (/@keyframes\b/.test(scan.masked) || /\banimation(?:-name)?\s*:/.test(scan.masked));
  const tailwindLoop = tags.some(tag => classesFor(tag).some(t => /^animate-(?:bounce|pulse|ping|spin)$|^animate-\[[^\]]*infinite/.test(t)));
  const hasReducedGuard = /prefers-reduced-motion|useReducedMotion|MotionConfig|reducedMotion|motion-safe:|motion-reduce:/.test(code);
  if (!hasReducedGuard && !progressAffordance && (cssInfinite || tailwindLoop)) {
    push('CSS_LOOP_NO_REDUCED_GUARD', Math.max(0, code.search(/@keyframes\b|\banimate-|\banimation(?:-name)?\s*:/)), 'Looping CSS animation has no prefers-reduced-motion fallback; add an @media (prefers-reduced-motion: reduce) or motion-safe guard.');
  }

  // MOT-13: Vestibular-risk parallax, background attachment, or 3D tilt (WCAG 2.3.3)
  const parallaxSignal = /\bbackground-attachment\s*:\s*fixed\b|\bbg-fixed\b|\bdata-parallax\b|\bparallax\b/i.exec(code);
  if (parallaxSignal) push('VESTIBULAR_RISK_MOTION', parallaxSignal.index ?? 0, 'Full-area parallax or fixed background motion can trigger vestibular symptoms; keep it subtle, small, and reduced-motion guarded (WCAG 2.3.3).');
  for (const { tag, tokens } of tagClasses) {
    const joined = tokens.join(' ');
    const tiltToken = tokens.some(t => /^(?:hover|group-hover|focus):rotate-[xy]-|^rotate-[xy]-\d+$/.test(t));
    const perspective = tokens.some(t => /^perspective-|^transform-3d$|^transform-style-3d$/.test(t));
    if (tiltToken && perspective) {
      push('VESTIBULAR_RISK_MOTION', tag.start, '3D tilt on hover moves a large surface; guard it with reduced motion and keep the tilt small (WCAG 2.3.3).');
    }
    const styleAttr = tag.attributes.get('style');
    if (styleAttr && /perspective\(/i.test(styleAttr.value) && /rotate[XY]\(/i.test(styleAttr.value)) {
      push('VESTIBULAR_RISK_MOTION', styleAttr.valueStart, 'Inline 3D tilt can trigger vestibular symptoms; guard it with reduced motion (WCAG 2.3.3).');
    }
    if (/\bgroup-hover:-translate-[xy]-/.test(joined) && !INTERACTIVE_TAGS.has(tag.name)) {
      push('VESTIBULAR_RISK_MOTION', tag.start, 'Group-hover travel moves a whole surface on hover; scope it to an interactive element and keep the distance small.');
    }
  }

  // MOT-14: Hover lift/scale on a non-interactive surface
  for (const { tag, tokens } of tagClasses) {
    const lift = tokens.find(t => /^(?:hover|group-hover):-?translate-y-|^hover:scale-1(?:0[2-9]|[1-9]\d|[2-9]\d\d)$/.test(t));
    if (!lift) continue;
    if (INTERACTIVE_TAGS.has(tag.name) || tag.attributes.has('onClick') || tag.attributes.has('role') || tag.attributes.has('href')) continue;
    const insideInteractive = ancestorsOf(tag).some(a => INTERACTIVE_TAGS.has(a.name) || a.attributes.has('onClick') || a.attributes.has('href'));
    if (!insideInteractive) {
      push('UNEARNED_HOVER_LIFT', tag.start, `Hover motion ("${lift}") on a non-interactive <${tag.name}> promises a click that never happens.`);
    }
  }

  // MOT-15: Uniform entrance motion. One identical faded rise on four or more elements,
  // or any mount animation on static reading content, is the page-builder default.
  const READING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'nav']);
  const startsHidden = (value: string) => /\bopacity\s*:\s*0(?:\.0+)?\b/.test(value);
  const entrances = new Map<string, { at: number; count: number }>();
  let readingEntrance: number | null = null;
  for (const tag of tags) {
    const initial = tag.attributes.get('initial');
    if (initial && startsHidden(initial.value) && READING_TAGS.has(tag.name.split('.').pop() || '')) readingEntrance ??= initial.valueStart;
    if (!initial || !startsHidden(initial.value) || tag.attributes.has('whileInView')) continue; // MOT-08 owns scroll reveals
    const animate = tag.attributes.get('animate')?.value;
    if (!animate) continue;
    const signature = `${initial.value}|${animate}`.replace(/\s+/g, ' ').trim();
    const entry = entrances.get(signature);
    if (entry) entry.count++;
    else entrances.set(signature, { at: tag.start, count: 1 });
  }
  if (readingEntrance !== null) {
    push('UNIFORM_ENTRANCE_MOTION', readingEntrance, 'Entrance animation on static reading content delays the first paint; render headings, paragraphs, and navigation visible and animate one thing that matters.');
  }
  const uniformEntrance = [...entrances.values()].find(entry => entry.count >= 4);
  if (uniformEntrance) {
    push('UNIFORM_ENTRANCE_MOTION', uniformEntrance.at, `${uniformEntrance.count} elements share one identical entrance; keep one restrained reveal instead of a template fade-up applied to every block.`);
  }

  // MOT-16: Overshoot/elastic easing on routine UI motion (cubic-bezier y outside 0-1).
  // Masked source covers CSS and inline styles; class tokens cover Tailwind arbitrary values.
  const bezierRe = /cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)/g;
  const overshoot = (match: RegExpMatchArray) => [match[2], match[4]].some(y => Number(y) > 1.05 || Number(y) < -0.05);
  const elasticAt = [...scan.masked.matchAll(bezierRe)].find(overshoot);
  const elasticClass = tagClasses.find(({ tokens }) => tokens.some(token => [...token.matchAll(bezierRe)].some(overshoot)));
  if (elasticAt || elasticClass) {
    const tokenMatch = elasticClass ? [...elasticClass.tokens.join(' ').matchAll(bezierRe)][0] : undefined;
    const bezier = elasticAt?.[0] ?? tokenMatch?.[0] ?? '';
    if (bezier) {
      push('ELASTIC_UI_EASING', elasticAt?.index ?? elasticClass?.tag.start ?? 0, `Overshoot easing "${bezier}" makes a routine surface bounce; routine UI enters on ease-out and overshoot stays on one small expressive icon.`);
    }
  }

  // MOT-17: will-change left on permanently instead of hinted around one animation.
  const willChangeDeclarations = [...scan.masked.matchAll(/will-?change\s*:\s*(?!\s*['"]?auto\b)/gi)];
  const willChangeTokens = tagClasses.reduce((count, { tokens }) => count + tokens.filter(token => /^will-change-(?!auto$)/.test(token)).length, 0);
  const willChangeCount = willChangeDeclarations.length + willChangeTokens;
  if (willChangeCount >= 3) {
    const willChangeAt = willChangeDeclarations[0]?.index ?? tags.find(tag => classesFor(tag).some(token => /^will-change-(?!auto$)/.test(token)))?.start ?? 0;
    push('WILL_CHANGE_LEAK', willChangeAt, `will-change is declared ${willChangeCount} times and left on permanently; hint the layer just before a known animation and remove it after.`);
  }

  // MOT-18: A duration outside the motion scale declared in DESIGN.md.
  if (motionContract?.slow) {
    const slowLimit = motionContract.slow;
    for (const { tag, tokens } of tagClasses) {
      const offContract = tokens.find(token => {
        const ms = durationMs(token);
        return ms !== null && ms > slowLimit + 50;
      });
      if (offContract) {
        push('OFF_CONTRACT_MOTION', tag.start, `Duration "${offContract}" is outside the declared motion scale (slow ${slowLimit}ms).`);
      }
    }
  }

  const ignoreFile = allComments.some(c => /sloppy-ignore-file/.test(c.text));
  // `sloppy-allow-file` exempts named rules only, so reference specimens keep
  // protection against every other anti-pattern.
  const allowFile = allComments.map(c => c.text.match(/sloppy-allow-file\s*[:,]?\s*([A-Za-z0-9_,\s-]+)/)).find(Boolean);
  const rawAllowed = (allowFile?.[1] ?? '').split(/[,\s]+/).filter(Boolean);
  const allowedRules = new Set<string>();
  for (const raw of rawAllowed) {
    const norm = raw.trim().toUpperCase().replace(/-/g, '_');
    const dashNorm = raw.trim().toUpperCase();
    const resolved = RULE_ALIASES[norm] || RULE_ALIASES[dashNorm] || norm;
    allowedRules.add(resolved);
    const code = CANONICAL_RULES[resolved as SlopViolationType]?.ruleId;
    if (code) allowedRules.add(code);
  }
  const violations: SlopViolation[] = []; let suppressedCount = 0;
  for (const c of candidates.sort((a,b) => a.at-b.at || a.type.localeCompare(b.type))) {
    const ruleCode = CANONICAL_RULES[c.type]?.ruleId;
    const ruleOverride = config?.rules?.[c.type] ?? (ruleCode ? config?.rules?.[ruleCode] : undefined);
    if (ruleOverride === 'off') { suppressedCount++; continue; }
    const tier = CANONICAL_RULES[c.type]?.tier || 'reflex';
    if (options.floorOnly && tier !== 'floor') continue;
    if (options.tier && tier !== options.tier) continue;

    const isCodeRule = ruleCode?.startsWith('COD-') || c.type.startsWith('COD_') || c.type === 'AI_NARRATION_COMMENT_SLOP' || c.type === 'CHAINED_TYPE_ASSERTION' || c.type === 'UNVALIDATED_DYNAMIC_RETURN' || c.type === 'BROAD_RECORD_SLOP' || c.type === 'EMPTY_OBJECT_SPREAD' || c.type === 'NON_NULL_ASSERTION_SLOP';
    if (options.codeOnly && !isCodeRule) continue;

    const loc = sourceLocation(scan, c.at), lineText = lineAt(scan, code, loc.line);

    const cleanCommentBody = (rawComment: string): string => {
      let s = rawComment.trim();
      if (s.startsWith('//')) s = s.slice(2);
      else if (s.startsWith('/*')) {
        s = s.slice(2);
        if (s.endsWith('*/')) s = s.slice(0, -2);
      }
      return s.trim();
    };
    const splitDirectiveReason = (rest: string): { target: string; reason: string } => {
      const dashIdx = rest.indexOf('--');
      const colonIdx = rest.indexOf(':');
      let sepIdx = -1;
      let sepLen = 1;
      if (dashIdx >= 0 && (colonIdx < 0 || dashIdx < colonIdx)) { sepIdx = dashIdx; sepLen = 2; }
      else if (colonIdx >= 0) { sepIdx = colonIdx; sepLen = 1; }
      if (sepIdx < 0) return { target: rest.trim(), reason: '' };
      return { target: rest.slice(0, sepIdx).trim(), reason: rest.slice(sepIdx + sepLen).trim() };
    };

    // Check for inline override rationale: // sloppy-override: RULE <rationale>
    let inlineRationale: string | undefined;
    for (const comment of allComments) {
      const cl = comment.line;
      if (cl === loc.line || cl + 1 === loc.line) {
        const body = cleanCommentBody(comment.text);
        const markerMatch = /(?:sloppy-override|@sloppy-override)/i.exec(body);
        if (markerMatch) {
          let rest = body.slice(markerMatch.index + markerMatch[0].length).replace(/^[:,]/, '').trim();
          const wsIdx = rest.search(/\s/);
          if (wsIdx > 0) {
            const ruleCandidate = rest.slice(0, wsIdx).trim().toUpperCase().replace(/-/g, '_');
            const resolved = RULE_ALIASES[ruleCandidate] || ruleCandidate;
            if (resolved === c.type || (ruleCode && resolved === ruleCode)) {
              inlineRationale = rest.slice(wsIdx + 1).trim();
              break;
            }
          }
        }
      }
    }

    const configRationale = config?.overrules?.[c.type] || (ruleCode ? config?.overrules?.[ruleCode] : undefined);
    const hasRationale = Boolean(inlineRationale || configRationale);
    const rationale = inlineRationale || configRationale;
    const isOverruled = tier === 'reflex' && hasRationale;

    const isStrict = Boolean(options.strict || config?.strict);
    const ignored = ignoreFile || allowedRules.has(c.type) || (ruleCode && allowedRules.has(ruleCode)) || allComments.some(comment => {
      const cl = comment.line;
      const body = cleanCommentBody(comment.text);
      if (cl + 1 === loc.line) {
        const nextLineIdx = body.indexOf('sloppy-ignore-next-line');
        if (nextLineIdx >= 0) {
          const rest = body.slice(nextLineIdx + 'sloppy-ignore-next-line'.length).replace(/^[:,]/, '').trim();
          const { target, reason } = splitDirectiveReason(rest);
          if (isStrict && reason.length < 5) return false;
          if (!target) return true;
          const rules: string[] = target.split(/[,\s]+/).map(r => {
            const norm = r.trim().toUpperCase().replace(/-/g, '_');
            const dashNorm = r.trim().toUpperCase();
            return RULE_ALIASES[norm] || RULE_ALIASES[dashNorm] || norm;
          });
          return rules.includes(c.type) || (ruleCode ? rules.includes(ruleCode) : false);
        }
        const nextIdx = body.indexOf('sloppy-ignore-next');
        if (nextIdx >= 0) {
          const rest = body.slice(nextIdx + 'sloppy-ignore-next'.length).trim();
          const { reason } = splitDirectiveReason(rest);
          return !isStrict || reason.length >= 5;
        }
      }
      if (cl === loc.line) {
        const inlineIdx = body.indexOf('sloppy-ignore');
        if (inlineIdx >= 0 && !body.includes('sloppy-ignore-next') && !body.includes('sloppy-ignore-file')) {
          const rest = body.slice(inlineIdx + 'sloppy-ignore'.length).trim();
          if (!rest) return !isStrict;
          const { reason } = splitDirectiveReason(rest);
          return !isStrict || reason.length >= 5;
        }
      }
      return false;
    });
    if (ignored) { suppressedCount++; continue; }
    const snippet = lineText.trim().slice(0,160);
    const metadata = RULE_METADATA[c.type];
    const standardKind = metadata?.evidenceKinds.includes('standard');
    const kind = standardKind ? 'standard' : (metadata?.evidenceKinds[0] ?? 'source');
    const criteria: Partial<Record<SlopViolationType, string>> = {
      LOW_CONTRAST_GRAY: 'WCAG 1.4.3 Contrast (Minimum)',
      FAKE_CONTROL_SLOP: 'WCAG 4.1.2 Name, Role, Value / 2.1.1 Keyboard',
      SCROLL_HIJACKING: 'WCAG 2.1.1 Keyboard',
      REDUCED_MOTION_BLINDNESS: 'WCAG 2.3.3 Animation from Interactions'
    };
    const evidence: FindingEvidence = {
      kind,
      description: c.message,
      file: options.filepath,
      line: loc.line,
      column: loc.column,
      selector: selectorAt(c.at),
      ...(c.evidence ?? {})
    };
    if (kind === 'standard' && criteria[c.type]) evidence.criterion = criteria[c.type];
    const violation: SlopViolation = {
      id: `${(ruleCode || c.type).toLowerCase()}-${c.at}`,
      ruleId: ruleCode || c.type,
      type: c.type,
      severity: c.severity,
      tier,
      line: loc.line,
      column: loc.column,
      snippet,
      message: c.message,
      recommendation: advice[c.type],
      confidence: metadata?.confidence ?? 'medium',
      objective: metadata?.objective ?? false,
      evidence,
      overruled: isOverruled,
      overruleRationale: rationale
    };
    if (c.context) violation.context = c.context;
    violations.push(violation);
  }

  // Assign sequential 1-based index to all findings for approval-gated surgical fixes
  let findingIdx = 1;
  for (const v of violations) {
    v.index = findingIdx++;
  }

  const activeViolations = violations.filter(v => !v.overruled);
  const totalWeight = activeViolations.reduce((sum,v) => sum + severity[v.severity],0);
  const score = activeViolations.length ? Math.max(0,Math.min(100,Math.round(100 * (1 - Math.exp(-totalWeight / 55))))) : 0;
  const count = (level: SlopSeverity) => activeViolations.filter(v => v.severity === level).length;
  const byRule: Partial<Record<SlopViolationType,number>> = {};
  const byConfidence = { high: 0, medium: 0, low: 0 };
  const byEvidenceKind: Partial<Record<FindingEvidence['kind'], number>> = {};
  for (const v of violations) {
    byRule[v.type] = (byRule[v.type] || 0) + 1;
    byConfidence[v.confidence]++;
    byEvidenceKind[v.evidence.kind] = (byEvidenceKind[v.evidence.kind] || 0) + 1;
  }
  const remediationPlan = Array.from(new Set([...activeViolations].sort((a,b) => severity[b.severity]-severity[a.severity]).map(v => advice[v.type])));

  const floorViolations = violations.filter(v => v.tier === 'floor');
  const reflexViolations = violations.filter(v => v.tier === 'reflex');
  const finishViolations = violations.filter(v => v.tier === 'finish');
  const objectiveViolations = violations.filter(v => v.objective);
  const craftViolations = violations.filter(v => !v.objective);
  const overruledViolations = violations.filter(v => v.overruled);

  const passedFloor = floorViolations.length === 0;
  const passedReflex = reflexViolations.every(v => v.overruled);
  const isSlopFree = passedFloor && passedReflex && finishViolations.length === 0;

  let summary = 'Pristine craft: zero AI slop detected.';
  if (!passedFloor) {
    summary = `[FLOOR GATE BLOCKED] ${floorViolations.length} critical accessibility/soundness issue(s) detected.`;
  } else if (!passedReflex) {
    const unoverruled = reflexViolations.filter(v => !v.overruled).length;
    summary = `[REFLEX GATE BLOCKED] ${unoverruled} AI default(s) require explicit rationale or cleanup.`;
  } else if (violations.length > 0) {
    summary = `Craft approved with ${overruledViolations.length} justified override(s) and ${finishViolations.length} finish suggestion(s).`;
  }

  let reportPath: string | undefined;
  if (options.report || options.mode === 'after') {
    reportPath = generateAuditReport(options.filepath || 'specimen.tsx', violations, {
      slopScore: score,
      passedFloor,
      passedReflex,
      floorViolations,
      reflexViolations,
      finishViolations,
      overruledViolations,
      objectiveViolations,
      craftViolations
    });
  }

  return {
    filepath: options.filepath,
    slopScore: score,
    isSlopFree,
    passedFloor,
    passedReflex,
    violations,
    floorViolations,
    reflexViolations,
    finishViolations,
    objectiveViolations,
    craftViolations,
    overruledViolations,
    stats: {
      totalViolations: violations.length,
      floorCount: floorViolations.length,
      reflexCount: reflexViolations.length,
      finishCount: finishViolations.length,
      overruledCount: overruledViolations.length,
      criticalCount: count('critical'),
      highCount: count('high'),
      mediumCount: count('medium'),
      objectiveCount: objectiveViolations.length,
      craftCount: craftViolations.length,
      estimatedWordCount: wordCount,
      byRule,
      byConfidence,
      byEvidenceKind,
      suppressedCount
    },
    summary,
    remediationPlan,
    reportPath,
    designContract
  };
}

export function generateAuditReport(
  filepath: string,
  violations: SlopViolation[],
  meta: {
    slopScore: number;
    passedFloor: boolean;
    passedReflex: boolean;
    floorViolations: SlopViolation[];
    reflexViolations: SlopViolation[];
    finishViolations: SlopViolation[];
    overruledViolations: SlopViolation[];
    objectiveViolations: SlopViolation[];
    craftViolations: SlopViolation[];
  }
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `audit-001-${dateStr}.md`;
  let reportPath = filename;

  const lines: string[] = [
    `# Sloppy Numbered Audit Report (After-Mode Approval Gate)`,
    ``,
    `- **Date**: ${dateStr}`,
    `- **Target File**: \`${filepath}\``,
    `- **Slop Score**: ${meta.slopScore}/100`,
    `- **Floor Gates**: ${meta.floorViolations.length} blockers (${meta.passedFloor ? 'PASSED' : 'FAILED - CI BLOCKER'})`,
    `- **Reflex Gates**: ${meta.reflexViolations.length} AI defaults (${meta.overruledViolations.length} justified with written rationale)`,
    `- **Finish Polish**: ${meta.finishViolations.length} advisory suggestions`,
    `- **Objective Defects**: ${meta.objectiveViolations.length}`,
    `- **Craft Judgments**: ${meta.craftViolations.length}`,
    ``,
    `---`,
    ``,
    `## Numbered Audit Findings`,
    ``
  ];

  if (violations.length === 0) {
    lines.push(`Zero AI slop detected. The codebase meets certified craft standards.`);
  } else {
    lines.push(`| Item | Tier | Rule | Confidence | Evidence | Location | Code Snippet | Remedy |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
    for (const v of violations) {
      const idx = v.index || 1;
      const tierBadge = v.tier ? v.tier.toUpperCase() : 'REFLEX';
      const loc = v.line ? `Line ${v.line}` : '-';
      const escapeCell = (raw: string) => raw.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
      const snippet = escapeCell(v.snippet || '').slice(0, 50);
      const rec = escapeCell(v.recommendation || '');
      const evidence = `${v.confidence}/${v.evidence.kind}${v.objective ? '/objective' : '/craft'}${v.evidence.criterion ? ` (${v.evidence.criterion})` : ''}`;
      lines.push(`| **#${idx}** | \`${tierBadge}\` | \`${v.ruleId}\` (${v.type}) | ${v.confidence} | ${evidence} | ${loc} | \`${snippet}\` | ${rec} |`);
    }

    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`## Approval-Gated Fix Execution`);
    lines.push(``);
    lines.push(`Approval is required before modifying code. Review findings above, then execute:`);
    lines.push(``);
    lines.push(`\`\`\`bash`);
    lines.push(`# Surgically auto-fix only approved item numbers:`);
    lines.push(`sloppy fix ${filepath} --only 1,2 --write`);
    lines.push(``);
    lines.push(`# Or fix by specific rule IDs:`);
    lines.push(`sloppy fix ${filepath} --only VIS-02,COD-01 --write`);
    lines.push(`\`\`\``);
  }

  try {
    const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '/';
    const { fs, path: pathMod } = getNodeEnv();
    if (fs && pathMod) {
      reportPath = pathMod.resolve(cwd, filename);
      fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
    }
  } catch {}
  return reportPath;
}
