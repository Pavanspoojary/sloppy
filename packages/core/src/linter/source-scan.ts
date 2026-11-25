export interface SourceAttribute { name: string; value: string; start: number; end: number; valueStart: number; valueEnd: number }
export interface SourceTag { name: string; attributes: Map<string, SourceAttribute>; start: number; end: number; closing: boolean; selfClosing: boolean }
export interface SourceComment { text: string; at: number }
export interface SourceScan { masked: string; tags: SourceTag[]; lineStarts: number[]; comments: SourceComment[] }

const isSpace = (value: string) => value === ' ' || value === '\n' || value === '\r' || value === '\t' || value === '\f';

// TypeScript generics and comparisons reuse the '<' glyph. A tag only opens a JSX
// region when it appears in an expression position or inside an existing element.
function opensJsxElement(source: string, at: number): boolean {
  let previous = at - 1;
  while (previous >= 0 && (source[previous] === ' ' || source[previous] === '\t' || source[previous] === '\r')) previous--;
  if (previous < 0 || source[previous] === '\n') return true;
  if (/[A-Za-z_$]/.test(source[previous])) return /\b(?:return|yield|case|default|else|do)\s*$/.test(source.slice(0, previous + 1));
  return /[({[}>=;,?:&|]/.test(source[previous]) || source.slice(0, at).trimEnd().endsWith('/>');
}

const genericArrow = /^<\s*[A-Za-z_$][\w$]*(?:\s+extends\s+[^>]+)?(?:\s*,\s*[A-Za-z_$][\w$]*)*\s*,?\s*>\s*\(/;

const regexKeywords = /^(?:return|case|throw|in|of|typeof|void|delete|yield|await|else|do)$/;

function isRegexPrefix(source: string, slashIndex: number): boolean {
  let j = slashIndex - 1;
  while (j >= 0 && isSpace(source[j])) j--;
  if (j < 0) return true;
  const prev = source[j];
  if (prev === '>') return j > 0 && source[j - 1] === '=';
  if ('({[=,;:!?&|*%^~'.includes(prev)) return true;
  if (prev === '+' || prev === '-') return source[j - 1] !== prev;
  if (/[A-Za-z_$]/.test(prev)) {
    let start = j;
    while (start > 0 && /[A-Za-z0-9_$]/.test(source[start - 1])) start--;
    return regexKeywords.test(source.slice(start, j + 1));
  }
  return false;
}

function findRegexEnd(source: string, slashIndex: number): number {
  let k = slashIndex + 1;
  let inClass = false;
  while (k < source.length) {
    const ch = source[k];
    if (ch === '\n' || ch === '\r') return -1;
    if (ch === '\\') { k += 2; continue; }
    if (ch === '[' && !inClass) { inClass = true; k++; continue; }
    if (ch === ']' && inClass) { inClass = false; k++; continue; }
    if (ch === '/' && !inClass) {
      let end = k + 1;
      while (end < source.length && /[a-z]/i.test(source[end])) end++;
      return end;
    }
    k++;
  }
  return -1;
}

export function scanSource(source: string): SourceScan {
  const chars = source.split('');
  const lineStarts = [0];
  const comments: SourceComment[] = [];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineStarts.push(i + 1);
  let quote = '', templateDepth = 0, inTemplateExpression = false, jsxDepth = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (quote) {
      if (c !== '\n' && c !== '\r') chars[i] = ' ';
      if (c === '\\') { if (i + 1 < source.length && source[i + 1] !== '\n') chars[++i] = ' '; continue; }
      if (quote === '`' && c === '$' && n === '{') { chars[i] = chars[i + 1] = ' '; inTemplateExpression = true; templateDepth = 1; i++; quote = ''; continue; }
      if (c === quote) quote = '';
      continue;
    }
    if (inTemplateExpression) {
      if (c === '{') templateDepth++;
      else if (c === '}' && --templateDepth === 0) { inTemplateExpression = false; quote = '`'; }
      continue;
    }
    if (c === '/' && n === '/') {
      const nl = source.indexOf('\n', i);
      const end = nl < 0 ? source.length : nl;
      comments.push({ text: source.slice(i, end), at: i });
      for (let j = i; j < end; j++) chars[j] = ' ';
      if (nl < 0) break;
      i = nl - 1;
      continue;
    }
    if (c === '/' && n === '*') {
      const cStart = i;
      chars[i] = chars[i + 1] = ' ';
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] !== '\n' && source[i] !== '\r') chars[i] = ' ';
        i++;
      }
      if (i < source.length) {
        chars[i] = chars[i + 1] = ' ';
        i++;
      }
      comments.push({ text: source.slice(cStart, i + 1), at: cStart });
      continue;
    }
    if (c === '/' && isRegexPrefix(source, i)) {
      const regexEnd = findRegexEnd(source, i);
      if (regexEnd > i + 1) {
        for (let j = i + 1; j < regexEnd; j++) if (source[j] !== '/') chars[j] = ' ';
        i = regexEnd - 1;
        continue;
      }
    }
    if (c === '"' || c === "'" || c === '`') quote = c;
  }
  const masked = chars.join('');
  const tags: SourceTag[] = [];
  for (let i = 0; i < source.length; i++) {
    if (masked[i] !== '<' || !/[A-Za-z]/.test(source[i + 1] === '/' ? source[i + 2] || '' : source[i + 1] || '')) continue;
    const start = i; const closing = source[i + 1] === '/';
    if (closing) { if (jsxDepth === 0) continue; }
    else if (jsxDepth === 0 && (!opensJsxElement(source, i) || genericArrow.test(source.slice(i)))) continue;
    if (closing) i++; i++;
    while (i < source.length && /[\w.$:-]/.test(source[i])) i++;
    const name = source.slice(start + (closing ? 2 : 1), i);
    const attrs = new Map<string, SourceAttribute>();
    let end = i, quoteChar = '';
    for (; end < source.length; end++) { const c = source[end]; if (quoteChar) { if (c === '\\') { end++; continue; } if (c === quoteChar) quoteChar = ''; } else if (c === '"' || c === "'" || c === '`') quoteChar = c; else if (c === '>') break; }
    if (end >= source.length) { i = start; continue; }
    let p = i;
    while (p < end) {
      while (p < end && (isSpace(source[p]) || source[p] === '/')) p++;
      const aStart = p;
      while (p < end && /[\w:$.-]/.test(source[p])) p++;
      if (p === aStart) { p++; continue; }
      const attrName = source.slice(aStart, p);
      while (p < end && isSpace(source[p])) p++;
      let valueStart = p, valueEnd = p;
      if (source[p] === '=') {
        p++; while (p < end && isSpace(source[p])) p++; valueStart = p;
        if (source[p] === '"' || source[p] === "'" || source[p] === '`') { const q = source[p++]; valueStart = p; while (p < end && source[p] !== q) { if (source[p] === '\\') p++; p++; } valueEnd = p; if (source[p] === q) p++; }
        else if (source[p] === '{') { let depth = 1; valueStart = ++p; const qstack: string[] = []; while (p < end && depth) { const c = source[p]; if (qstack.length) { if (c === '\\') p += 2; else { if (c === qstack[qstack.length - 1]) qstack.pop(); p++; } continue; } if (c === '"' || c === "'" || c === '`') qstack.push(c); else if (c === '{') depth++; else if (c === '}') depth--; p++; } valueEnd = Math.max(valueStart, p - 1); }
        else { while (p < end && !isSpace(source[p])) p++; valueEnd = p; }
      }
      attrs.set(attrName, { name: attrName, value: source.slice(valueStart, valueEnd), start: aStart, end: p, valueStart, valueEnd });
    }
    const tag: SourceTag = { name, attributes: attrs, start, end: end + 1, closing, selfClosing: !closing && source.slice(start, end).trimEnd().endsWith('/') };
    if (closing) jsxDepth = Math.max(0, jsxDepth - 1);
    else if (!tag.selfClosing) jsxDepth++;
    tags.push(tag); i = end;
  }
  return { masked, tags, lineStarts, comments };
}

