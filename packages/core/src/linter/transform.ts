import { auditCode, isAiNarrationComment } from './index.js';
import { addNamedImport, resolveImport, rewriteIconImports } from './imports.js';
import { unifiedDiff } from './diff.js';
import { validateSyntax, SyntaxErrorItem } from './syntax.js';
import { verifyKeptWiring, WiringCheckResult } from './wiring-guard.js';
import { AuditResult, TransformationItem, TransformOptions, TransformResult, CANONICAL_RULES, RULE_ALIASES, SlopViolationType } from './types.js';

export interface FixResult extends TransformResult {
  isValidSyntax: boolean;
  syntaxErrors: SyntaxErrorItem[];
  isIdempotent: boolean;
  unifiedDiff: string;
  manualReviewItems: string[];
  wiringGuard?: WiringCheckResult;
}

function mapJsxTags(source: string): { start: number; end: number; text: string }[] {
  const tags: { start: number; end: number; text: string }[] = []; let i = 0;
  while (i < source.length) {
    if (source.startsWith('//', i)) { i = source.indexOf('\n', i); if (i < 0) break; continue; }
    if (source.startsWith('/*', i)) { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; continue; }
    if (source[i] === '"' || source[i] === "'" || source[i] === '`') { const q = source[i++]; while (i < source.length) { if (source[i] === '\\') { i += 2; continue; } if (source[i++] === q) break; } continue; }
    if (source[i] === '<' && /[A-Za-z]/.test(source[i + 1] || '')) {
      const start = i; let j = i + 1, quote = '', brace = 0; while (j < source.length) { const c = source[j]; if (quote) { if (c === '\\') j += 2; else { if (c === quote) quote = ''; j++; } continue; } if (c === '"' || c === "'") { quote = c; j++; continue; } if (c === '{') brace++; else if (c === '}') brace--; if (c === '>' && brace <= 0) { j++; break; } j++; }
      if (source[j - 1] === '>') { tags.push({ start, end: j, text: source.slice(start, j) }); i = j; continue; }
    }
    i++;
  }
  return tags;
}

interface LiteralSpan { start: number; end: number; text: string }

// String and template literal spans inside a JSX expression container. Template
// expressions are skipped so identifiers and conditionals are never rewritten.
function literalSpans(source: string): LiteralSpan[] {
  const spans: LiteralSpan[] = []; let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (c === '/' && source[i + 1] === '/') { i = source.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && source[i + 1] === '*') { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; continue; }
    if (c === '"' || c === "'") {
      const start = i + 1; let j = start;
      while (j < source.length) { if (source[j] === '\\') { j += 2; continue; } if (source[j] === c) break; j++; }
      spans.push({ start, end: j, text: source.slice(start, j) }); i = j + 1; continue;
    }
    if (c === '`') {
      let j = i + 1, chunk = j;
      while (j < source.length) {
        if (source[j] === '\\') { j += 2; continue; }
        if (source[j] === '`') { spans.push({ start: chunk, end: j, text: source.slice(chunk, j) }); j++; break; }
        if (source[j] === '$' && source[j + 1] === '{') {
          spans.push({ start: chunk, end: j, text: source.slice(chunk, j) });
          let depth = 1; j += 2;
          while (j < source.length && depth) { if (source[j] === '{') depth++; else if (source[j] === '}') depth--; j++; }
          chunk = j; continue;
        }
        j++;
      }
      i = j; continue;
    }
    i++;
  }
  return spans;
}

