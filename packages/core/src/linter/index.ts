import { AuditOptions, AuditResult, SlopViolation, SlopViolationType, SlopSeverity } from './types.js';
import { classTokens, getClasses, scanSource, sourceLocation, SourceTag } from './source-scan.js';

export * from './types.js';
export * from './transform.js';
export * from './rubric.js';
export * from './repair-planner.js';

const severity: Record<SlopSeverity, number> = { critical: 40, high: 20, medium: 10, low: 4 };
const advice: Record<SlopViolationType, string> = {
  PURPLE_GRADIENT_SLOP: 'Replace purple-family gradients with a restrained surface palette and a purposeful accent.',
  SPARKLE_ICON_OVERLOAD: 'Replace decorative sparkle or magic-wand iconography with authentic product iconography.',
  UNEARNED_ANIMATION: 'Use looping motion only for explicit progress affordances; otherwise animate cause-driven state changes.',
  MADE_UP_AI_BADGE: 'Describe the product action or system state without generic AI marketing language.',
  BOXED_CARD_SYNDROME: 'Vary surface hierarchy with layout, spacing, and elevation instead of repeating identical cards.',
  UNANCHORED_FLOATING_WINDOW: 'Let the frame fill its stage and bleed through at least one boundary.',
  CENTER_ALIGNED_EVERYTHING: 'Reserve centered alignment for focal content and vary alignment in supporting layout.',
  LOW_CONTRAST_GRAY: 'Increase text and background contrast to meet WCAG contrast thresholds.',
  FLAT_SURFACE_MONOTONY: 'Introduce a clear surface or elevation step among repeated sibling elements.',
  WORD_BUDGET_EXCEEDED: 'Keep visible copy focused and replace secondary content with quiet placeholders.'
};
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
  const scan = scanSource(code), tags = scan.tags.filter(t => !t.closing), candidates: Array<{ type: SlopViolationType; severity: SlopSeverity; at: number; message: string }> = [];
  const parent = new Map<SourceTag, SourceTag | undefined>(), openStack: SourceTag[] = [];
  for (const tag of scan.tags) {
    if (tag.closing) { for (let i = openStack.length - 1; i >= 0; i--) if (openStack[i].name === tag.name) { openStack.length = i; break; } }
    else { parent.set(tag, openStack[openStack.length - 1]); if (!tag.selfClosing) openStack.push(tag); }
  }
  const ancestorsOf = (tag: SourceTag): SourceTag[] => { const found: SourceTag[] = []; let current = parent.get(tag); while (current) { found.push(current); current = parent.get(current); } return found; };
  const push = (type: SlopViolationType, at: number, message: string, level?: SlopSeverity) => candidates.push({ type, severity: level ?? ({ PURPLE_GRADIENT_SLOP:'critical', SPARKLE_ICON_OVERLOAD:'high', UNEARNED_ANIMATION:'high', MADE_UP_AI_BADGE:'medium', BOXED_CARD_SYNDROME:'medium', UNANCHORED_FLOATING_WINDOW:'high', CENTER_ALIGNED_EVERYTHING:'medium', LOW_CONTRAST_GRAY:'high', FLAT_SURFACE_MONOTONY:'medium', WORD_BUDGET_EXCEEDED:'high' } as const)[type], at, message });
  const tagClasses = tags.map(tag => ({ tag, tokens: getClasses(tag) }));
  // Gradient classes are grouped by element so gradient direction and stops can occur in any order.
  for (const { tag, tokens } of tagClasses) {
    const joined = tokens.join(' ');
    if (/(?:bg-gradient-to-[\w-]+|bg-(?:radial|conic))/.test(joined) && new RegExp(`(?:from|via|to)-${purple}(?:-|\\b)|(?:from|via|to)-\\[#`, 'i').test(joined) && containsPurpleColor(joined)) push('PURPLE_GRADIENT_SLOP', tag.start, 'Purple-family gradient stop detected.');
    const arbitrary = joined.match(/(?:bg-)?\[(?:linear|radial|conic)-gradient\([^\]]*\)\]/gi);
    if (arbitrary?.some(containsPurpleColor)) push('PURPLE_GRADIENT_SLOP', tag.start, 'Arbitrary gradient contains a purple-family color.');
    for (const attrName of ['style']) {
      const attr = tag.attributes.get(attrName);
      if (attr && /(?:linear|radial|conic)-gradient\(/i.test(attr.value) && containsPurpleColor(attr.value)) push('PURPLE_GRADIENT_SLOP', attr.valueStart, 'Inline gradient contains a purple-family color.');
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
    let bg = tokens.map(color).find((x,i) => x && tokens[i].startsWith('bg-'));
    if (fg && !bg) for (const ancestor of ancestorsOf(tag)) { const ancestorTokens = getClasses(ancestor); bg = ancestorTokens.map(color).find((x,i) => x && ancestorTokens[i].startsWith('bg-')); if (bg) break; }
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
  // CSS and inline declaration text; comments are excluded using the scanner mask, while tag values retain authored strings.
  const gradients = /(?:linear|radial|conic)-gradient\([^)]*\)/ig;
  for (const match of scan.masked.matchAll(gradients)) { const at = match.index ?? 0; if (containsPurpleColor(match[0]) && !candidates.some(v => v.type === 'PURPLE_GRADIENT_SLOP' && Math.abs(v.at - at) < 120)) push('PURPLE_GRADIENT_SLOP', at, 'CSS gradient contains a purple-family color.'); }
  const text = visibleText;
  const wordCount = (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || []).length;
  const limits = { illustration:12, 'feature-card':18, hero:32, application:150, bento:40 } as const;
  const threshold = options.componentType ? limits[options.componentType] : 60;
  if (wordCount > threshold && !tags.some(tag => /^(?:Bar|Skeleton|Placeholder)$/.test(tag.name.split('.').pop() || ''))) push('WORD_BUDGET_EXCEEDED', tags[0]?.start ?? 0, `Visible word budget exceeded: ${wordCount} words, limit ${threshold}.`);
  const allComments = [...code.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g)].map(m => ({ text:m[0], at:m.index ?? 0 }));
  const ignoreFile = allComments.some(c => /sloppy-ignore-file/.test(c.text));
  // `sloppy-allow-file` exempts named rules only, so reference specimens keep
  // protection against every other anti-pattern.
  const allowFile = allComments.map(c => c.text.match(/sloppy-allow-file\s*[:,]?\s*([A-Za-z0-9_,\s-]+)/)).find(Boolean);
  const allowedRules = new Set((allowFile?.[1] ?? '').split(/[,\s]+/).filter(Boolean).map(name => name.replace(/-/g, '_').toUpperCase()));
  const violations: SlopViolation[] = []; let suppressedCount = 0;
  for (const c of candidates.sort((a,b) => a.at-b.at || a.type.localeCompare(b.type))) {
    const loc = sourceLocation(scan, c.at), lineText = code.split('\n')[loc.line - 1] || '';
    const ignored = ignoreFile || allowedRules.has(c.type) || allComments.some(comment => {
      const cl = sourceLocation(scan,comment.at).line;
      return (/sloppy-ignore-next-line/.test(comment.text) && cl + 1 === loc.line) || (/sloppy-ignore-next/.test(comment.text) && cl + 1 === loc.line) || (/sloppy-ignore\s*(?:\*\/)?\s*$/.test(comment.text) && cl === loc.line);
    });
    if (ignored) { suppressedCount++; continue; }
    const snippet = lineText.trim().slice(0,160);
    violations.push({ id: `${c.type.toLowerCase()}-${c.at}`, type:c.type, severity:c.severity, line:loc.line, column:loc.column, snippet, message:c.message, recommendation:advice[c.type] });
  }
  const totalWeight = violations.reduce((sum,v) => sum + severity[v.severity],0);
  const score = violations.length ? Math.max(0,Math.min(100,Math.round(100 * (1 - Math.exp(-totalWeight / 55))))) : 0;
  const count = (level: SlopSeverity) => violations.filter(v => v.severity === level).length;
  const byRule: Partial<Record<SlopViolationType,number>> = {};
  for (const v of violations) byRule[v.type] = (byRule[v.type] || 0) + 1;
  const remediationPlan = Array.from(new Set([...violations].sort((a,b) => severity[b.severity]-severity[a.severity]).map(v => advice[v.type])));
  const summary = violations.length === 0 ? 'Pristine craft: zero AI slop detected.' : `${count('critical') ? 'Critical' : count('high') ? 'High' : 'Moderate'} craft issues detected (Score: ${score}/100) with ${violations.length} violations.`;
  return { filepath:options.filepath, slopScore:score, isSlopFree:violations.length===0, violations, stats:{totalViolations:violations.length,criticalCount:count('critical'),highCount:count('high'),mediumCount:count('medium'),estimatedWordCount:wordCount,byRule,suppressedCount}, summary, remediationPlan };
}
