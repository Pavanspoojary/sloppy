export interface SyntaxErrorItem { line: number; message: string }
export interface SyntaxValidationResult { valid: boolean; errors: SyntaxErrorItem[] }

export function validateSyntax(source: string): SyntaxValidationResult {
  const errors: SyntaxErrorItem[] = [];
  const delimiters: { char: string; line: number }[] = [];
  const tags: { name: string; line: number }[] = [];
  let i = 0, line = 1;
  const pushError = (at: number, message: string) => errors.push({ line: 1 + source.slice(0, at).split('\n').length - 1, message });
  while (i < source.length) {
    const c = source[i], n = source[i + 1];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && n === '/') { const start = i; i += 2; while (i < source.length && source[i] !== '\n') i++; if (i >= source.length) break; continue; }
    if (c === '/' && n === '*') { const start = i; i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) { if (source[i++] === '\n') line++; } if (i >= source.length) { pushError(start, 'Unterminated block comment.'); break; } i += 2; continue; }
    if (c === '"' || c === "'") { const start = i, quote = c; i++; let closed = false; while (i < source.length) { if (source[i] === '\\') { if (source[i + 1] === '\n') line++; i += 2; continue; } if (source[i] === quote) { i++; closed = true; break; } if (source[i] === '\n' && quote === "'") break; if (source[i++] === '\n') line++; } if (!closed) pushError(start, 'Unterminated string literal.'); continue; }
    if (c === '`') { const start = i++; let closed = false; while (i < source.length) { if (source[i] === '\\') { if (source[i + 1] === '\n') line++; i += 2; continue; } if (source[i] === '`') { i++; closed = true; break; } if (source[i++] === '\n') line++; } if (!closed) pushError(start, 'Unterminated template literal.'); continue; }
    if ('{[('.includes(c)) { delimiters.push({ char: c, line }); i++; continue; }
    if ('}])'.includes(c)) { const expected = c === '}' ? '{' : c === ']' ? '[' : '('; const top = delimiters.pop(); if (!top || top.char !== expected) pushError(i, `Unbalanced '${c}'.`); i++; continue; }
    if (c === '<' && (/[A-Za-z]/.test(n || '') || n === '/' || n === '>')) {
      const start = i;
      let previous = i - 1;
      while (previous >= 0 && /\s/.test(source[previous]) && source[previous] !== '\n') previous--;
      const openingContext = i === 0 || source[i - 1] === '\n' || (previous >= 0 && source[previous] === '\n') || previous < 0 || /[({}>=;,?:&|]/.test(source[previous]) || source.slice(0, i).trimEnd().endsWith('/>') || (tags.length > 0 && delimiters[delimiters.length - 1]?.char !== '{');
      const typeContext = /\b(?:extends|implements)\s*$/.test(source.slice(Math.max(0, i - 40), i));
      const closing = source[i + 1] === '/';
      const genericArrow = /^<\s*[A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)*\s*>\s*\([^)]*\)(?:\s*:\s*[\w$.[\]|&<>]+)?\s*=>/.test(source.slice(i));
      if (!closing && (!openingContext || typeContext || genericArrow)) { i++; continue; }
      let j = i + 1; if (closing) j++;
      if (source[j] === '>') { if (closing) { const top = tags.pop(); if (top?.name !== '') pushError(start, 'Mismatched JSX fragment closing tag.'); } else tags.push({ name: '', line }); i = j + 1; continue; }
      const nameStart = j; while (/[A-Za-z0-9_$.:\-]/.test(source[j] || '')) j++; const name = source.slice(nameStart, j);
      if (name) {
        let quote = ''; let brace = 0;
        while (j < source.length) { const x = source[j]; if (quote) { if (x === '\\') j += 2; else { if (x === quote) quote = ''; if (x === '\n') line++; j++; } continue; } if (x === '"' || x === "'") { quote = x; j++; continue; } if (x === '{') brace++; else if (x === '}') brace--; else if (x === '>' && brace <= 0) break; if (x === '\n') line++; j++; }
        if (j >= source.length) { pushError(start, 'Unterminated JSX tag.'); break; }
        const selfClosing = source[j - 1] === '/';
        if (closing) { const top = tags.pop(); if (!top || top.name !== name) pushError(start, `Mismatched JSX closing tag '</${name}>'.`); }
        else if (!selfClosing) tags.push({ name, line });
        i = j + 1; continue;
      }
    }
    i++;
  }
  for (const item of delimiters) errors.push({ line: item.line, message: `Unclosed '${item.char}'.` });
  for (const item of tags) errors.push({ line: item.line, message: item.name ? `Unclosed JSX tag '<${item.name}>'.` : 'Unclosed JSX fragment.' });
  return { valid: errors.length === 0, errors };
}
