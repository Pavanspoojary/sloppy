export interface LookDefinition {
  name: string;
  theme: 'light' | 'dark';
  description: string;
  accent: string;
  background: string;
  surface1: string;
  surface2: string;
  surface3: string;
  border: string;
  text: string;
  textMuted: string;
  cssVariables: Record<string, string>;
}

export const LOOKS: Record<string, LookDefinition> = {
  minimal: {
    name: 'minimal',
    theme: 'light',
    description: 'Quiet grays, high restraint, calm editorial contrast.',
    accent: '#09090b',
    background: '#ffffff',
    surface1: '#fafafa',
    surface2: '#f4f4f5',
    surface3: '#e4e4e7',
    border: '#e4e4e7',
    text: '#09090b',
    textMuted: '#71717a',
    cssVariables: {
      '--ss-bg': '#ffffff',
      '--ss-surface-1': '#fafafa',
      '--ss-surface-2': '#f4f4f5',
      '--ss-surface-3': '#e4e4e7',
      '--ss-border': '#e4e4e7',
      '--ss-text': '#09090b',
      '--ss-text-muted': '#71717a',
      '--ss-accent': '#09090b'
    }
  },
  linear: {
    name: 'linear',
    theme: 'dark',
    description: 'Disciplined dark mode, micro-borders, deep blacks, refined purple/indigo accent used strictly for signals.',
    accent: '#5E6AD2',
    background: '#08090a',
    surface1: '#0f1011',
    surface2: '#16181a',
    surface3: '#222529',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#f7f8f8',
    textMuted: '#8a8f98',
    cssVariables: {
      '--ss-bg': '#08090a',
      '--ss-surface-1': '#0f1011',
      '--ss-surface-2': '#16181a',
      '--ss-surface-3': '#222529',
      '--ss-border': 'rgba(255, 255, 255, 0.08)',
      '--ss-text': '#f7f8f8',
      '--ss-text-muted': '#8a8f98',
      '--ss-accent': '#5E6AD2'
    }
  },
  radix: {
    name: 'radix',
    theme: 'light',
    description: 'Accessible, systematic, clean slate styling based on Radix UI token hierarchy.',
    accent: '#0091ff',
    background: '#fcfcfc',
    surface1: '#f8f8f8',
    surface2: '#f1f1f1',
    surface3: '#e8e8e8',
    border: '#d9d9d9',
    text: '#11181c',
    textMuted: '#687076',
    cssVariables: {
      '--ss-bg': '#fcfcfc',
      '--ss-surface-1': '#f8f8f8',
      '--ss-surface-2': '#f1f1f1',
      '--ss-surface-3': '#e8e8e8',
      '--ss-border': '#d9d9d9',
      '--ss-text': '#11181c',
      '--ss-text-muted': '#687076',
      '--ss-accent': '#0091ff'
    }
  },
  raycast: {
    name: 'raycast',
    theme: 'dark',
    description: 'Stark command-palette focus, high contrast, crisp shadows, red/orange signal accents.',
    accent: '#FF6363',
    background: '#111113',
    surface1: '#18181b',
    surface2: '#232326',
    surface3: '#2e2e32',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#ededed',
    textMuted: '#a1a1aa',
    cssVariables: {
      '--ss-bg': '#111113',
      '--ss-surface-1': '#18181b',
      '--ss-surface-2': '#232326',
      '--ss-surface-3': '#2e2e32',
      '--ss-border': 'rgba(255, 255, 255, 0.1)',
      '--ss-text': '#ededed',
      '--ss-text-muted': '#a1a1aa',
      '--ss-accent': '#FF6363'
    }
  },
  blueprint: {
    name: 'blueprint',
    theme: 'dark',
    description: 'Architectural, engineering-grade monospace style with blueprint cyan accents and grid marks.',
    accent: '#00d2ff',
    background: '#041226',
    surface1: '#071d3a',
    surface2: '#0b2b54',
    surface3: '#103d74',
    border: 'rgba(0, 210, 255, 0.2)',
    text: '#e6f7ff',
    textMuted: '#79a8d7',
    cssVariables: {
      '--ss-bg': '#041226',
      '--ss-surface-1': '#071d3a',
      '--ss-surface-2': '#0b2b54',
      '--ss-surface-3': '#103d74',
      '--ss-border': 'rgba(0, 210, 255, 0.2)',
      '--ss-text': '#e6f7ff',
      '--ss-text-muted': '#79a8d7',
      '--ss-accent': '#00d2ff'
    }
  },
  glass: {
    name: 'glass',
    theme: 'dark',
    description: 'Translucent frosted glass over subtle gradient underlay with soft specular border highlights.',
    accent: '#ffffff',
    background: '#090a0f',
    surface1: 'rgba(255, 255, 255, 0.05)',
    surface2: 'rgba(255, 255, 255, 0.08)',
    surface3: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    cssVariables: {
      '--ss-bg': '#090a0f',
      '--ss-surface-1': 'rgba(255, 255, 255, 0.05)',
      '--ss-surface-2': 'rgba(255, 255, 255, 0.08)',
      '--ss-surface-3': 'rgba(255, 255, 255, 0.12)',
      '--ss-border': 'rgba(255, 255, 255, 0.15)',
      '--ss-text': '#ffffff',
      '--ss-text-muted': 'rgba(255, 255, 255, 0.65)',
      '--ss-accent': '#ffffff'
    }
  },
  'dark-hero': {
    name: 'dark-hero',
    theme: 'dark',
    description: 'True black background with high elevation steps, emerald/cyan accents, and laser focus.',
    accent: '#10b981',
    background: '#000000',
    surface1: '#0a0a0a',
    surface2: '#141414',
    surface3: '#1f1f1f',
    border: '#262626',
    text: '#f5f5f5',
    textMuted: '#a3a3a3',
    cssVariables: {
      '--ss-bg': '#000000',
      '--ss-surface-1': '#0a0a0a',
      '--ss-surface-2': '#141414',
      '--ss-surface-3': '#1f1f1f',
      '--ss-border': '#262626',
      '--ss-text': '#f5f5f5',
      '--ss-text-muted': '#a3a3a3',
      '--ss-accent': '#10b981'
    }
  }
};

export function getLook(name: string): LookDefinition {
  const clean = name.toLowerCase().trim();
  return LOOKS[clean] || LOOKS.linear;
}