export function lineAt(scan: SourceScan, source: string, lineNumber: number): string {
  if (lineNumber < 1 || lineNumber > scan.lineStarts.length) return '';
  const start = scan.lineStarts[lineNumber - 1];
  const nextStart = scan.lineStarts[lineNumber];
  let end = nextStart !== undefined ? (source[nextStart - 1] === '\n' ? nextStart - 1 : nextStart) : source.length;
  if (end > start && source[end - 1] === '\r') end--;
  return source.slice(start, end);
}

export function classTokens(value: string): string[] {
  const result: string[] = [];
  const re = /(?:["'`]([^"'`]*)["'`]|([\w!:-]+(?:\[[^\]]*\])?))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value))) for (const token of (match[1] ?? match[2]).split(/\s+/)) if (token) result.push(token);
  return result;
}

export function getClasses(tag: SourceTag): string[] {
  const attr = tag.attributes.get('className') ?? tag.attributes.get('class');
  return attr ? classTokens(attr.value) : [];
}

export function sourceLocation(scan: SourceScan, offset: number): { line: number; column: number } {
  let lo = 0, hi = scan.lineStarts.length;
  while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (scan.lineStarts[mid] <= offset) lo = mid; else hi = mid; }
  return { line: lo + 1, column: offset - scan.lineStarts[lo] + 1 };
}
