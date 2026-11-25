import type { SloppyConfig } from './types.js';
import { findUpFile } from '../node-env.js';

export interface DesignContract {
  found: boolean;
  path?: string;
  brandAccent?: string;
  blurCap?: number;
  radius?: string;
  fonts?: { heading?: string; body?: string };
  signature?: string;
  lockedTokens: string[];
}

export const DEFAULT_BLUR_CAP = 2;

/**
 * DESIGN.md is the project's token lock. It is deliberately plain Markdown so a
 * human and an agent can read the same contract, and so the scanner can enforce
 * declared values without executing project code.
 */
export function parseDesignContract(content: string): Omit<DesignContract, 'found' | 'path'> {
  const lockedTokens: string[] = [];
  const fonts: { heading?: string; body?: string } = {};
  let brandAccent: string | undefined;
  let blurCap: number | undefined;
  let radius: string | undefined;
  let signature: string | undefined;

  const assign = (key: string, value: string) => {
    const normalized = key.trim().toLowerCase().replace(/[_\s]+/g, '-');
    const clean = value.trim().replace(/^['"`]|['"`]$/g, '');
    if (!clean) return;
    if (['brand-primary', 'brand-accent', 'accent', 'primary'].includes(normalized)) brandAccent = clean;
    else if (['blur-cap', 'backdrop-blur-cap', 'blur'].includes(normalized)) {
      const parsed = Number(clean.replace(/[^\d.]/g, ''));
      if (Number.isFinite(parsed)) blurCap = parsed;
    } else if (['radius', 'radius-scale', 'border-radius'].includes(normalized)) radius = clean;
    else if (['heading-font', 'display-font', 'font-heading'].includes(normalized)) fonts.heading = clean;
    else if (['body-font', 'font-body', 'text-font'].includes(normalized)) fonts.body = clean;
    else if (['signature', 'signature-element', 'focal-point'].includes(normalized)) signature = clean;
    else if (/(?:^|-)(?:color|palette|surface|background|foreground|ink|border)(?:-|$)/.test(normalized)) {
      // Palette tokens are recorded in lockedTokens and enforced by TOK-02.
    }
    else return;
    lockedTokens.push(`${normalized}: ${clean}`);
  };

  for (const line of content.split('\n')) {
    let trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) trimmed = trimmed.slice(2).trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;
    let rawKey = trimmed.slice(0, colonIdx).trim();
    if (rawKey.startsWith('**') && rawKey.endsWith('**') && rawKey.length > 4) rawKey = rawKey.slice(2, -2).trim();
    const rawVal = trimmed.slice(colonIdx + 1).trim();
    if (rawVal && rawKey.length <= 42 && /^[A-Za-z][\w -]{1,40}$/.test(rawKey)) assign(rawKey, rawVal);
  }

  // Also accept the JSON fenced block used by `sloppy init --design` via linear index scanning.
  let fencePos = 0;
  while ((fencePos = content.indexOf('```', fencePos)) >= 0) {
    const nl = content.indexOf('\n', fencePos + 3);
    if (nl < 0) break;
    const fenceEnd = content.indexOf('```', nl + 1);
    if (fenceEnd < 0) break;
    const header = content.slice(fencePos + 3, nl).trim().toLowerCase();
    const body = content.slice(nl + 1, fenceEnd).trim();
    fencePos = fenceEnd + 3;
    if ((header && header !== 'json') || !body.startsWith('{') || !body.endsWith('}')) continue;
    try {
      const parsed: unknown = JSON.parse(body);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string') assign(key, value);
          else if (typeof value === 'number' && key.toLowerCase().includes('blur')) assign(key, String(value));
          else if (value && typeof value === 'object' && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
              if (typeof nestedValue === 'string') assign(nestedKey, nestedValue);
            }
          }
        }
      }
      break;
    } catch {
      // A malformed JSON block must never break the scanner.
    }
  }

  return { brandAccent, blurCap, radius, fonts, signature, lockedTokens };
}

export function loadDesignContract(startPath?: string): DesignContract {
  let result: DesignContract = { found: false, lockedTokens: [] };
  findUpFile(startPath, (dir, fs, path) => {
    const candidate = path.join(dir, 'DESIGN.md');
    try {
      const content = fs.readFileSync(candidate, 'utf8');
      result = { found: true, path: candidate, ...parseDesignContract(content) };
      return true;
    } catch {
      return false;
    }
  });
  return result;
}

export function resolveDesignContract(filepath: string | undefined, config: SloppyConfig | null): DesignContract {
  const loaded = loadDesignContract(filepath);
  if (!config?.design) return loaded;
  return {
    ...loaded,
    found: loaded.found || Boolean(config.design.brandAccent || config.design.blurCap || config.design.lockedTokens?.length),
    brandAccent: config.design.brandAccent ?? loaded.brandAccent,
    blurCap: config.design.blurCap ?? loaded.blurCap,
    lockedTokens: [...loaded.lockedTokens, ...(config.design.lockedTokens || [])]
  };
}

export function declaredAccentAllows(contract: DesignContract | null | undefined, candidate: string): boolean {
  if (!contract?.brandAccent) return false;
  const declared = contract.brandAccent.toLowerCase();
  return candidate.toLowerCase().split('-')[0] === declared;
}

export const DESIGN_MD_TEMPLATE = `# DESIGN.md — Sloppy Design Contract (Token Lock)

Declare the project's own identity before generating UI. Sloppy enforces these
values during \`sloppy check\` and suppresses Gen-2 defaults only when a token is
explicitly declared here.

## Palette lock

- brand-primary: <accent name or token, e.g. slate>
- color-ink: <text token>
- color-surface: <surface token>
- color-border: <border token>

## Typography lock

- heading-font: <one display/heading family>
- body-font: <one body family>

## Surface lock

- radius: 6px
- blur-cap: 2

## Signature element

- signature: <the one focal element each page may spend visual emphasis on>

## Notes

Rules suppressed by this contract are still reported as declared exceptions in
\`sloppy check --json\` under \`designContract\`.
`;
