export type MotionEcosystemCategory =
  | 'core-animation'
  | 'scroll-parallax'
  | 'text-svg'
  | '3d-webgl'
  | 'lottie-interactive'
  | 'animated-ui';

export interface MotionEcosystemEntry {
  id: string;
  name: string;
  category: MotionEcosystemCategory;
  license: 'MIT' | 'Apache-2.0';
  licenseNote?: string;
  githubUrl: string;
  packages: string[];
  antiSlopGuidance: string;
  bannedSlopPattern: string;
  enforcedRules: string[];
}

export const MOTION_ECOSYSTEMS: MotionEcosystemEntry[] = [
  // 1. Core Animation
  {
    id: 'motion',
    name: 'Motion (Framer Motion)',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/motiondivision/motion',
    packages: ['motion', 'framer-motion'],
    antiSlopGuidance: 'Wrap app roots in <MotionConfig reducedMotion="user"> or check useReducedMotion(). Animate transform/opacity; hold settled springs without overshoot.',
    bannedSlopPattern: 'repeat: Infinity floating cards, stiffness > 400 overshoot, or animating width/height/top/left without layout bounds.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-04']
  },
  {
    id: 'anime',
    name: 'Anime.js',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/juliangarnier/anime',
    packages: ['animejs'],
    antiSlopGuidance: 'Use caused timelines with clean cleanup (pause/remove on unmount) and stagger intervals between 40ms and 80ms.',
    bannedSlopPattern: 'Unbounded loop: true keyframes on static hero badges or leaked timelines.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-04']
  },
  {
    id: 'react-spring',
    name: 'React Spring',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/pmndrs/react-spring',
    packages: ['@react-spring/web', 'react-spring'],
    antiSlopGuidance: 'Configure natural tension/friction without playful rubber-band oscillation; honor Globals.assign({ skipAnimation }) under reduced motion.',
    bannedSlopPattern: 'loop: true spring oscillation on resting cards or missing reduced-motion skip.',
    enforcedRules: ['MOT-02', 'MOT-03']
  },
  {
    id: 'auto-animate',
    name: 'AutoAnimate',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/formkit/auto-animate',
    packages: ['@formkit/auto-animate'],
    antiSlopGuidance: 'Apply to genuine list insertions, filtering, and accordion expansion; respect prefers-reduced-motion natively.',
    bannedSlopPattern: 'Wrapping static marketing containers in auto-animate without dynamic children.',
    enforcedRules: ['MOT-03']
  },
  {
    id: 'tween-js',
    name: 'Tween.js',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/tweenjs/tween.js',
    packages: ['@tweenjs/tween.js'],
    antiSlopGuidance: 'Tie tween loops to active canvas/WebGL interactions and stop groups cleanly on unmount.',
    bannedSlopPattern: '.repeat(Infinity) loops or orphaned requestAnimationFrame tickers.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-05']
  },
  {
    id: 'theatre',
    name: 'Theatre.js Core',
    category: 'core-animation',
    license: 'Apache-2.0',
    licenseNote: 'Only @theatre/core (Apache-2.0) is included; @theatre/studio is AGPL-3.0 and excluded from Sloppy.',
    githubUrl: 'https://github.com/theatre-js/theatre',
    packages: ['@theatre/core'],
    antiSlopGuidance: 'Drive deterministic keyframed product stories with @theatre/core only and never ship visual studio editor bundles in production.',
    bannedSlopPattern: 'Bundling AGPL studio editor UI or auto-looping camera flythroughs without user control.',
    enforcedRules: ['MOT-02', 'MOT-03']
  },
  {
    id: 'motion-canvas',
    name: 'Motion Canvas',
    category: 'core-animation',
    license: 'MIT',
    githubUrl: 'https://github.com/motion-canvas/motion-canvas',
    packages: ['@motion-canvas/core', '@motion-canvas/2d'],
    antiSlopGuidance: 'Author programmatic procedural videos and diagrams with crisp beats and 2s+ payoff holds.',
    bannedSlopPattern: 'Rapid sub-second scene cuts with zero reading hold.',
    enforcedRules: ['MOT-02']
  },

  // 2. Scroll & Parallax
  {
    id: 'lenis',
    name: 'Lenis',
    category: 'scroll-parallax',
    license: 'MIT',
    githubUrl: 'https://github.com/darkroomengineering/lenis',
    packages: ['lenis', '@studio-freight/lenis'],
    antiSlopGuidance: 'Destroy Lenis cleanly in useEffect cleanup, disable under prefers-reduced-motion, and never trap inner scrollable panels.',
    bannedSlopPattern: 'Wheel/scroll hijacking that breaks native trackpad inertia, anchor jumps, or accessibility zoom.',
    enforcedRules: ['UX-05', 'MOT-03', 'MOT-05']
  },
  {
    id: 'aos',
    name: 'AOS (Animate On Scroll)',
    category: 'scroll-parallax',
    license: 'MIT',
    githubUrl: 'https://github.com/michalsnik/aos',
    packages: ['aos'],
    antiSlopGuidance: 'Always initialize with once: true and disable: "mobile" or reduced-motion guards so sections never hide on scroll-up.',
    bannedSlopPattern: 'Above-the-fold hero opacity: 0 delays or once: false sections hiding on reverse scroll.',
    enforcedRules: ['MOT-03', 'UX-05']
  },
  {
    id: 'rellax',
    name: 'Rellax',
    category: 'scroll-parallax',
    license: 'MIT',
    githubUrl: 'https://github.com/dixonandmoe/rellax',
    packages: ['rellax'],
    antiSlopGuidance: 'Keep parallax speed subtle (-1 to +1), restrict to non-essential backdrop layers, and call destroy() on unmount.',
    bannedSlopPattern: 'Parallax speed shifts on readable text, forms, or cards causing motion sickness and overlap.',
    enforcedRules: ['MOT-03', 'MOT-05']
  },
  {
    id: 'lax',
    name: 'Lax.js',
    category: 'scroll-parallax',
    license: 'MIT',
    githubUrl: 'https://github.com/alexfoxy/lax.js',
    packages: ['lax.js'],
    antiSlopGuidance: 'Bind drivers exclusively to transform/opacity and remove elements on unmount; guard with prefers-reduced-motion.',
    bannedSlopPattern: 'Multi-axis scroll skew/spin distortion on interactive controls or headings.',
    enforcedRules: ['MOT-03', 'MOT-04']
  },
  {
    id: 'atropos',
    name: 'Atropos',
    category: 'scroll-parallax',
    license: 'MIT',
    githubUrl: 'https://github.com/nolimits4web/atropos',
    packages: ['atropos'],
    antiSlopGuidance: 'Use restrained tilt angles (<= 5deg) strictly on visual showcase tiles, never on forms, tables, or primary copy.',
    bannedSlopPattern: 'Extreme 3D card tilt on dashboards, inputs, or repeated bento cards.',
    enforcedRules: ['MOT-03']
  },

  // 3. Text & SVG
  {
    id: 'splitting',
    name: 'Splitting.js',
    category: 'text-svg',
    license: 'MIT',
    githubUrl: 'https://github.com/shshaw/Splitting',
    packages: ['splitting'],
    antiSlopGuidance: 'Preserve screen-reader aria-label on the parent heading and split only short display headlines, never body paragraphs.',
    bannedSlopPattern: 'Splitting paragraphs into hundreds of animated spans or bouncing every letter infinitely.',
    enforcedRules: ['MOT-02', 'MOT-03']
  },
  {
    id: 'vivus',
    name: 'Vivus',
    category: 'text-svg',
    license: 'MIT',
    githubUrl: 'https://github.com/maxwellito/vivus',
    packages: ['vivus'],
    antiSlopGuidance: 'Use one-shot path drawing synchronized with connector milestones; never obscure functional icons while drawing.',
    bannedSlopPattern: 'Looping SVG stroke traces or slow multi-second line draws blocking UI readiness.',
    enforcedRules: ['MOT-02', 'MOT-03']
  },

  // 4. 3D & WebGL
  {
    id: 'three',
    name: 'Three.js',
    category: '3d-webgl',
    license: 'MIT',
    githubUrl: 'https://github.com/mrdoob/three.js',
    packages: ['three'],
    antiSlopGuidance: 'Dispose geometries, materials, and renderer on unmount; pause render loops when offscreen or under prefers-reduced-motion.',
    bannedSlopPattern: 'Unbounded requestAnimationFrame loops leaking WebGL contexts or spinning glowing purple orbs.',
    enforcedRules: ['MOT-03', 'MOT-05', 'VIS-02']
  },
  {
    id: 'react-three-fiber',
    name: 'React Three Fiber',
    category: '3d-webgl',
    license: 'MIT',
    githubUrl: 'https://github.com/pmndrs/react-three-fiber',
    packages: ['@react-three/fiber', '@react-three/drei'],
    antiSlopGuidance: 'Set frameloop="demand" for static/event scenes, clamp dpr={[1, 2]}, provide Suspense fallback, and guard with reduced motion.',
    bannedSlopPattern: 'Always-on 60fps <Canvas> background meshes draining GPU battery behind form copy.',
    enforcedRules: ['MOT-03', 'MOT-05']
  },
  {
    id: 'pixijs',
    name: 'PixiJS',
    category: '3d-webgl',
    license: 'MIT',
    githubUrl: 'https://github.com/pixijs/pixijs',
    packages: ['pixi.js'],
    antiSlopGuidance: 'Call app.destroy(true) on cleanup, cap resolution to devicePixelRatio <= 2, and pause ticker under prefers-reduced-motion.',
    bannedSlopPattern: 'Leaked PIXI.Application instances or noisy background particle confetti.',
    enforcedRules: ['MOT-03', 'MOT-05']
  },

  // 5. Lottie & Interactive Animation
  {
    id: 'lottie-web',
    name: 'Lottie Web',
    category: 'lottie-interactive',
    license: 'MIT',
    githubUrl: 'https://github.com/airbnb/lottie-web',
    packages: ['lottie-web'],
    antiSlopGuidance: 'Trigger on explicit hover/completion states instead of infinite autoplay; call anim.destroy() in cleanup and pause under reduced motion.',
    bannedSlopPattern: 'Generic looping Lottie hero illustrations used as substitutes for real product screenshots.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-05']
  },
  {
    id: 'dotlottie-web',
    name: 'dotLottie Web',
    category: 'lottie-interactive',
    license: 'MIT',
    githubUrl: 'https://github.com/LottieFiles/dotlottie-web',
    packages: ['@lottiefiles/dotlottie-web', '@lottiefiles/dotlottie-react'],
    antiSlopGuidance: 'Use compressed .lottie state machines bound to user actions; destroy instance on unmount and respect reduced motion.',
    bannedSlopPattern: 'Auto-playing infinite sticker loops crowding feature cards.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-05']
  },
  {
    id: 'rive-wasm',
    name: 'Rive',
    category: 'lottie-interactive',
    license: 'MIT',
    githubUrl: 'https://github.com/rive-app/rive-wasm',
    packages: ['@rive-app/canvas', '@rive-app/react-canvas', '@rive-app/webgl', '@rive-app/wasm'],
    antiSlopGuidance: 'Bind Rive state machines directly to real UI state inputs (hover, toggle, progress) and clean up WASM buffers on unmount.',
    bannedSlopPattern: 'Playing Rive animations on continuous blind loops disconnected from UI state.',
    enforcedRules: ['MOT-02', 'MOT-03', 'MOT-05']
  },

  // 6. Animated UI Components
  {
    id: 'magicui',
    name: 'Magic UI',
    category: 'animated-ui',
    license: 'MIT',
    githubUrl: 'https://github.com/magicuidesign/magicui',
    packages: ['magicui'],
    antiSlopGuidance: 'Already integrated in Sloppy registry. Tame BorderBeam, Particles, and RetroGrid to single focal elements with neutral palettes and <= 0.15 opacity.',
    bannedSlopPattern: 'Stacking rainbow BorderBeams, Marquee tickers, and Sparkles across every card on a page.',
    enforcedRules: ['VIS-02', 'MED-02', 'MOT-01', 'MOT-02']
  }
];

