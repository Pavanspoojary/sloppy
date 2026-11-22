export interface ImportBinding { local: string; imported: string; kind: 'named' | 'default' | 'namespace'; start: number; end: number; module: string }
export function resolveImport(source: string, identifier: string): ImportBinding | undefined {
  const re = /import\s+([\s\S]*?)\s+from\s+(['"])([^'"\n]+)\2\s*;?/g; let match: RegExpExecArray | null;
  while ((match = re.exec(source))) { const clause = match[1], module = match[3], start = match.index, end = re.lastIndex;
    const ns = clause.match(/\*\s+as\s+([\w$]+)/); if (ns?.[1] === identifier) return { local: identifier, imported: '*', kind: 'namespace', start, end, module };
    const named = clause.match(/\{([^}]*)\}/); if (named) for (const raw of named[1].split(',')) { const parts = raw.trim().split(/\s+as\s+/); if ((parts[1] || parts[0]) === identifier) return { local: identifier, imported: parts[0], kind: 'named', start, end, module }; }
    const def = clause.trim().match(/^([\w$]+)/); if (def?.[1] === identifier) return { local: identifier, imported: 'default', kind: 'default', start, end, module };
  }
}
export function rewriteIconImports(source: string, oldLocal: string, newName: string, module = 'lucide-react'): { code: string; safe: boolean; reason?: string } {
  const binding = resolveImport(source, oldLocal); if (!binding || binding.module !== module) return { code: source, safe: false, reason: `No named ${oldLocal} import from ${module} was found.` };
  if (binding.kind !== 'named') return { code: source, safe: false, reason: `${oldLocal} is imported as ${binding.kind}; the usage cannot be rewritten safely.` };
  let statement = source.slice(binding.start, binding.end); const named = statement.match(/\{([^}]*)\}/); if (!named) return { code: source, safe: false, reason: 'The named import could not be parsed safely.' };
  const specifiers = named[1].split(',').map(s => s.trim()).filter(Boolean); const target = specifiers.find(s => (s.split(/\s+as\s+/)[1] || s.split(/\s+as\s+/)[0]) === oldLocal); if (!target) return { code: source, safe: false, reason: 'The icon import could not be resolved.' };
  const replacement = newName === oldLocal ? target : newName;
  const kept = specifiers.filter(s => s !== target);
  const alreadyPresent = kept.some(s => (s.split(/\s+as\s+/)[1] || s.split(/\s+as\s+/)[0]) === newName);
  const nextSpecifiers = alreadyPresent ? kept : [...kept, replacement];
  const body = nextSpecifiers.length ? `{ ${nextSpecifiers.join(', ')} }` : '';
  if (!body) {
    if (!clauseHasDefault(statement)) return { code: source.slice(0, binding.start) + source.slice(binding.end), safe: true };
    statement = statement.replace(/,\s*\{[^}]*\}/, '');
  } else statement = statement.replace(named[0], body);
  if (newName !== oldLocal && !new RegExp(`\\b${newName}\\b`).test(source.slice(0, binding.start) + source.slice(binding.end))) {
    const uses = new RegExp(`<${oldLocal}(?:\\s|/|>)`).test(source);
    if (!uses) return { code: source, safe: false, reason: `No JSX usage of ${oldLocal} was found.` };
  }
  return { code: source.slice(0, binding.start) + statement + source.slice(binding.end), safe: true };
}
function clauseHasDefault(statement: string): boolean {
  const clause = statement.match(/^import\s+([\s\S]*?)\s+from/)?.[1] || '';
  return /^[\w$]+\s*,/.test(clause);
}
export function addNamedImport(source: string, name: string, module = 'lucide-react'): string {
  const re = /import\s+([\s\S]*?)\s+from\s+(['"])([^'"\n]+)\2\s*;?/g; let m: RegExpExecArray | null;
  while ((m = re.exec(source))) if (m[3] === module) { const clause = m[1], named = clause.match(/\{([^}]*)\}/); if (named) { if (named[1].split(',').some(s => s.trim().split(/\s+as\s+/).includes(name))) return source; const next = m[0].replace(named[0], `{${named[1].trim() ? `${named[1].trim()}, ` : ''}${name}}`); return source.slice(0, m.index) + next + source.slice(re.lastIndex); } const defaultBinding = clause.trim().match(/^([\w$]+)$/); if (defaultBinding) { const next = m[0].replace(clause, `${clause}, { ${name} }`); return source.slice(0, m.index) + next + source.slice(re.lastIndex); } }
  return `import { ${name} } from '${module}';\n${source}`;
}
