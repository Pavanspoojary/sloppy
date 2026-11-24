import { AuditOptions, AuditResult, SlopViolation, SlopViolationType, SlopSeverity, CANONICAL_RULES, RULE_ALIASES } from './types.js';
import { classTokens, getClasses, scanSource, sourceLocation, SourceTag } from './source-scan.js';
import { loadSloppyConfig } from './config.js';
import { DEFAULT_BLUR_CAP, declaredAccentAllows, resolveDesignContract } from './design-contract.js';

export * from './types.js';
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
  NON_NULL_ASSERTION_SLOP: 'Use optional chaining ("?.") or defensive null checks instead of chained non-null assertions ("!.").'
};

export function isAiNarrationComment(text: string): { isSlop: boolean; reason?: string } {
  const trimmed = text.trim();
  if (/sloppy-ignore|sloppy-allow|sloppy-override|@sloppy|eslint|@ts-|istanbul|prettier/i.test(trimmed)) {
    return { isSlop: false };
  }
  if (/^(?:\/\/|\/\*)\s*(?:invariant|workaround|safari|firefox|chrome|ios|android|todo|fixme|note|hack|perf|see:?|ref:?)\b/i.test(trimmed)) {
    return { isSlop: false };
  }
  if (/^(?:\/\/|\/\*)\s*[-=_*#~]{5,}\s*(?:[A-Za-z0-9_\s-]*\s*[-=_*#~]{5,})?\s*\*?\/?$/.test(trimmed)) {
    return { isSlop: true, reason: 'Decorative divider banner comment' };
  }
  const singleLineMatch = trimmed.match(/^\/\/\s*([^\n]+)$/);
  if (singleLineMatch) {
    const content = singleLineMatch[1].trim();
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
  const m = token.match(/^(?:text|bg)-(white|black|(?:neutral|gray|zinc|slate|stone)-(50|100|200|300|400|500|600|700|800|900|950))$/);
  if (!m) { colorCache.set(token, undefined); return; }
  if (m[1] === 'white') { colorCache.set(token, [255,255,255]); return [255,255,255]; } if (m[1] === 'black') { colorCache.set(token, [0,0,0]); return [0,0,0]; }
  const shade = Number(m[2]);
  const palettes: Record<string, Record<number, string>> = {
    neutral: {50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a'},
    gray: {50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827',950:'#030712'},
    zinc: {50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b',950:'#09090b'},
    slate: {50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617'},
    stone: {50:'#fafaf9',100:'#f5f5f4',200:'#e7e5e4',300:'#d6d3d1',400:'#a8a29e',500:'#78716c',600:'#57534e',700:'#44403c',800:'#292524',900:'#1c1917',950:'#0c0a09'}
  };
  const name = m[1].split('-')[0], hex = palettes[name]?.[shade], result = hex ? [1,3,5].map(i => parseInt(hex.slice(i, i + 2), 16)) : undefined; colorCache.set(token,result); return result;
}
function has(tokens: string[], re: RegExp): boolean { return tokens.some(t => re.test(t)); }
function spacingAtLeastFour(token: string, prefix: string): boolean { const match = token.match(new RegExp(`^${prefix}-(\\d+(?:\\.\\d+)?)$`)); return !!match && Number(match[1]) >= 4; }
function textFromSource(code: string, tags: SourceTag[]): string {
  const parts: string[] = []; let cursor = 0, depth = 0;
  // Only JSX text and single string literals render. Code inside expression
  // containers is discarded, including nested callbacks and inline comments.
  const visible = (chunk: string) => {
    const out: string[] = []; let i = 0;
    while (i < chunk.length) {
      const next = chunk.indexOf('{', i);
      if (next < 0) { out.push(chunk.slice(i)); break; }
      out.push(chunk.slice(i, next));
      let braces = 1, j = next + 1, quote = '';
      for (; j < chunk.length && braces > 0; j++) {
        const c = chunk[j];
        if (quote) { if (c === '\\') j++; else if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'" || c === '`') quote = c;
        else if (c === '{') braces++;
        else if (c === '}') braces--;
      }
      const expression = chunk.slice(next + 1, j - 1);
      if (!expression.trim().startsWith('/*')) {
        const literal = expression.trim().match(/^(['"`])([\s\S]*)\1$/);
        if (literal) out.push(` ${literal[2]} `);
      }
      i = j;
    }
    return out.join('');
  };
  for (const tag of tags) {
    if (depth > 0) parts.push(visible(code.slice(cursor, tag.start)));
    if (tag.closing) depth = Math.max(0, depth - 1);
    else if (!tag.selfClosing) depth++;
    cursor = tag.end;
  }
  return parts.join('').replace(/https?:\/\/\S+/g, ' ');
}

export function auditCode(code: string, options: AuditOptions = {}): AuditResult {
  const config = options.config || (options.filepath ? loadSloppyConfig(options.filepath) : null);
  const scan = scanSource(code), tags = scan.tags.filter(t => !t.closing), candidates: Array<{ type: SlopViolationType; severity: SlopSeverity; at: number; message: string }> = [];
  const parent = new Map<SourceTag, SourceTag | undefined>(), openStack: SourceTag[] = [];
  for (const tag of scan.tags) {
    if (tag.closing) { for (let i = openStack.length - 1; i >= 0; i--) if (openStack[i].name === tag.name) { openStack.length = i; break; } }
    else { parent.set(tag, openStack[openStack.length - 1]); if (!tag.selfClosing) openStack.push(tag); }
  }
  const ancestorsOf = (tag: SourceTag): SourceTag[] => { const found: SourceTag[] = []; let current = parent.get(tag); while (current) { found.push(current); current = parent.get(current); } return found; };
  const push = (type: SlopViolationType, at: number, message: string, level?: SlopSeverity) => {
    const defaultLevel = CANONICAL_RULES[type]?.defaultSeverity ?? 'medium';
    candidates.push({ type, severity: level ?? defaultLevel, at, message });
  };
  const tagClasses = tags.map(tag => ({ tag, tokens: getClasses(tag) }));
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
  const importAliases = new Map<string,string>();
  for (const m of code.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'][^"']+["']/g)) for (const part of m[1].split(',')) { const [original, alias] = part.trim().split(/\s+as\s+/); if (original && alias) importAliases.set(alias, original); }
  const iconNames = /^(?:Sparkles|LucideSparkles|Wand|MagicWand|Sparkle|IconSparkles|AiSparkle|SparkleIcon|MagicWand02)$/;
  for (const tag of tags) if (!tag.closing) { const base = tag.name.split('.').pop() || ''; if (iconNames.test(base) || iconNames.test(importAliases.get(base) || '')) push('SPARKLE_ICON_OVERLOAD', tag.start, `Decorative sparkle or magic-wand component <${tag.name}> detected.`); }
  const visibleText = textFromSource(code, scan.tags);
  const phrases = /Powered\s+by\s+AI|AI[- ]Powered|Smart\s+AI|Magical\s+AI|AI\s+Assistant|AI\s+Generated|Generate\s+with\s+AI|Supercharge\b[^.\n]{0,50}\bAI\b|\u{2728}/igu;
  let phrase: RegExpExecArray | null; while ((phrase = phrases.exec(visibleText))) { const at = code.indexOf(phrase[0]); push('MADE_UP_AI_BADGE', Math.max(0, at), `Made-up AI marketing phrase "${phrase[0]}" detected.`); }
  const cliches = /\b(?:Unlock\s+the\s+power\s+of|Supercharge\s+your\s+(?:workflow|productivity|team|growth)|Seamless(?:ly)?\s+(?:integrate|connect|automate)|10x\s+your\s+(?:productivity|growth|output)|Revolutionize\s+the\s+way)\b/igu;
  let clicheMatch: RegExpExecArray | null; while ((clicheMatch = cliches.exec(visibleText))) { const at = code.indexOf(clicheMatch[0]); push('AI_COPY_CLICHE', Math.max(0, at), `Generic AI marketing cliché "${clicheMatch[0]}" detected.`); }
  const negativeParallelism = /\b(?:not\s+just\s+[^,.!?\n]{2,40}[,—-]\s*(?:it['’]s|but)\b|\bnot\s+a\s+[^,.!?\n]{2,30}[,—-]\s*it['’]s\b)/igu;
  let npMatch: RegExpExecArray | null; while ((npMatch = negativeParallelism.exec(visibleText))) { const at = code.indexOf(npMatch[0]); push('NEGATIVE_PARALLELISM', Math.max(0, at), `Negative parallelism copy cliché ("${npMatch[0].trim()}") detected.`); }
  const socialProof = /\b(?:(?:(?:[1-9][0-9]{0,2}(?:,\d{3})+|\d+(?:\.\d+)?[kKMB])\+\s*(?:users?|customers?|teams?|companies|developers)|(?:99\.99?%|100%)\s*(?:uptime|guarantee)|Loved\s+by\s+(?:thousands|millions)|Rated\s+5(?:\.0)?\s*(?:\/|out\s+of)\s*5\s*stars?))\b/igu;
  let spMatch: RegExpExecArray | null; while ((spMatch = socialProof.exec(visibleText))) { const at = code.indexOf(spMatch[0]); push('FABRICATED_SOCIAL_PROOF', Math.max(0, at), `Fabricated social proof metric "${spMatch[0].trim()}" detected.`); }
  const chatbotPhrases = /\b(?:I\s+hope\s+this\s+helps[!.]?|In\s+conclusion,\s+|Overall,\s+(?:it|this)\s+|Let\s+me\s+know\s+if\s+you\s+(?:need|have)|It['’]s\s+important\s+to\s+note\s+that)\b/igu;
  let cbMatch: RegExpExecArray | null; while ((cbMatch = chatbotPhrases.exec(visibleText))) { const at = code.indexOf(cbMatch[0]); push('CHATBOT_SIGN_OFF_SLOP', Math.max(0, at), `Leftover chatbot conversational phrasing "${cbMatch[0].trim()}" detected.`); }
  const loremIpsum = /\b(?:lorem\s+ipsum|dolor\s+sit\s+amet|consectetur\s+adipiscing|sed\s+do\s+eiusmod|john\s+doe|jane\s+doe)\b/igu;
  let liMatch: RegExpExecArray | null; while ((liMatch = loremIpsum.exec(visibleText))) { const at = code.indexOf(liMatch[0]); push('LOREM_IPSUM_SLOP', Math.max(0, at), `Placeholder copy or filler name "${liMatch[0].trim()}" detected.`); }
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  let emojiMatch: RegExpExecArray | null;
  while ((emojiMatch = emojiRegex.exec(visibleText))) {
    const at = code.indexOf(emojiMatch[0]);
    push('EMOJI_ICON_SLOP', Math.max(0, at), `Raw emoji "${emojiMatch[0]}" detected in UI text instead of an SVG icon.`);
  }
  for (const match of code.matchAll(/\bhref\s*=\s*["']#["']/g)) { push('DEAD_PLACEHOLDER_SLOP', match.index ?? 0, 'Dead placeholder href="#" detected.'); }
  for (const match of code.matchAll(/\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g)) { push('DEAD_PLACEHOLDER_SLOP', match.index ?? 0, 'Empty dead click handler onClick={() => {}} detected.'); }
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
  const designContract = resolveDesignContract(options.filepath, config);
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
  if (emDashCount >= 3) push('AI_PROSE_FILLER', Math.max(0, code.search(/[—–]/)), `${emDashCount} em/en dashes in visible copy; use commas or parentheses where they belong.`);
  const adjectiveTriplet = /\b(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b\s*,\s*(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b\s*,\s*and\s+(?:innovative|transformative|groundbreaking|cutting-edge|revolutionary|seamless|powerful|intuitive|scalable|robust)\b/iu;
  const tripletMatch = visibleText.match(adjectiveTriplet);
  if (tripletMatch) push('AI_PROSE_FILLER', Math.max(0, code.indexOf(tripletMatch[0])), `Adjective triplet "${tripletMatch[0]}" detected.`);
  const falseRange = visibleText.match(/\branging\s+from\s+[^.\n]{2,40}\s+to\s+[^.\n]{2,40}/iu);
  if (falseRange) push('AI_PROSE_FILLER', Math.max(0, code.indexOf(falseRange[0])), `Formulaic false range "${falseRange[0].trim()}" detected.`);
  const vagueAttribution = visibleText.match(/\b(?:studies|research|experts|industry\s+reports?)\s+(?:show|shows|suggest|suggests|say|says|indicate|indicates)\b/iu);
  if (vagueAttribution) push('AI_PROSE_FILLER', Math.max(0, code.indexOf(vagueAttribution[0])), `Vague attribution "${vagueAttribution[0]}" detected.`);
  const spelledMetric = visibleText.match(/\b(?:across|for|with|in)\s+(?:three|four|five|six|seven|eight|nine|ten)\s+(?:tools|teams|steps|platforms|workflows|minutes|seconds)\b/iu);
  if (spelledMetric) push('AI_PROSE_FILLER', Math.max(0, code.indexOf(spelledMetric[0])), `Spelled-out metric "${spelledMetric[0]}" detected; use numerals in UI copy.`);

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
    const gradients = /(?:linear|radial|conic)-gradient\([^)]*\)/ig;
    for (const match of scan.masked.matchAll(gradients)) {
      const at = match.index ?? 0;
      if (containsPurpleColor(match[0]) && !candidates.some(v => v.type === 'PURPLE_GRADIENT_SLOP' && Math.abs(v.at - at) < 120)) {
        push('PURPLE_GRADIENT_SLOP', at, 'CSS gradient contains a purple-family color.');
      }
    }
  }
  const text = visibleText;
  const wordCount = (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || []).length;
  const limits = { illustration:12, 'feature-card':18, hero:32, application:150, bento:40 } as const;
  const configuredBudget = config?.wordBudget?.[options.componentType || 'default'];
  const threshold = configuredBudget ?? (options.componentType ? limits[options.componentType] : (config?.wordBudget?.default ?? 60));
  if (wordCount > threshold && !tags.some(tag => /^(?:Bar|Skeleton|Placeholder)$/.test(tag.name.split('.').pop() || ''))) push('WORD_BUDGET_EXCEEDED', tags[0]?.start ?? 0, `Visible word budget exceeded: ${wordCount} words, limit ${threshold}.`);
  const allComments = [...code.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g)].map(m => ({ text:m[0], at:m.index ?? 0 }));

  // COD-01: AI narration comments and decorative section divider banners
  for (const comment of allComments) {
    const check = isAiNarrationComment(comment.text);
    if (check.isSlop) {
      push('AI_NARRATION_COMMENT_SLOP', comment.at, `${check.reason || 'AI narration comment detected.'}`);
    }
  }

  // LIV-01: Sterile surface and missing liveliness check
  const interactiveControls = tags.filter(t => t.name === 'button' || (t.name === 'a' && t.attributes.has('href')));
  if (interactiveControls.length >= 2) {
    const hasMicroInteractions = interactiveControls.some(ctrl => {
      const tokens = getClasses(ctrl);
      return tokens.some(t => /^(?:hover:|focus:|active:|transition-|duration-|ease-)/.test(t));
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
  const dynamicReturnRegex = /(?:(?:async\s+)?function(?:\s+[A-Za-z0-9_$]+)?\s*\([^)]*\)|(?:async\s+)?[A-Za-z0-9_$]+\s*\([^)]*\)|[A-Za-z0-9_$]+\s*=\s*(?:async\s*)?\([^)]*\))\s*:\s*(?:Promise<\s*(?:any|unknown)\s*>|(?:any|unknown)\b)(?:\s*=>|\s*\{)/g;
  for (const match of scan.masked.matchAll(dynamicReturnRegex)) {
    const at = match.index ?? 0;
    push('UNVALIDATED_DYNAMIC_RETURN', at, `Unvalidated contract return type (${match[0].includes('any') ? 'any' : 'unknown'}) detected; specify a concrete shape or schema validator.`);
  }

  // COD-04: Broad Record<string, any/unknown>
  const broadRecordRegex = /\bRecord<\s*string\s*,\s*(?:any|unknown)\s*>/g;
  for (const match of scan.masked.matchAll(broadRecordRegex)) {
    const at = match.index ?? 0;
    push('BROAD_RECORD_SLOP', at, `Broad dictionary type "${match[0]}" erases type safety.`);
  }

  // COD-05: Conditional empty object spread: ...(cond ? { ... } : {})
  const emptyObjectSpreadRegex = /\.\.\.\s*\([^\n?]+\?[\s\S]*?:\s*\{\s*\}\s*\)/g;
  for (const match of scan.masked.matchAll(emptyObjectSpreadRegex)) {
    const at = match.index ?? 0;
    push('EMPTY_OBJECT_SPREAD', at, `Conditional empty object spread ("${match[0].trim().slice(0, 50)}") detected.`);
  }

  // COD-06: Chained non-null assertion (!.)
  const nonNullRegex = /\b[A-Za-z0-9_$]+!\.[A-Za-z0-9_$]+/g;
  for (const match of scan.masked.matchAll(nonNullRegex)) {
    const at = match.index ?? 0;
    push('NON_NULL_ASSERTION_SLOP', at, `Unsafe non-null assertion ("${match[0]}") detected; use optional chaining or defensive guard.`);
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

    const loc = sourceLocation(scan, c.at), lineText = code.split('\n')[loc.line - 1] || '';
    
    // Check for inline override rationale: // sloppy-override: RULE <rationale>
    let inlineRationale: string | undefined;
    for (const comment of allComments) {
      const cl = sourceLocation(scan, comment.at).line;
      if (cl === loc.line || cl + 1 === loc.line) {
        const match = comment.text.match(/(?:sloppy-override|@sloppy-override)\s*[:,]?\s*([A-Za-z0-9_,-]+)\s+([^\n*/]+)/);
        if (match) {
          const ruleCandidate = match[1].trim().toUpperCase().replace(/-/g, '_');
          const resolved = RULE_ALIASES[ruleCandidate] || ruleCandidate;
          if (resolved === c.type || (ruleCode && resolved === ruleCode)) {
            inlineRationale = match[2].trim();
            break;
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
      const cl = sourceLocation(scan, comment.at).line;
      if (cl + 1 === loc.line) {
        if (/sloppy-ignore-next-line/.test(comment.text)) {
          const specific = comment.text.match(/sloppy-ignore-next-line\s*[:,]?\s*([A-Za-z0-9_,\s-]+?)(?:\s*(?:--|:)\s*(.+))?$/);
          const rawRules = specific ? specific[1].trim() : '';
          const ignoreRationale = specific?.[2]?.trim();

          if (isStrict) {
            // In strict mode, an explicit written invariant explanation (>= 5 chars) is mandatory
            if (!ignoreRationale || ignoreRationale.length < 5) {
              return false;
            }
          }

          if (!rawRules) return true;
          const rules: string[] = rawRules.split(/[,\s]+/).map(r => {
            const norm = r.trim().toUpperCase().replace(/-/g, '_');
            const dashNorm = r.trim().toUpperCase();
            return RULE_ALIASES[norm] || RULE_ALIASES[dashNorm] || norm;
          });
          return rules.includes(c.type) || (ruleCode ? rules.includes(ruleCode) : false);
        }
        if (/sloppy-ignore-next/.test(comment.text)) {
          if (isStrict) {
            const match = comment.text.match(/sloppy-ignore-next\s*(?:--|:)\s*(.+)$/);
            if (!match || match[1].trim().length < 5) return false;
          }
          return true;
        }
      }
      if (/sloppy-ignore\s*(?:\*\/)?\s*$/.test(comment.text) && cl === loc.line) {
        if (isStrict) {
          const match = comment.text.match(/sloppy-ignore\s*(?:--|:)\s*(.+?)(?:\*\/)?$/);
          if (!match || match[1].trim().length < 5) return false;
        }
        return true;
      }
      return false;
    });
    if (ignored) { suppressedCount++; continue; }
    const snippet = lineText.trim().slice(0,160);
    violations.push({
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
      overruled: isOverruled,
      overruleRationale: rationale
    });
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
  for (const v of violations) byRule[v.type] = (byRule[v.type] || 0) + 1;
  const remediationPlan = Array.from(new Set([...activeViolations].sort((a,b) => severity[b.severity]-severity[a.severity]).map(v => advice[v.type])));

  const floorViolations = violations.filter(v => v.tier === 'floor');
  const reflexViolations = violations.filter(v => v.tier === 'reflex');
  const finishViolations = violations.filter(v => v.tier === 'finish');
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
      overruledViolations
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
      estimatedWordCount: wordCount,
      byRule,
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
    ``,
    `---`,
    ``,
    `## Numbered Audit Findings`,
    ``
  ];

  if (violations.length === 0) {
    lines.push(`Zero AI slop detected. The codebase meets certified craft standards.`);
  } else {
    lines.push(`| Item | Tier | Rule | Location | Code Snippet | Remedy |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
    for (const v of violations) {
      const idx = v.index || 1;
      const tierBadge = v.tier ? v.tier.toUpperCase() : 'REFLEX';
      const loc = v.line ? `Line ${v.line}` : '-';
      const snippet = (v.snippet || '').replace(/\|/g, '\\|').slice(0, 50);
      const rec = (v.recommendation || '').replace(/\|/g, '\\|');
      lines.push(`| **#${idx}** | \`${tierBadge}\` | \`${v.ruleId}\` (${v.type}) | ${loc} | \`${snippet}\` | ${rec} |`);
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
    const fs = (globalThis as any).process?.getBuiltinModule ? (globalThis as any).process.getBuiltinModule('node:fs') : null;
    const pathMod = (globalThis as any).process?.getBuiltinModule ? (globalThis as any).process.getBuiltinModule('node:path') : null;
    if (fs && pathMod) {
      reportPath = pathMod.resolve(cwd, filename);
      fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
    }
  } catch {}
  return reportPath;
}
