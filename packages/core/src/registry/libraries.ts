export interface SloppyLibraryInfo {
  id: string;
  name: string;
  author: string;
  githubUrl: string;
  description: string;
  strengths: string[];
  antiSlopRole: string;
  defaultLook: string;
}

export const SLOPPY_LIBRARIES: Record<string, SloppyLibraryInfo> = {
  stageshow: {
    id: 'stageshow',
    name: 'Stageshow',
    author: 'Benji Taylor',
    githubUrl: 'https://github.com/benjitaylor/skills/tree/main/stageshow',
    description: 'The foundation for anti-slop visual framing, cursor stories, and realistic product illustrations.',
    strengths: [
      'Grounded framing with deliberate 2/3 stage coverage and edge bleeding',
      'The 3-7 word budget rule and structural placeholder bars',
      'Act API for cause-driven cursor choreography and physics-settled motion',
      '73+ real-product studies (Linear, Slack, Raycast, Figma, Notion, Dynamic Island)'
    ],
    antiSlopRole: 'The Anti-Slop Conscience: controls camera crop, word budget, and ensures every motion has a cause.',
    defaultLook: 'linear'
  },
  shadcn: {
    id: 'shadcn',
    name: 'shadcn/ui',
    author: 'shadcn',
    githubUrl: 'https://github.com/shadcn-ui/ui',
    description: 'The gold standard accessible foundational primitives built with Radix UI and Tailwind CSS.',
    strengths: [
      'Accessible, keyboard-navigable primitives (dialog, dropdown, tabs, select, table)',
      'Zero-lockin copy-paste architecture',
      'Comprehensive form controls and layout containers'
    ],
    antiSlopRole: 'The Primitives Backbone: provides rock-solid, production-grade accessibility and un-styled semantic structure.',
    defaultLook: 'radix'
  },
  'motion-primitives': {
    id: 'motion-primitives',
    name: 'Motion Primitives',
    author: 'Emil Kowalski / ibelick',
    githubUrl: 'https://github.com/ibelick/motion-primitives',
    description: 'Ultra-high-craft micro-interactions and animated UI components built with Motion and Tailwind.',
    strengths: [
      'Morphing dialogs, popovers, and expandable toolbars',
      'Rolling numbers, text scrambles, sliding numbers',
      'Dock, magnetic cursors, and border trails',
      'Polished spring physics and layout continuity'
    ],
    antiSlopRole: 'Micro-Interaction Polish: provides purposeful transitions and morphs without generic bouncy keyframes.',
    defaultLook: 'minimal'
  },
  magicui: {
    id: 'magicui',
    name: 'Magic UI',
    author: 'Dillion Verma / Magic UI Design',
    githubUrl: 'https://github.com/magicuidesign/magicui',
    description: 'High-impact animated components for landing pages, marketing heroes, and bento grids.',
    strengths: [
      'Animated beams, border beam, and retro grids',
      'Bento grid layouts with dynamic tile cards',
      'Marquee, interactive icon cloud, and ripple effects'
    ],
    antiSlopRole: 'Marketing Hero Energy: provides bold visual focal points, strictly tamed by Sloppy restraint rules to prevent over-stimulation.',
    defaultLook: 'linear'
  },
  'react-bits': {
    id: 'react-bits',
    name: 'React Bits',
    author: 'David Haz',
    githubUrl: 'https://github.com/DavidHDev/react-bits',
    description: 'Canvas backgrounds, atmospheric particle fields, and kinetic typography animations.',
    strengths: [
      'Atmospheric backgrounds: spotlight, hyperspeed, aurora, particles, waves',
      'Kinetic typography: split text, blur text, decrypter, variable proximity',
      'Interactive 3D tilted cards and magnetic galleries'
    ],
    antiSlopRole: 'Ambient Atmosphere: subtle backdrop and typography flair, kept under strict opacity limits to avoid visual noise.',
    defaultLook: 'blueprint'
  },
  kokonutui: {
    id: 'kokonutui',
    name: 'Kokonut UI',
    author: 'Kokonut Labs',
    githubUrl: 'https://github.com/kokonut-labs/kokonutui',
    description: 'Cutting-edge modern Next.js/React components with dedicated AI prompt and agent workflow interfaces.',
    strengths: [
      'AI prompt input bars, agent lane reviews, and tool approval cards',
      'Modern glass cards, sleek pricing tables, and matrix rains',
      'Interactive buttons and smooth state switches'
    ],
    antiSlopRole: 'Modern AI & Application Patterns: provides clean, purposeful AI agent interfaces that replace cliché robot sparkle boxes.',
    defaultLook: 'dark-hero'
  },
  'animate-ui': {
    id: 'animate-ui',
    name: 'Animate UI',
    author: 'imskyleen',
    githubUrl: 'http://github.com/imskyleen/animate-ui',
    description: 'Smooth, fluid physics-based animated variants of standard Radix controls.',
    strengths: [
      'Animated menubars, dropdowns, switches, and sliders',
      'Fluid gesture physics and spring transitions',
      'Polished sheet and popover arrivals'
    ],
    antiSlopRole: 'Fluid Control Feedback: replaces abrupt DOM mounting with tactile, weighted transitions.',
    defaultLook: 'minimal'
  }
};
