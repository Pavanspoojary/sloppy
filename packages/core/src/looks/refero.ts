import type { LookDefinition } from './index.js';

// Curated from Refero Styles (https://styles.refero.design), which publishes
// DESIGN.md token tables for real production sites. Every value below is taken
// from the published palette; surface steps are ordered by the site's own
// background, panel, and border roles rather than invented.
//
// These are reference looks, not endorsements. They exist so an agent can reach
// for a real, coherent system instead of synthesizing another purple gradient.

export const REFERO_LOOKS: Record<string, LookDefinition> = {
  nuxt: {
    name: 'nuxt',
    theme: 'dark',
    description: 'Blue-black framework canvas, signal green reserved for activation, monospace product proof.',
    accent: '#00dc82',
    background: '#020618',
    surface1: '#080e21',
    surface2: '#0f172b',
    surface3: '#1d293d',
    border: '#314158',
    text: '#ffffff',
    textMuted: '#90a1b9',
    fontSans: "'Public Sans', ui-sans-serif, system-ui, sans-serif",
    fontMono: "'ui-monospace', ui-monospace, SFMono-Regular, Menlo, monospace",
    source: {
      provider: 'refero',
      site: 'Nuxt',
      url: 'https://nuxt.com',
      styleId: 'd9a19632-e9ee-4c9c-849b-ed48b1c43ee7'
    },
    cssVariables: {
      '--ss-bg': '#020618',
      '--ss-surface-1': '#080e21',
      '--ss-surface-2': '#0f172b',
      '--ss-surface-3': '#1d293d',
      '--ss-border': '#314158',
      '--ss-text': '#ffffff',
      '--ss-text-muted': '#90a1b9',
      '--ss-accent': '#00dc82'
    }
  },
  linearity: {
    name: 'linearity',
    theme: 'dark',
    description: 'True-black creative tool, carbon panels, one ember-orange activation signal.',
    accent: '#ff4800',
    background: '#000000',
    surface1: '#050505',
    surface2: '#171717',
    surface3: '#292929',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textMuted: '#999999',
    fontSans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    source: {
      provider: 'refero',
      site: 'Linearity',
      url: 'https://www.linearity.io',
      styleId: 'a44424b2-2f87-47f4-b6a5-28b556ed7497'
    },
    cssVariables: {
      '--ss-bg': '#000000',
      '--ss-surface-1': '#050505',
      '--ss-surface-2': '#171717',
      '--ss-surface-3': '#292929',
      '--ss-border': 'rgba(255, 255, 255, 0.1)',
      '--ss-text': '#ffffff',
      '--ss-text-muted': '#999999',
      '--ss-accent': '#ff4800'
    }
  },
  grafana: {
    name: 'grafana',
    theme: 'light',
    description: 'Cloud-gray observability canvas, white surfaces, electric blue for actions only.',
    accent: '#1b55f5',
    background: '#f4f4f6',
    surface1: '#ffffff',
    surface2: '#eef0f3',
    surface3: '#e6e6ea',
    border: '#d8d8df',
    text: '#000000',
    textMuted: '#454554',
    fontSans: "'Poppins', 'Inter', ui-sans-serif, system-ui, sans-serif",
    source: {
      provider: 'refero',
      site: 'Grafana Labs',
      url: 'https://grafana.com',
      styleId: '03e0e30c-4c0f-4879-948a-9b501e530207'
    },
    cssVariables: {
      '--ss-bg': '#f4f4f6',
      '--ss-surface-1': '#ffffff',
      '--ss-surface-2': '#eef0f3',
      '--ss-surface-3': '#e6e6ea',
      '--ss-border': '#d8d8df',
      '--ss-text': '#000000',
      '--ss-text-muted': '#454554',
      '--ss-accent': '#1b55f5'
    }
  },
  'modern-treasury': {
    name: 'modern-treasury',
    theme: 'light',
    description: 'Financial paper white, cool ice panels, forest green ledger signal, mono annotations.',
    accent: '#29735c',
    background: '#ffffff',
    surface1: '#f0f8f9',
    surface2: '#e6f1f2',
    surface3: '#dcdcdc',
    border: '#cbcac8',
    text: '#151515',
    textMuted: '#616060',
    fontSans: "'mt-neue-text', ui-sans-serif, system-ui, sans-serif",
    fontMono: "'mt-mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    source: {
      provider: 'refero',
      site: 'Modern Treasury',
      url: 'https://moderntreasury.com',
      styleId: '2e9b3dcb-f937-488d-891c-351c7366188f'
    },
    cssVariables: {
      '--ss-bg': '#ffffff',
      '--ss-surface-1': '#f0f8f9',
      '--ss-surface-2': '#e6f1f2',
      '--ss-surface-3': '#dcdcdc',
      '--ss-border': '#cbcac8',
      '--ss-text': '#151515',
      '--ss-text-muted': '#616060',
      '--ss-accent': '#29735c'
    }
  },
  milanote: {
    name: 'milanote',
    theme: 'light',
    description: 'Editorial board white, slate text, one studio-orange conversion moment.',
    accent: '#f4511c',
    background: '#ffffff',
    surface1: '#ebedee',
    surface2: '#e0e3e6',
    surface3: '#d2d6db',
    border: '#bbbec3',
    text: '#28323f',
    textMuted: '#545d6a',
    fontSans: "'Tiempos', 'Inter', ui-serif, Georgia, serif",
    source: {
      provider: 'refero',
      site: 'Milanote',
      url: 'https://milanote.com',
      styleId: 'bea59438-bb4f-47ea-9484-f41caf6eb685'
    },
    cssVariables: {
      '--ss-bg': '#ffffff',
      '--ss-surface-1': '#ebedee',
      '--ss-surface-2': '#e0e3e6',
      '--ss-surface-3': '#d2d6db',
      '--ss-border': '#bbbec3',
      '--ss-text': '#28323f',
      '--ss-text-muted': '#545d6a',
      '--ss-accent': '#f4511c'
    }
  },
  bunny: {
    name: 'bunny',
    theme: 'light',
    description: 'Pale cloud-blue infrastructure canvas, navy type, warm orange metric signal.',
    accent: '#fd8d32',
    background: '#eff8ff',
    surface1: '#ffffff',
    surface2: '#e1f2ff',
    surface3: '#d3e2f1',
    border: '#d3e2f1',
    text: '#183d6d',
    textMuted: '#636363',
    fontSans: "'Rubik', ui-sans-serif, system-ui, sans-serif",
    source: {
      provider: 'refero',
      site: 'bunny.net',
      url: 'https://bunny.net',
      styleId: '5ac4d8c4-2994-4d14-b563-0a51332dc7e0'
    },
    cssVariables: {
      '--ss-bg': '#eff8ff',
      '--ss-surface-1': '#ffffff',
      '--ss-surface-2': '#e1f2ff',
      '--ss-surface-3': '#d3e2f1',
      '--ss-border': '#d3e2f1',
      '--ss-text': '#183d6d',
      '--ss-text-muted': '#636363',
      '--ss-accent': '#fd8d32'
    }
  },
  heptabase: {
    name: 'heptabase',
    theme: 'light',
    description: 'Warm paper canvas, quiet beige panels, research blue for links and active state.',
    accent: '#207dff',
    background: '#fdfcfb',
    surface1: '#f7f7f7',
    surface2: '#f0f0ea',
    surface3: '#e4ded3',
    border: '#e4ded3',
    text: '#2e2e2e',
    textMuted: '#62616a',
    fontSans: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
    source: {
      provider: 'refero',
      site: 'Heptabase',
      url: 'https://heptabase.com',
      styleId: '7368cfab-6313-4e50-97e5-c3318c52e7fe'
    },
    cssVariables: {
      '--ss-bg': '#fdfcfb',
      '--ss-surface-1': '#f7f7f7',
      '--ss-surface-2': '#f0f0ea',
      '--ss-surface-3': '#e4ded3',
      '--ss-border': '#e4ded3',
      '--ss-text': '#2e2e2e',
      '--ss-text-muted': '#62616a',
      '--ss-accent': '#207dff'
    }
  },
  glyphs: {
    name: 'glyphs',
    theme: 'light',
    description: 'Editorial paper white, workshop green type, single orange signal on a neutral ground.',
    accent: '#f66a06',
    background: '#ffffff',
    surface1: '#f7eef1',
    surface2: '#eeeeee',
    surface3: '#e2e2e2',
    border: '#d6d6d6',
    text: '#1e3219',
    textMuted: '#5c5c5c',
    fontSans: "'Symbol Helper', ui-sans-serif, system-ui, sans-serif",
    source: {
      provider: 'refero',
      site: 'Glyphs',
      url: 'https://glyphsapp.com',
      styleId: '67bb82e2-d81c-4ead-a882-a8a2534eb221'
    },
    cssVariables: {
      '--ss-bg': '#ffffff',
      '--ss-surface-1': '#f7eef1',
      '--ss-surface-2': '#eeeeee',
      '--ss-surface-3': '#e2e2e2',
      '--ss-border': '#d6d6d6',
      '--ss-text': '#1e3219',
      '--ss-text-muted': '#5c5c5c',
      '--ss-accent': '#f66a06'
    }
  }
};
