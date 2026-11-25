/**
 * Sloppy Wiring Guard
 * Snapshots interactive wiring (event handlers, form inputs, links, IDs, headings)
 * before any transformation, and verifies that no critical business wiring was dropped.
 */

export interface WiringItem {
  kind: 'handler' | 'form-control' | 'navigation' | 'heading' | 'anchor';
  tag?: string;
  name?: string;
  event?: string;
  value: string;
  raw: string;
}

export interface WiringSnapshot {
  handlers: WiringItem[];
  formControls: WiringItem[];
  navigation: WiringItem[];
  headings: WiringItem[];
  anchors: WiringItem[];
  totalCount: number;
}

export interface DroppedWiringItem {
  item: WiringItem;
  reason: string;
}

export interface WiringCheckResult {
  passed: boolean;
  totalBefore: number;
  totalAfter: number;
  keptCount: number;
  dropped: DroppedWiringItem[];
  details: string;
}

function stripHtmlTags(raw: string): string {
  let out = '', inTag = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '<') { inTag = true; continue; }
    if (ch === '>' && inTag) { inTag = false; continue; }
    if (!inTag) out += ch;
  }
  return out.trim();
}

export function extractWiring(source: string): WiringSnapshot {
  const handlers: WiringItem[] = [];
  const formControls: WiringItem[] = [];
  const navigation: WiringItem[] = [];
  const headings: WiringItem[] = [];
  const anchors: WiringItem[] = [];

  // 1. Extract Event Handlers (e.g. onClick={handleClick}, onSubmit={...})
  const handlerRegex = /\bon([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')/g;
  for (const match of source.matchAll(handlerRegex)) {
    const event = `on${match[1]}`;
    const value = (match[2] || match[3] || match[4] || '').trim();
    if (value) {
      handlers.push({
        kind: 'handler',
        event,
        value,
        raw: match[0]
      });
    }
  }

  // 2. Extract Form Controls (<input>, <select>, <textarea>, <form>, <button>)
  const formTagRegex = /<(input|select|textarea|form|button)\b([^>]*)>/gi;
  for (const match of source.matchAll(formTagRegex)) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    
    const nameMatch = attrs.match(/\bname\s*=\s*(?:\{['"`]([^'"`]+)['"`]\}|"([^"]+)"|'([^']+)')/i);
    const idMatch = attrs.match(/\bid\s*=\s*(?:\{['"`]([^'"`]+)['"`]\}|"([^"]+)"|'([^']+)')/i);
    const typeMatch = attrs.match(/\btype\s*=\s*(?:\{['"`]([^'"`]+)['"`]\}|"([^"]+)"|'([^']+)')/i);
    
    const name = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : undefined;
    const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : undefined;
    const type = typeMatch ? (typeMatch[1] || typeMatch[2] || typeMatch[3]) : undefined;

    if (name || id || type) {
      formControls.push({
        kind: 'form-control',
        tag,
        name: name || id || type || tag,
        value: `${tag}[name="${name || ''}"][id="${id || ''}"][type="${type || ''}"]`,
        raw: match[0]
      });
    }
  }

  // 3. Extract Links & Navigation (<a>, <Link>, <NavLink>)
  const navTagRegex = /<(a|Link|NavLink)\b([^>]*)>/gi;
  for (const match of source.matchAll(navTagRegex)) {
    const tag = match[1];
    const attrs = match[2];
    const hrefMatch = attrs.match(/\b(?:href|to)\s*=\s*(?:\{['"`]([^'"`]+)['"`]\}|"([^"]+)"|'([^']+)'|\{([^}]+)\})/i);
    if (hrefMatch) {
      const target = (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || '').trim();
      navigation.push({
        kind: 'navigation',
        tag,
        value: target,
        raw: match[0]
      });
    }
  }

  // 4. Extract Headings (<h1> through <h6>)
  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of source.matchAll(headingRegex)) {
    const tag = match[1].toLowerCase();
    const cleanText = stripHtmlTags(match[2]);
    if (cleanText) {
      headings.push({
        kind: 'heading',
        tag,
        value: cleanText,
        raw: match[0]
      });
    }
  }

  // 5. Extract IDs and data-testids
  const idRegex = /\b(?:id|data-testid|data-test)\s*=\s*(?:\{['"`]([^'"`]+)['"`]\}|"([^"]+)"|'([^']+)')/gi;
  for (const match of source.matchAll(idRegex)) {
    const value = (match[1] || match[2] || match[3] || '').trim();
    if (value) {
      anchors.push({
        kind: 'anchor',
        value,
        raw: match[0]
      });
    }
  }

  const totalCount = handlers.length + formControls.length + navigation.length + headings.length + anchors.length;

  return {
    handlers,
    formControls,
    navigation,
    headings,
    anchors,
    totalCount
  };
}

export function verifyKeptWiring(originalSource: string, transformedSource: string): WiringCheckResult {
  const before = extractWiring(originalSource);
  const after = extractWiring(transformedSource);
  const dropped: DroppedWiringItem[] = [];

  // Helper to normalize strings for comparison
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

  // Verify Handlers
  for (const h of before.handlers) {
    const retained = after.handlers.some(
      a => a.event === h.event && (norm(a.value) === norm(h.value) || a.value.includes(h.value) || h.value.includes(a.value))
    );
    if (!retained) {
      dropped.push({
        item: h,
        reason: `Dropped ${h.event} event handler: "${h.value}"`
      });
    }
  }

  // Verify Form Controls (inputs, selects, buttons with names/ids)
  for (const fc of before.formControls) {
    if (fc.name) {
      const retained = after.formControls.some(
        a => a.name === fc.name || (fc.tag === a.tag && a.value === fc.value)
      );
      if (!retained) {
        dropped.push({
          item: fc,
          reason: `Dropped form control <${fc.tag}> with identifier "${fc.name}"`
        });
      }
    }
  }

  // Verify Navigation Links (ignore dead '#' links because Sloppy intentionally refactors those)
  for (const nav of before.navigation) {
    if (nav.value && nav.value !== '#' && !nav.value.startsWith('javascript:')) {
      const retained = after.navigation.some(a => norm(a.value) === norm(nav.value));
      if (!retained) {
        dropped.push({
          item: nav,
          reason: `Dropped navigation destination: ${nav.tag} pointing to "${nav.value}"`
        });
      }
    }
  }

  // Verify Key Test IDs / Anchors
  for (const anchor of before.anchors) {
    const retained = after.anchors.some(a => a.value === anchor.value);
    if (!retained) {
      dropped.push({
        item: anchor,
        reason: `Dropped identity / test anchor attribute: "${anchor.value}"`
      });
    }
  }

  const passed = dropped.length === 0;
  const keptCount = before.totalCount - dropped.length;
  let details = `Wiring guard verified: ${keptCount}/${before.totalCount} connection(s) preserved.`;

  if (!passed) {
    details = `Wiring guard failed: ${dropped.length} connection(s) were dropped during transformation.`;
  }

  return {
    passed,
    totalBefore: before.totalCount,
    totalAfter: after.totalCount,
    keptCount,
    dropped,
    details
  };
}
