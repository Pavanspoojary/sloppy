export interface PatternEntry {
  id: string;
  name: string;
  category: 'gold' | 'product-study' | 'interaction' | 'bento' | 'layout' | 'device';
  theme: 'light' | 'dark' | 'adaptive';
  summary: string;
  focalPoint: string;
  tags: string[];
  hasMotion: boolean;
  idealDimensions: { width: number; height: number };
}

export const PATTERNS_CATALOG: PatternEntry[] = [
  {
    id: 'linear',
    name: 'Linear Issue Tracking',
    category: 'product-study',
    theme: 'dark',
    summary: 'Dark issue board with keyboard shortcuts, command menu, and subtle status pills.',
    focalPoint: 'Selected issue triage with hotkey actions and instant response.',
    tags: ['linear', 'dark', 'issues', 'keyboard', 'dev-tool', 'triage'],
    hasMotion: true,
    idealDimensions: { width: 960, height: 480 }
  },
  {
    id: 'static-card',
    name: 'Quiet Feature Card',
    category: 'gold',
    theme: 'light',
    summary: 'Restrained feature card with 1 satellite, quiet hierarchy, and real words on 3 focal rows.',
    focalPoint: 'Selected customer and total balance; placeholder bars on neighbors.',
    tags: ['card', 'still', 'restraint', 'satellite', 'finance', 'bento-tile'],
    hasMotion: false,
    idealDimensions: { width: 440, height: 320 }
  },
  {
    id: 'hero-demo',
    name: 'Hero Walkthrough with Cursor',
    category: 'gold',
    theme: 'light',
    summary: 'Flagship hero demonstration with smooth cursor choreography and terminal satellite.',
    focalPoint: 'Five beats of deliberate cursor action with an annotation callout.',
    tags: ['hero', 'cursor', 'walkthrough', 'terminal', 'annotation', 'flagship'],
    hasMotion: true,
    idealDimensions: { width: 760, height: 380 }
  },
  {
    id: 'ai-chat',
    name: 'AI Chat Without Sparkles',
    category: 'gold',
    theme: 'light',
    summary: 'Modern AI conversation stream: thinking state, clean typography, sources last. Zero purple gradients, zero sparkles.',
    focalPoint: 'Thoughtful token streaming with height reservation and structured citations.',
    tags: ['ai', 'chat', 'llm', 'streaming', 'clean', 'no-sparkles', 'anti-slop'],
    hasMotion: true,
    idealDimensions: { width: 680, height: 420 }
  },
  {
    id: 'ai-cards',
    name: 'AI Inline Card Actions',
    category: 'gold',
    theme: 'light',
    summary: 'AI thread with interactive multiple-choice card retained in history and button confirmation.',
    focalPoint: 'Multiple choice decision card answered inline without modal disruption.',
    tags: ['ai', 'cards', 'inline', 'confirmation', 'assistant'],
    hasMotion: true,
    idealDimensions: { width: 680, height: 440 }
  },
  {
    id: 'dark-bento',
    name: 'Dark Bento Tile',
    category: 'bento',
    theme: 'dark',
    summary: 'One strong signal said once; deep dark background with single accent highlight.',
    focalPoint: 'A single dominant stat or waveform with quiet neighbor tiles.',
    tags: ['bento', 'dark', 'audio', 'stat', 'minimal'],
    hasMotion: false,
    idealDimensions: { width: 500, height: 360 }
  },
  {
    id: 'dark-hero',
    name: 'Dark Elevated Hero',
    category: 'gold',
    theme: 'dark',
    summary: 'Elevation depth from multi-step surfaces on true black, single lit color, pill status.',
    focalPoint: 'Status change on an elevated pill container without whole-card redraw.',
    tags: ['hero', 'dark', 'elevation', 'status', 'pill'],
    hasMotion: true,
    idealDimensions: { width: 840, height: 420 }
  },
  {
    id: 'payout-flow',
    name: 'Payout Choreography',
    category: 'interaction',
    theme: 'light',
    summary: 'Overlapping arrivals, reading time, and a payoff that holds for 2.5 seconds.',
    focalPoint: 'Staggered data resolution with zero unearned bounce.',
    tags: ['finance', 'choreography', 'payout', 'flow', 'settle'],
    hasMotion: true,
    idealDimensions: { width: 700, height: 360 }
  },
  {
    id: 'chart-scrub',
    name: 'Interactive Chart Scrub',
    category: 'interaction',
    theme: 'light',
    summary: 'Hairline and dot tracking the pointer with rolling headline numbers.',
    focalPoint: 'Pointer scrub with smooth rolling number transitions (no jump swaps).',
    tags: ['chart', 'scrub', 'numbers', 'finance', 'interactive'],
    hasMotion: true,
    idealDimensions: { width: 640, height: 320 }
  },
  {
    id: 'table-edit',
    name: 'In-Place Table Cell Edit',
    category: 'interaction',
    theme: 'light',
    summary: 'Cell edited directly with cursor; downstream totals roll a beat later with dependent timing.',
    focalPoint: 'Direct manipulation with delayed dependent ripple effect.',
    tags: ['table', 'edit', 'spreadsheet', 'totals', 'cursor'],
    hasMotion: true,
    idealDimensions: { width: 720, height: 380 }
  },
  {
    id: 'reorder',
    name: 'Drag to Reorder List',
    category: 'interaction',
    theme: 'light',
    summary: 'Row lifted by its grip handle, neighbor rows sliding cleanly to make room.',
    focalPoint: 'Smooth grab offset, physics-settling drop slot.',
    tags: ['drag', 'reorder', 'list', 'sort', 'grip'],
    hasMotion: true,
    idealDimensions: { width: 520, height: 360 }
  },
  {
    id: 'form-error',
    name: 'Field-Level Form Error & Fix',
    category: 'interaction',
    theme: 'light',
    summary: 'Error anchored to the exact causing field; cleared upon correction; button confirms on itself.',
    focalPoint: 'Error resolution without jarring layout shift or generic modal alert.',
    tags: ['form', 'validation', 'error', 'inline', 'auth'],
    hasMotion: true,
    idealDimensions: { width: 560, height: 340 }
  },
  {
    id: 'raycast',
    name: 'Raycast Command Palette',
    category: 'product-study',
    theme: 'dark',
    summary: 'High-contrast launcher with red badge accents, fuzzy search input, and action panel.',
    focalPoint: 'Instant search filtering with crisp keybinding indicators.',
    tags: ['raycast', 'command-palette', 'dark', 'launcher', 'keyboard'],
    hasMotion: true,
    idealDimensions: { width: 680, height: 420 }
  },
  {
    id: 'slack',
    name: 'Slack Channel & Canvas',
    category: 'product-study',
    theme: 'adaptive',
    summary: 'Sidebar navigation, message stream with real avatars, and collaborative canvas panel.',
    focalPoint: 'Clean message bubble thread with thread reply counter.',
    tags: ['slack', 'chat', 'collaboration', 'messaging', 'teams'],
    hasMotion: true,
    idealDimensions: { width: 880, height: 460 }
  },
  {
    id: 'figma',
    name: 'Figma Canvas & Properties',
    category: 'product-study',
    theme: 'adaptive',
    summary: 'Layer tree, infinite artboard canvas with live multi-user cursors, and property inspector.',
    focalPoint: 'Live collaborator selection with colored cursor labels.',
    tags: ['figma', 'design', 'canvas', 'collaboration', 'cursors'],
    hasMotion: true,
    idealDimensions: { width: 920, height: 500 }
  },
  {
    id: 'spotify',
    name: 'Spotify Player & Queue',
    category: 'product-study',
    theme: 'dark',
    summary: 'Dark album view, scrubber bar, dynamic lyrics pane, and track list.',
    focalPoint: 'Scrubber progress bar with track title scroll.',
    tags: ['spotify', 'music', 'player', 'dark', 'media'],
    hasMotion: true,
    idealDimensions: { width: 780, height: 420 }
  },
  {
    id: 'notion',
    name: 'Notion Database & Page',
    category: 'product-study',
    theme: 'light',
    summary: 'Minimal page header, slash command menu, and inline table properties.',
    focalPoint: 'Slash command menu popup anchored to active line.',
    tags: ['notion', 'docs', 'database', 'slash-menu', 'editor'],
    hasMotion: true,
    idealDimensions: { width: 840, height: 460 }
  },
  {
    id: 'dynamic-island',
    name: 'Dynamic Island Expansion',
    category: 'device',
    theme: 'dark',
    summary: 'Black pill expanding smoothly to show live activity state then settling back.',
    focalPoint: 'Geometry morph from compact pill to rich activity HUD.',
    tags: ['ios', 'phone', 'dynamic-island', 'morph', 'hud'],
    hasMotion: true,
    idealDimensions: { width: 420, height: 260 }
  },
  {
    id: 'device-pair',
    name: 'Window and Phone Pair',
    category: 'device',
    theme: 'light',
    summary: 'Desktop dashboard with a mobile phone straddling the margin, telling one synchronized event.',
    focalPoint: 'Desktop action triggering instant mobile notification.',
    tags: ['device-pair', 'phone', 'desktop', 'cross-platform', 'push'],
    hasMotion: true,
    idealDimensions: { width: 860, height: 440 }
  },
  {
    id: 'bento',
    name: 'Bento Feature Grid',
    category: 'bento',
    theme: 'adaptive',
    summary: 'Complete bento grid: 1 hero window + 1 metric + 1 satellite device + 1 diagram.',
    focalPoint: 'Clear eye path from dominant top-left hero to supporting tiles.',
    tags: ['bento', 'grid', 'landing-page', 'features', 'marketing'],
    hasMotion: false,
    idealDimensions: { width: 960, height: 560 }
  }
];

export function searchPatterns(query: string, options: { category?: string; theme?: string; limit?: number } = {}): PatternEntry[] {
  const q = query.toLowerCase().trim();
  const limit = options.limit || 10;

  return PATTERNS_CATALOG.filter(entry => {
    if (options.category && options.category !== 'all' && entry.category !== options.category) {
      return false;
    }
    if (options.theme && options.theme !== 'any' && entry.theme !== options.theme && entry.theme !== 'adaptive') {
      return false;
    }
    if (!q) return true;

    return (
      entry.id.includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.focalPoint.toLowerCase().includes(q) ||
      entry.tags.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, limit);
}

export function getPatternById(id: string): PatternEntry | undefined {
  const clean = id.toLowerCase().trim();
  return PATTERNS_CATALOG.find(p => p.id === clean);
}


export * from './libraries.js';
export * from './components.js';
import { searchAllComponents } from './components.js';

export function searchSloppyRegistry(query: string, options: { library?: string; category?: string; limit?: number } = {}) {
  const compResults = searchAllComponents(query, options);
  const patternResults = searchPatterns(query, { category: options.category, limit: options.limit });
  
  return {
    components: compResults,
    patterns: patternResults,
    total: compResults.length + patternResults.length
  };
}
