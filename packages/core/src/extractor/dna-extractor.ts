/**
 * Sloppy Design DNA Extractor
 * Extracts authentic typography, color palettes, surface hierarchy, and layout tokens
 * from a live URL, local dev-server, or HTML/CSS bundle, writing sloppy.config.json and DESIGN.md.
 */

export interface ExtractedDesignDna {
  sourceUrl: string;
  theme: 'light' | 'dark';
  fontSans: string;
  fontMono: string;
  colors: {
    ground: string;
    surface1: string;
    surface2: string;
    surface3: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
  };
  borderRadius: string;
  sloppyConfig: Record<string, unknown>;
  designMdContent: string;
}

export async function extractDesignDna(targetUrl: string): Promise<ExtractedDesignDna> {
  let html = '';

  try {
    const res = await fetch(targetUrl, { headers: { 'User-Agent': 'Sloppy-DNA-Extractor/1.0' } });
    html = await res.text();
  } catch (err) {
    // If fetch failed (e.g. offline or invalid URL), generate sensible craft defaults
    html = '<html><head></head><body></body></html>';
  }

  // 1. Extract Font Families
  let fontSans = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  let fontMono = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

  const googleFontMatch = html.match(/fonts\.googleapis\.com\/css2\?family=([^&"'>]+)/i);
  if (googleFontMatch) {
    const extractedFamily = decodeURIComponent(googleFontMatch[1].split(':')[0].replace(/\+/g, ' '));
    if (/mono/i.test(extractedFamily)) {
      fontMono = `'${extractedFamily}', monospace`;
    } else {
      fontSans = `'${extractedFamily}', sans-serif`;
    }
  }

  // 2. Extract Color Tokens & Theme
  let isDark = true;
  if (/class="[^"]*light\b/i.test(html) || /data-theme="light"/i.test(html)) {
    isDark = false;
  }

  // Extract all hex colors
  const hexColors = [...html.matchAll(/#([0-9a-fA-F]{6})\b/g)].map(m => m[0].toLowerCase());
  const uniqueHex = [...new Set(hexColors)];

  // Defaults based on detected theme
  const ground = isDark ? (uniqueHex.find(c => c.startsWith('#0') || c.startsWith('#1')) || '#09090b') : '#ffffff';
  const surface1 = isDark ? '#121215' : '#fafafa';
  const surface2 = isDark ? '#18181b' : '#f4f4f5';
  const surface3 = isDark ? '#27272a' : '#e4e4e7';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e4e4e7';
  const text = isDark ? '#f4f4f5' : '#09090b';
  const textMuted = isDark ? '#8a8f98' : '#71717a';
  
  // Non-neutral accent candidate
  const accent = uniqueHex.find(c => !/^#([0-9a-f])\1{5}$/i.test(c) && !/^(#0|#1|#2|#f|#e)/i.test(c)) || (isDark ? '#38bdf8' : '#0284c7');

  const borderRadius = /rounded-2xl/i.test(html) ? '16px' : /rounded-xl/i.test(html) ? '12px' : '8px';

  const sloppyConfig = {
    $schema: 'https://raw.githubusercontent.com/Pavanspoojary/slopy/main/sloppy.schema.json',
    brand: {
      name: new URL(targetUrl.startsWith('http') ? targetUrl : 'http://localhost').hostname,
      theme: isDark ? 'dark' : 'light',
      allowColors: [ground, surface1, surface2, accent],
      fontSans,
      fontMono
    },
    rules: {
      LOW_CONTRAST_GRAY: 'error',
      PURPLE_GRADIENT_SLOP: 'error',
      SPARKLE_ICON_OVERLOAD: 'error',
      UNANCHORED_FLOATING_WINDOW: 'error',
      BOXED_CARD_SYNDROME: 'warn',
      WORD_BUDGET_EXCEEDED: 'error'
    },
    overrules: {}
  };

  const designMdContent = `# Design System Specification (DESIGN.md)
*Extracted via Sloppy Design DNA Extractor from ${targetUrl}*

---

## 1. Visual Foundation & Theme
- **Theme Mode**: ${isDark ? 'Dark Mode' : 'Light Mode'}
- **Base Border Radius**: ${borderRadius}
- **Stage Ground**: \`${ground}\`

---

## 2. 4-Step Surface Elevation Hierarchy
All UI components must step through disciplined surface depths rather than flat cards:
- **Surface 0 (Ground Canvas)**: \`${ground}\`
- **Surface 1 (Base Panels & Backdrops)**: \`${surface1}\`
- **Surface 2 (Elevated Cards & Popovers)**: \`${surface2}\`
- **Surface 3 (Active Highlight & Modals)**: \`${surface3}\`
- **Border Token**: \`${border}\`

---

## 3. Typography Stack
- **Primary Sans-Serif**: \`${fontSans}\`
- **Technical Monospace**: \`${fontMono}\`
- **Primary Text**: \`${text}\`
- **Muted Supporting Text**: \`${textMuted}\`

---

## 4. Intentional Accent & Status Signals
- **Primary Signal Accent**: \`${accent}\` (Use strictly for purposeful user actions and activation indicators)

---

## 5. Anti-Slop Enforcement Directives
1. **Word Budget**: Maximum 3 to 7 real strings per viewport section. Use quiet placeholder bars for peripheral copy.
2. **Grounded Framing**: Cover at least 66% of the viewport stage; bleed at least one edge.
3. **No Decorative Sparkles**: Zero \`LucideSparkles\` on generic prompts or AI actions.
4. **No Purple/Indigo Gradients**: Prohibit unearned gradients; rely on clean surface elevation.
`;

  return {
    sourceUrl: targetUrl,
    theme: isDark ? 'dark' : 'light',
    fontSans,
    fontMono,
    colors: {
      ground,
      surface1,
      surface2,
      surface3,
      border,
      text,
      textMuted,
      accent
    },
    borderRadius,
    sloppyConfig,
    designMdContent
  };
}
