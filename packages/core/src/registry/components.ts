export type LibraryId =
  | 'stageshow'
  | 'shadcn'
  | 'motion-primitives'
  | 'magicui'
  | 'react-bits'
  | 'animate-ui'
  | 'kokonutui';

export type ComponentCategory =
  | 'primitive'
  | 'interaction'
  | 'background'
  | 'text-animation'
  | 'product-shot'
  | 'bento-grid'
  | 'feedback'
  | 'navigation'
  | 'ai';

export interface ComponentEntry {
  id: string; // e.g. "motion-primitives/morphing-dialog"
  name: string; // "Morphing Dialog"
  library: LibraryId;
  category: ComponentCategory;
  description: string;
  antiSlopRating: 'pure-craft' | 'restrained' | 'needs-taming';
  antiSlopGuidance: string;
  dependencies: string[];
  tags: string[];
  sourcePath: string; // relative to packages/components/
}

export const SLOPPY_COMPONENTS: ComponentEntry[] = [
  // --- STAGESHOW (The Anti-Slop Foundation) ---
  {
    id: 'stageshow/stage',
    name: 'Stage Canvas',
    library: 'stageshow',
    category: 'product-shot',
    description: 'The master viewport frame that establishes camera scale, aspect ratio, and theme ground.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'The page is the ground: if the site is dark, set look="linear". Fill at least 2/3 of available width; never shrink with air on 4 sides.',
    dependencies: [],
    tags: ['stage', 'canvas', 'framing', 'viewport', 'scale'],
    sourcePath: 'stageshow/stage.tsx'
  },
  {
    id: 'stageshow/window',
    name: 'Window Frame',
    library: 'stageshow',
    category: 'product-shot',
    description: 'Believable application window with accurate traffic lights, subtle border steps, and bleed capabilities.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Let rows or filler bleed off the bottom or sides to imply infinite continuity. Keep focal content centered.',
    dependencies: [],
    tags: ['window', 'chrome', 'mockup', 'framing', 'app'],
    sourcePath: 'stageshow/window.tsx'
  },
  {
    id: 'stageshow/phone',
    name: 'Phone Frame',
    library: 'stageshow',
    category: 'product-shot',
    description: 'Crisp, accurate mobile bezel and status bar rendered in CSS.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'When pairing with a desktop window, let the phone straddle the edge over margins, never covering the primary figure.',
    dependencies: [],
    tags: ['phone', 'mobile', 'device', 'mockup', 'ios'],
    sourcePath: 'stageshow/phone.tsx'
  },
  {
    id: 'stageshow/cursor',
    name: 'Choreographed Cursor',
    library: 'stageshow',
    category: 'interaction',
    description: 'Scriptable cursor with hover, click press feedback, and 5 cursor styles (pointer, text, resize, grab).',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Every cursor movement must have a visible purpose. Always show press feedback before changing state.',
    dependencies: [],
    tags: ['cursor', 'pointer', 'choreography', 'click', 'act'],
    sourcePath: 'stageshow/cursor.tsx'
  },
  {
    id: 'stageshow/act',
    name: 'Act Choreographer',
    library: 'stageshow',
    category: 'interaction',
    description: 'Declarative animation driver with overlapping beats, ease curves, and lingering payoffs.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Hold the payoff on screen for at least 2.5 seconds for reading time. Do not rush to loop.',
    dependencies: [],
    tags: ['act', 'animation', 'choreography', 'timeline', 'beats'],
    sourcePath: 'stageshow/act.ts'
  },

  // --- MOTION PRIMITIVES (Emil Kowalski / ibelick) ---
  {
    id: 'motion-primitives/morphing-dialog',
    name: 'Morphing Dialog',
    library: 'motion-primitives',
    category: 'interaction',
    description: 'Card smoothly expands into a full dialog with layout spring animation.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep spring stiffness moderate (stiffness: 260, damping: 25). Avoid sudden scale popping. Ensure modal background has sufficient contrast.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['dialog', 'modal', 'morph', 'expand', 'spring'],
    sourcePath: 'motion-primitives/morphing-dialog.tsx'
  },
  {
    id: 'motion-primitives/sliding-number',
    name: 'Sliding Number',
    library: 'motion-primitives',
    category: 'interaction',
    description: 'Individual digit wheels that roll smoothly when numbers change without layout shifts.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Anti-slop rule: Never jump-swap numbers. Use sliding number for financial totals, MRR, or counters to provide visual continuity.',
    dependencies: ['framer-motion'],
    tags: ['numbers', 'counter', 'ticker', 'finance', 'roll'],
    sourcePath: 'motion-primitives/sliding-number.tsx'
  },
  {
    id: 'motion-primitives/text-roll',
    name: 'Text Roll',
    library: 'motion-primitives',
    category: 'text-animation',
    description: 'Kinetic rolling letter animation on hover or state change.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Use strictly on interactive button labels or brand marks. Never use on body text or multiple headings simultaneously.',
    dependencies: ['framer-motion'],
    tags: ['text', 'roll', 'hover', 'typography', 'button'],
    sourcePath: 'motion-primitives/text-roll.tsx'
  },
  {
    id: 'motion-primitives/dock',
    name: 'macOS Magnification Dock',
    library: 'motion-primitives',
    category: 'navigation',
    description: 'Smooth magnetic magnification dock with physics-based icon scaling.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep magnification ratio subtle (max 1.5x). Ground the dock at the stage bottom with quiet surface reflection.',
    dependencies: ['framer-motion'],
    tags: ['dock', 'macos', 'navigation', 'magnetic', 'magnification'],
    sourcePath: 'motion-primitives/dock.tsx'
  },
  {
    id: 'motion-primitives/border-trail',
    name: 'Border Trail',
    library: 'motion-primitives',
    category: 'interaction',
    description: 'Subtle glowing beam tracing the border of a card or button.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Keep beam opacity low (<0.5) and speed measured (>5s per loop). Limit to 1 active border trail per viewport.',
    dependencies: ['framer-motion'],
    tags: ['border', 'trail', 'glow', 'card', 'highlight'],
    sourcePath: 'motion-primitives/border-trail.tsx'
  },
  {
    id: 'motion-primitives/morphing-popover',
    name: 'Morphing Popover',
    library: 'motion-primitives',
    category: 'interaction',
    description: 'Trigger button smoothly morphs into an expanded interactive popover card.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep popover content concise. Do not nest complex multi-column forms inside miniature popovers.',
    dependencies: ['framer-motion'],
    tags: ['popover', 'morph', 'menu', 'interactive', 'expand'],
    sourcePath: 'motion-primitives/morphing-popover.tsx'
  },

  // --- MAGIC UI (Landing & Hero Animations) ---
  {
    id: 'magicui/animated-beam',
    name: 'Animated Beam',
    library: 'magicui',
    category: 'interaction',
    description: 'Visual SVG connection beam with moving light pulses between UI nodes.',
    antiSlopRating: 'needs-taming',
    antiSlopGuidance: 'Limit to 1 connected diagram per page. Use monochromatic beams or subtle cyan/emerald; never use rainbow or bright purple gradients. Set duration > 4s.',
    dependencies: ['framer-motion'],
    tags: ['beam', 'connector', 'diagram', 'flow', 'pipeline'],
    sourcePath: 'magicui/animated-beam.tsx'
  },
  {
    id: 'magicui/bento-grid',
    name: 'Magic Bento Grid',
    library: 'magicui',
    category: 'bento-grid',
    description: 'Modern bento grid container with hover spotlight and responsive cell spans.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Always make 1 tile dominant (2x2 or 2x1 hero). Vary cell contents (1 demo + 1 stat + 1 satellite). Never make 4 identical cards.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['bento', 'grid', 'features', 'marketing', 'tiles'],
    sourcePath: 'magicui/bento-grid.tsx'
  },
  {
    id: 'magicui/border-beam',
    name: 'Border Beam',
    library: 'magicui',
    category: 'interaction',
    description: 'Luminous light beam traveling smoothly along the perimeter of an element.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Use only on the primary hero callout. Avoid neon purple; use cool white, slate, or brand accent with high blur.',
    dependencies: ['framer-motion'],
    tags: ['border', 'beam', 'hero', 'highlight', 'glow'],
    sourcePath: 'magicui/border-beam.tsx'
  },
  {
    id: 'magicui/marquee',
    name: 'Infinite Marquee',
    library: 'magicui',
    category: 'interaction',
    description: 'Smooth horizontal continuous ticker for client logos, reviews, or badges.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Monochrome logos only! Use grayscale logo marks with opacity 0.5 to prevent jarring brand color clashes.',
    dependencies: [],
    tags: ['marquee', 'ticker', 'logos', 'social-proof', 'scroll'],
    sourcePath: 'magicui/marquee.tsx'
  },
  {
    id: 'magicui/number-ticker',
    name: 'Number Ticker',
    library: 'magicui',
    category: 'interaction',
    description: 'Spring-driven incrementing number animation triggered when in view.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Ensure numbers format with proper locale commas (Intl.NumberFormat). Avoid decimal churn.',
    dependencies: ['framer-motion'],
    tags: ['number', 'ticker', 'counter', 'stat', 'metrics'],
    sourcePath: 'magicui/number-ticker.tsx'
  },

  // --- KOKONUT UI (AI Interfaces & Sleek Dashboards) ---
  {
    id: 'kokonutui/ai-prompt',
    name: 'AI Prompt Input Bar',
    library: 'kokonutui',
    category: 'ai',
    description: 'Sleek, restrained multimodal prompt composer with model pill selector and clean action buttons.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'No sparkle icons! Clean send arrow and subtle border focus ring. Quiet dark background with true micro-borders.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['ai', 'prompt', 'input', 'chat', 'composer'],
    sourcePath: 'kokonutui/ai-prompt.tsx'
  },
  {
    id: 'kokonutui/ai-agent-lanes',
    name: 'AI Agent Multi-Lane Workflow',
    library: 'kokonutui',
    category: 'ai',
    description: 'Multi-column parallel task visualizer for autonomous agent subtasks with status pills.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep status badges monochromatic with single dot indicators. Avoid glowing animated rings on inactive lanes.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['ai', 'agents', 'lanes', 'workflow', 'tasks'],
    sourcePath: 'kokonutui/ai-agent-lanes.tsx'
  },
  {
    id: 'kokonutui/ai-tool-approval',
    name: 'AI Tool Execution Approval Card',
    library: 'kokonutui',
    category: 'ai',
    description: 'Clean diff and authorization confirmation card for AI tool actions.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Show explicit diff parameters. Use quiet emerald and amber badges rather than loud neon buttons.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['ai', 'tools', 'approval', 'security', 'card'],
    sourcePath: 'kokonutui/ai-tool-approval.tsx'
  },
  {
    id: 'kokonutui/ai-citations',
    name: 'AI Grounded Citations Drawer',
    library: 'kokonutui',
    category: 'ai',
    description: 'Source citations list anchored to AI answers with preview cards.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep citations secondary to the answer. Reveal sources on hover or click rather than cluttering inline prose.',
    dependencies: ['framer-motion', 'lucide-react'],
    tags: ['ai', 'citations', 'sources', 'drawer', 'grounding'],
    sourcePath: 'kokonutui/ai-citations.tsx'
  },

  // --- SHADCN / UI (The Industry Standard Primitives) ---
  {
    id: 'shadcn/button',
    name: 'Accessible Button',
    library: 'shadcn',
    category: 'primitive',
    description: 'Variants: default, destructive, outline, secondary, ghost, link, with size hierarchy.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Never use purple-to-indigo gradient fills. Pick either high-contrast black/white or subtle outline with surface background.',
    dependencies: ['@radix-ui/react-slot', 'class-variance-authority'],
    tags: ['button', 'primitive', 'interactive', 'cta', 'radix'],
    sourcePath: 'shadcn/button.tsx'
  },
  {
    id: 'shadcn/dialog',
    name: 'Modal Dialog',
    library: 'shadcn',
    category: 'primitive',
    description: 'Accessible modal dialog with overlay, header, footer, and focus lock.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Use dialogs only for decisive user flows (e.g. Confirm Delete, Checkout). Do not use dialogs for minor notifications.',
    dependencies: ['@radix-ui/react-dialog', 'lucide-react'],
    tags: ['dialog', 'modal', 'overlay', 'radix', 'primitive'],
    sourcePath: 'shadcn/dialog.tsx'
  },
  {
    id: 'shadcn/card',
    name: 'Semantic Card',
    library: 'shadcn',
    category: 'primitive',
    description: 'Card container with CardHeader, CardTitle, CardDescription, CardContent, CardFooter.',
    antiSlopRating: 'needs-taming',
    antiSlopGuidance: 'Avoid wrapping every item on screen in identical bordered cards with p-6. Vary surface depth and use borderless row lists.',
    dependencies: [],
    tags: ['card', 'container', 'primitive', 'layout'],
    sourcePath: 'shadcn/card.tsx'
  },
  {
    id: 'shadcn/tabs',
    name: 'Tabs',
    library: 'shadcn',
    category: 'navigation',
    description: 'Accessible tab bar switching between tab panels with keyboard navigation.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Use pill style or line indicator. Keep active tab text high contrast.',
    dependencies: ['@radix-ui/react-tabs'],
    tags: ['tabs', 'navigation', 'switcher', 'radix', 'primitive'],
    sourcePath: 'shadcn/tabs.tsx'
  },
  {
    id: 'shadcn/table',
    name: 'Data Table',
    library: 'shadcn',
    category: 'primitive',
    description: 'Clean semantic HTML table with TableHeader, TableRow, TableHead, TableBody, TableCell.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Right-align numeric columns! Keep padding comfortable (p-3/p-4). Use quiet divider lines (border-border/40).',
    dependencies: [],
    tags: ['table', 'data', 'grid', 'primitive', 'spreadsheet'],
    sourcePath: 'shadcn/table.tsx'
  },

  // --- ANIMATE UI (Fluid Radix Controls) ---
  {
    id: 'animate-ui/menubar',
    name: 'Animated Menubar',
    library: 'animate-ui',
    category: 'navigation',
    description: 'Desktop application menubar with spring animated sub-menu cascades.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Provide real keyboard shortcuts in right gutter (e.g. Cmd+K, Esc).',
    dependencies: ['@radix-ui/react-menubar', 'framer-motion'],
    tags: ['menubar', 'menu', 'desktop', 'navigation', 'radix'],
    sourcePath: 'animate-ui/menubar.rhea.tsx'
  },
  {
    id: 'animate-ui/dropdown',
    name: 'Fluid Dropdown Menu',
    library: 'animate-ui',
    category: 'navigation',
    description: 'Spring-damped dropdown menu with animated indicator and selection highlighting.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Ensure dropdown stays inside visible viewport bounds. Do not clip over bottom edge.',
    dependencies: ['@radix-ui/react-dropdown-menu', 'framer-motion'],
    tags: ['dropdown', 'menu', 'spring', 'radix'],
    sourcePath: 'animate-ui/dropdown-menu.maia.tsx'
  },

  // --- REACT BITS (Atmospheric Backgrounds & Kinetic Typography) ---
  {
    id: 'react-bits/spotlight',
    name: 'Spotlight Card',
    library: 'react-bits',
    category: 'interaction',
    description: 'Dynamic radial gradient following the cursor across card boundaries.',
    antiSlopRating: 'pure-craft',
    antiSlopGuidance: 'Keep spotlight opacity low (rgba(255,255,255,0.06) on dark). The spotlight should feel like physical ambient lighting, not a flashlight.',
    dependencies: [],
    tags: ['spotlight', 'radial', 'hover', 'card', 'lighting'],
    sourcePath: 'react-bits/spotlight.tsx'
  },
  {
    id: 'react-bits/aurora',
    name: 'Aurora Atmospheric Canvas',
    library: 'react-bits',
    category: 'background',
    description: 'Slow, organic mesh gradient creating rich northern-lights ambient lighting.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Keep underlay opacity low (<0.15). Blur radius must be high (>60px). Use as a background plate behind sharp typography.',
    dependencies: [],
    tags: ['aurora', 'background', 'mesh', 'ambient', 'canvas'],
    sourcePath: 'react-bits/aurora.tsx'
  },
  {
    id: 'react-bits/split-text',
    name: 'Split Text Reveal',
    library: 'react-bits',
    category: 'text-animation',
    description: 'Characters or words staggered smoothly into view with spring easing.',
    antiSlopRating: 'restrained',
    antiSlopGuidance: 'Use only on the primary hero headline. Never animate body copy or paragraphs with character splitting.',
    dependencies: ['framer-motion'],
    tags: ['text', 'split', 'reveal', 'typography', 'kinetic'],
    sourcePath: 'react-bits/split-text.tsx'
  },
  {
    id: 'react-bits/hyperspeed',
    name: 'Hyperspeed Starfield Canvas',
    library: 'react-bits',
    category: 'background',
    description: 'High-speed 3D perspective warp lines rendered on WebGL canvas.',
    antiSlopRating: 'needs-taming',
    antiSlopGuidance: 'Limit strictly to high-energy developer landing page heroes. Keep speed measured and contrast low so foreground copy remains 100% legible.',
    dependencies: ['three'],
    tags: ['hyperspeed', 'stars', '3d', 'webgl', 'hero'],
    sourcePath: 'react-bits/hyperspeed.tsx'
  }
];

export function searchAllComponents(
  queryOrOptions: string | { query?: string; library?: string; category?: string; limit?: number } = '',
  options: { library?: string; category?: string; limit?: number } = {}
): ComponentEntry[] {
  let query = '';
  let opts = options;

  if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
    query = queryOrOptions.query || '';
    opts = { ...queryOrOptions, ...options };
  } else if (typeof queryOrOptions === 'string') {
    query = queryOrOptions;
  }

  const q = query.toLowerCase().trim();
  const limit = opts.limit || 20;

  return SLOPPY_COMPONENTS.filter(comp => {
    if (opts.library && opts.library !== 'all' && comp.library !== opts.library) {
      return false;
    }
    if (opts.category && opts.category !== 'all' && comp.category !== opts.category) {
      return false;
    }
    if (!q) return true;

    return (
      comp.id.toLowerCase().includes(q) ||
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.antiSlopGuidance.toLowerCase().includes(q) ||
      comp.tags.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, limit);
}

export function getComponentById(id: string): ComponentEntry | undefined {
  const clean = id.toLowerCase().trim();
  return SLOPPY_COMPONENTS.find(c => c.id === clean || c.id.endsWith(`/${clean}`));
}