export function searchMotionEcosystems(
  query = '',
  category?: MotionEcosystemCategory
): MotionEcosystemEntry[] {
  const q = query.trim().toLowerCase();
  return MOTION_ECOSYSTEMS.filter(entry => {
    if (category && entry.category !== category) return false;
    if (!q) return true;
    return (
      entry.id.includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.category.includes(q) ||
      entry.packages.some(pkg => pkg.toLowerCase().includes(q)) ||
      entry.antiSlopGuidance.toLowerCase().includes(q)
    );
  });
}

export function detectInstalledMotionEcosystems(
  deps: Record<string, string>
): {
  detected: MotionEcosystemEntry[];
  byCategory: Record<MotionEcosystemCategory, string[]>;
} {
  const depNames = new Set(Object.keys(deps));
  const detected = MOTION_ECOSYSTEMS.filter(entry =>
    entry.packages.some(pkg => depNames.has(pkg))
  );
  const byCategory: Record<MotionEcosystemCategory, string[]> = {
    'core-animation': [],
    'scroll-parallax': [],
    'text-svg': [],
    '3d-webgl': [],
    'lottie-interactive': [],
    'animated-ui': []
  };
  for (const item of detected) {
    byCategory[item.category].push(item.id);
  }
  return { detected, byCategory };
}