function closingBrace(source: string, open: number): number {
  let depth = 1, quote = '';
  for (let i = open + 1; i < source.length; i++) {
    const c = source[i];
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && source[i + 1] === '/') { i = source.indexOf('\n', i); if (i < 0) return -1; continue; }
    if (c === '/' && source[i + 1] === '*') { const end = source.indexOf('*/', i + 2); if (end < 0) return -1; i = end + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

const PURPLE_STOP = /\b(?:from|via|to)-(?:purple|indigo|violet|fuchsia)-\d{3}\b/g;
const GRADIENT_DIRECTION = /\bbg-gradient-to-\w+\b/g;
const ANIMATION_TOKEN = /\b(animate-bounce|animate-pulse|animate-spin|animate-ping)\b/g;

function parseAllowedRules(preAudit: AuditResult, only?: (number | string)[]): Set<string> | null {
  if (!only || !only.length) return null;
  const allowed = new Set<string>();
  for (const item of only) {
    const raw = String(item).trim();
    const num = parseInt(raw, 10);
    if (!isNaN(num) && String(num) === raw) {
      const v = preAudit.violations.find(v => v.index === num);
      if (v) {
        allowed.add(v.type);
        allowed.add(v.ruleId);
      }
    } else {
      const upper = raw.toUpperCase().replace(/-/g, '_');
      allowed.add(upper);
      const alias = RULE_ALIASES[upper] || RULE_ALIASES[raw.toUpperCase()];
      if (alias) {
        allowed.add(alias);
        const code = CANONICAL_RULES[alias]?.ruleId;
        if (code) allowed.add(code);
      }
    }
  }
  return allowed;
}

function applyOnce(code: string, options: TransformOptions, allowedRules: Set<string> | null = null): { code: string; items: TransformationItem[]; manual: string[] } {
  const items: TransformationItem[] = [], manual: string[] = []; let out = code;
  const isRuleAllowed = (type: SlopViolationType, ruleId?: string) =>
    !allowedRules || allowedRules.has(type) || (ruleId ? allowedRules.has(ruleId) : false);

  const light = options.look === 'minimal' || options.look === 'radix';
  const gradientReplacement = light ? 'bg-neutral-50/80 border border-neutral-200 text-neutral-900 shadow-sm' : 'bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-2xl backdrop-blur-sm';
  const animationReplacement = (token: string) => token === 'animate-bounce' ? 'transition-transform duration-200 ease-out hover:-translate-y-0.5' : token === 'animate-pulse' ? 'transition-opacity duration-300' : token === 'animate-spin' ? 'transition-transform duration-200 ease-out' : 'transition-opacity duration-200 ease-out';
  const progressAffordance = /\brole\s*=\s*["'](?:status|progressbar)["']|\baria-busy\b/.test(code);
  if (progressAffordance && /\banimate-(?:bounce|pulse|spin|ping)\b/.test(code)) manual.push('Kept looping animation tokens for manual review: the file declares a progress affordance.');

  // Each transformation records the exact class value it replaces, so a repair
  // plan can present a patch that reproduces the rewritten result faithfully.
  const rewriteClassText = (text: string, forceGradient = false) => {
    const gradient = isRuleAllowed('PURPLE_GRADIENT_SLOP', 'VIS-02') && (forceGradient || (/bg-gradient-to-\w+/.test(text) && /(?:from|via|to)-(?:purple|indigo|violet|fuchsia)-\d{3}/i.test(text)));
    let next = text;
    if (gradient) {
      const afterGradient = next.replace(GRADIENT_DIRECTION, () => gradientReplacement).replace(PURPLE_STOP, '').replace(/[ \t]{2,}/g, ' ').trim();
      if (afterGradient !== text) items.push({ type: 'PURPLE_GRADIENT_SLOP', original: text, replacement: afterGradient, explanation: 'Replaced purple and indigo gradient tokens with a grounded surface treatment.' });
      next = afterGradient;
    }
    if (!progressAffordance && isRuleAllowed('UNEARNED_ANIMATION', 'MOT-01')) {
      next = next.replace(ANIMATION_TOKEN, (match) => {
        const replacement = animationReplacement(match);
        items.push({ type: 'UNEARNED_ANIMATION', original: match, replacement, explanation: `Replaced unearned ${match} motion with a restrained transition.` });
        return replacement;
      });
    }
    return next;
  };

  const rewriteStyleText = (text: string) => {
    if (!isRuleAllowed('PURPLE_GRADIENT_SLOP', 'VIS-02')) return text;
    return text.replace(/(?:linear|radial|conic)-gradient\([^)]*(?:#7c3aed|#6366f1|#8b5cf6|#a855f7|rgba\(\s*124,\s*58,\s*237|rgba\(\s*99,\s*102,\s*241|purple|violet|indigo|fuchsia)[^)]*\)/gi, match => {
      const replacement = light ? 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)' : 'linear-gradient(180deg, #18181b 0%, #09090b 100%)';
      items.push({ type: 'PURPLE_GRADIENT_SLOP', original: match, replacement, explanation: 'Converted inline purple gradient to a monochromatic surface elevation.' });
      return replacement;
    });
  };

  const rewriteExpression = (expression: string, style: boolean) => {
    const spans = literalSpans(expression);
    if (!spans.length) return expression;
    const combined = style ? '' : spans.map(span => span.text).join(' ');
    const gradient = /bg-gradient-to-\w+/.test(combined) && /(?:from|via|to)-(?:purple|indigo|violet|fuchsia)-\d{3}/i.test(combined);
    let next = expression;
    for (const span of [...spans].reverse()) {
      const replacement = style ? rewriteStyleText(span.text) : rewriteClassText(span.text, gradient);
      if (replacement !== span.text) next = next.slice(0, span.start) + replacement + next.slice(span.end);
    }
    return next;
  };

  const rewriteTag = (tagText: string) => {
    const edits: { start: number; end: number; text: string }[] = [];
    const attributes = /\b(className|class|style)\s*=\s*/g;
    let match: RegExpExecArray | null;
    while ((match = attributes.exec(tagText))) {
      const name = match[1], at = attributes.lastIndex;
      if (tagText[at] === '"' || tagText[at] === "'") {
        const quote = tagText[at], start = at + 1; let end = start;
        while (end < tagText.length) { if (tagText[end] === '\\') { end += 2; continue; } if (tagText[end] === quote) break; end++; }
        if (end >= tagText.length) break;
        const inner = tagText.slice(start, end), replacement = name === 'style' ? rewriteStyleText(inner) : rewriteClassText(inner);
        if (replacement !== inner) edits.push({ start, end, text: replacement });
        attributes.lastIndex = end + 1;
      } else if (tagText[at] === '{') {
        const end = closingBrace(tagText, at);
        if (end < 0) break;
        const expression = tagText.slice(at + 1, end), replacement = rewriteExpression(expression, name === 'style');
        if (replacement !== expression) edits.push({ start: at + 1, end, text: replacement });
        attributes.lastIndex = end + 1;
      }
    }
    if (!edits.length) return tagText;
    let result = tagText;
    for (const edit of edits.reverse()) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    return result;
  };

  for (const tag of mapJsxTags(out).reverse()) {
    const value = rewriteTag(tag.text);
    if (value !== tag.text) out = out.slice(0, tag.start) + value + out.slice(tag.end);
  }
  // Namespace members cannot be redirected through a safe named import rewrite.
  for (const match of out.matchAll(/<([\w$]+)\.(Sparkles|LucideSparkles|MagicWand|Sparkle)\b[^>]*\/>/g)) manual.push(`Kept <${match[1]}.${match[2]} /> for manual review: namespace icon imports cannot be rewritten safely.`);
  // Replace sparkle JSX only when its import can be rewritten atomically.
  if (isRuleAllowed('SPARKLE_ICON_OVERLOAD', 'VIS-03')) {
    const sparkleTag = /<(LucideSparkles|Sparkles|MagicWand|Sparkle|IconSparkles|AiSparkle)\b([^>]*)\/>/g;
    for (const m of [...out.matchAll(sparkleTag)].reverse()) {
      const local = m[1]; if (/[.]/.test(local)) continue;
      const context = out.slice(Math.max(0, m.index! - 160), m.index!);
      const telemetry = /latency|telemetry|metric|monitor|response.?time/i.test(out);
      const icon = telemetry ? 'Activity' : 'Zap';
      const binding = resolveImport(out, local);
      if (!binding || binding.kind !== 'named' || binding.module !== 'lucide-react') { manual.push(`Kept <${local} /> for manual review: ${binding ? `${local} uses an unsupported ${binding.kind} import.` : `no named lucide-react import for ${local} was found.`}`); continue; }
      let replacement = `<${icon}${m[2].replace(/\btext-(?:yellow|amber|purple|indigo)-\d+\b/g, 'text-neutral-400')}/>`;
      out = out.slice(0, m.index!) + replacement + out.slice(m.index! + m[0].length);
      const rewritten = rewriteIconImports(out, local, icon);
      if (!rewritten.safe) { out = out.slice(0, m.index!) + m[0] + out.slice(m.index! + replacement.length); manual.push(`Kept <${local} /> for manual review: ${rewritten.reason}`); continue; }
      out = rewritten.code;
      items.push({ type: 'SPARKLE_ICON_OVERLOAD', original: m[0], replacement, explanation: `Replaced sparkle icon with semantic ${icon} icon and updated the import.` });
    }
  }
  const lorem = /<p\b[^>]*>\s*(?:Lorem ipsum|Ut enim ad minim|Duis aute irure)[^<]*<\/p>/gi;
  if (options.budgetWords && isRuleAllowed('WORD_BUDGET_EXCEEDED', 'TYP-08')) {
    out = out.replace(lorem, match => { const replacement = '<div className="space-y-1.5 py-1"><div className="h-2 w-3/4 bg-neutral-800/80 rounded-full" /><div className="h-2 w-1/2 bg-neutral-800/50 rounded-full" /></div>'; items.push({ type: 'WORD_BUDGET_EXCEEDED', original: match, replacement, explanation: 'Replaced explicit lorem ipsum filler with placeholder bars.' }); return replacement; });
  }

  // COD-01: Strip low-signal AI narration comments and decorative banners
  if (isRuleAllowed('AI_NARRATION_COMMENT_SLOP', 'COD-01')) {
    const comments = [...out.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g)];
    for (const m of comments.reverse()) {
      const text = m[0];
      const check = isAiNarrationComment(text);
      if (check.isSlop && m.index !== undefined) {
        let start = m.index;
        let end = m.index + text.length;
        const beforeOnLine = out.slice(0, start).split('\n').pop() || '';
        if (/^\s*$/.test(beforeOnLine) && out[end] === '\n') {
          start -= beforeOnLine.length;
          end += 1;
        }
        out = out.slice(0, start) + out.slice(end);
        items.push({
          type: 'AI_NARRATION_COMMENT_SLOP',
          original: text,
          replacement: '',
          explanation: `Stripped AI narration comment: "${text.trim().slice(0, 50)}"`
        });
      }
    }
  }

  // Framing and marketing copy are deliberately omitted: they require contextual review.
  return { code: out, items, manual };
}

export function transformSlopToCraft(code: string, options: TransformOptions = {}): FixResult {
  const preAudit = auditCode(code, { strict: true, filepath: options.filepath });
  const allowedRules = parseAllowedRules(preAudit, options.only);
  const first = applyOnce(code, options, allowedRules);
  const validation = validateSyntax(first.code);
  const wiring = options.kept !== false ? verifyKeptWiring(code, first.code) : undefined;
  
  // If wiring guard failed, protect user logic and abort change
  const isSafe = validation.valid && (!wiring || wiring.passed);
  const transformedCode = isSafe ? first.code : code;
  const transformations = isSafe ? first.items : [];
  const manual = [...first.manual];
  if (wiring && !wiring.passed) {
    manual.push(`[WIRING GUARD BLOCKED] ${wiring.dropped.length} connection(s) dropped. Transformation aborted to preserve business logic.`);
    for (const d of wiring.dropped) {
      manual.push(`  - ${d.reason}`);
    }
  }

  const postAudit = auditCode(transformedCode, { strict: true, filepath: options.filepath });
  const second = applyOnce(transformedCode, options, allowedRules);
  return {
    originalCode: code,
    transformedCode,
    changesApplied: transformations.length,
    transformations,
    preAudit,
    postAudit,
    isValidSyntax: validation.valid,
    syntaxErrors: validation.valid ? [] : validation.errors,
    isIdempotent: second.code === transformedCode,
    unifiedDiff: unifiedDiff(code, transformedCode, options.filepath || 'file.tsx'),
    manualReviewItems: manual,
    wiringGuard: wiring
  };
}
