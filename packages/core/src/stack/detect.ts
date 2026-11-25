import { SloppyConfig } from '../linter/types.js';
import { getNodeEnv } from '../node-env.js';
import { detectInstalledMotionEcosystems, type MotionEcosystemCategory } from '../registry/motion-ecosystems.js';

export interface StackDetectionResult {
  hasTypeScript: boolean;
  framework: 'next' | 'remix' | 'vite' | 'astro' | 'react' | 'vanilla';
  styling: 'tailwind-v4' | 'tailwind-v3' | 'css-modules' | 'styled-components' | 'vanilla';
  uiLibrary: 'shadcn' | 'radix' | 'mui' | 'chakra' | 'none';
  icons: 'lucide' | 'heroicons' | 'react-icons' | 'none';
  hasMotion: boolean;
  motionEcosystems: {
    detected: string[];
    byCategory: Record<MotionEcosystemCategory, string[]>;
  };
  hasZod: boolean;
  summary: string[];
  suggestedConfig: SloppyConfig;
}

/**
 * Inspects package.json, tsconfig.json, components.json, and styling configs
 * in the target directory to determine the project's engineering and design stack.
 */
export function detectProjectStack(cwd?: string): StackDetectionResult {
  const root = cwd ? cwd : (typeof process !== 'undefined' && process.cwd ? process.cwd() : '.');
  
  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } = {};
  let hasTsConfig = false;
  let hasComponentsJson = false;
  let hasTailwindConfig = false;

  try {
    const { fs, path } = getNodeEnv();
    if (fs && path) {
      const pkgPath = path.resolve(root, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { pkg = {}; }
      }
      hasTsConfig = fs.existsSync(path.resolve(root, 'tsconfig.json'));
      hasComponentsJson = fs.existsSync(path.resolve(root, 'components.json'));
      hasTailwindConfig = fs.existsSync(path.resolve(root, 'tailwind.config.js')) ||
                          fs.existsSync(path.resolve(root, 'tailwind.config.ts')) ||
                          fs.existsSync(path.resolve(root, 'tailwind.config.mjs'));
    }
  } catch {
    // Non-node environment fallback
  }

  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  // 1. TypeScript detection
  const hasTypeScript = Boolean(deps.typescript || hasTsConfig);

  // 2. Framework detection
  let framework: StackDetectionResult['framework'] = 'vanilla';
  if (deps.next) framework = 'next';
  else if (deps['@remix-run/react']) framework = 'remix';
  else if (deps.astro) framework = 'astro';
  else if (deps.vite) framework = 'vite';
  else if (deps.react || deps['react-dom']) framework = 'react';

  // 3. Styling detection
  let styling: StackDetectionResult['styling'] = 'vanilla';
  const twVersion = deps.tailwindcss || '';
  if (twVersion.includes('4.') || deps['@tailwindcss/postcss'] || deps['@tailwindcss/vite']) {
    styling = 'tailwind-v4';
  } else if (twVersion || hasTailwindConfig) {
    styling = 'tailwind-v3';
  } else if (deps['styled-components']) {
    styling = 'styled-components';
  }

  // 4. UI Component Library
  let uiLibrary: StackDetectionResult['uiLibrary'] = 'none';
  if (hasComponentsJson || deps['@radix-ui/react-slot']) {
    uiLibrary = 'shadcn';
  } else if (Object.keys(deps).some(d => d.startsWith('@radix-ui/'))) {
    uiLibrary = 'radix';
  } else if (deps['@mui/material']) {
    uiLibrary = 'mui';
  } else if (deps['@chakra-ui/react']) {
    uiLibrary = 'chakra';
  }

  // 5. Icons
  let icons: StackDetectionResult['icons'] = 'none';
  if (deps['lucide-react']) icons = 'lucide';
  else if (deps['@heroicons/react']) icons = 'heroicons';
  else if (deps['react-icons']) icons = 'react-icons';

  // 6. Motion, Scroll, 3D/WebGL, Lottie, & Zod
  const motionScan = detectInstalledMotionEcosystems(deps);
  const motionEcosystems = {
    detected: motionScan.detected.map(e => e.id),
    byCategory: motionScan.byCategory
  };
  const hasMotion = motionEcosystems.detected.length > 0;
  const hasZod = Boolean(deps.zod);

  // Generate summary
  const summary: string[] = [];
  summary.push(`Framework: ${framework}`);
  summary.push(`Language: ${hasTypeScript ? 'TypeScript (strict source-scan rules active)' : 'JavaScript'}`);
  summary.push(`Styling: ${styling}`);
  if (uiLibrary !== 'none') summary.push(`UI Components: ${uiLibrary}`);
  if (icons !== 'none') summary.push(`Icon System: ${icons}`);
  if (hasMotion) summary.push(`Motion/3D/Lottie Ecosystems: ${motionEcosystems.detected.join(', ')}`);
  if (hasZod) summary.push(`Validation: Zod schema validation available`);

  // Build tailored SloppyConfig
  const rules: Record<string, 'error' | 'warn' | 'off'> = {
    'VIS-01': 'error',
    'VIS-02': 'error',
    'MED-01': 'error',
    'COD-01': 'warn'
  };

  if (hasTypeScript) {
    rules['COD-02'] = 'error'; // Chained type assertion (as unknown as)
    rules['COD-03'] = 'warn';  // Dynamic contract return (any/unknown)
    rules['COD-04'] = 'warn';  // Broad Record<string, any>
    rules['COD-05'] = 'warn';  // Empty object spread
    rules['COD-06'] = 'error'; // Chained non-null assertion (!.)
  }

  if (hasMotion) {
    rules['MOT-01'] = 'error'; // Unearned looping animation
    rules['MOT-02'] = 'error'; // Unbounded infinite programmatic motion
    rules['MOT-03'] = 'error'; // Missing prefers-reduced-motion guard
    rules['MOT-04'] = 'warn';  // Layout-thrashing geometry animation
    rules['MOT-05'] = 'error'; // Unmanaged WebGL/Lottie/scroll loop
  }

  const suggestedConfig: SloppyConfig = {
    strict: true,
    brand: {
      allowGradients: false
    },
    rules
  };

  return {
    hasTypeScript,
    framework,
    styling,
    uiLibrary,
    icons,
    hasMotion,
    motionEcosystems,
    hasZod,
    summary,
    suggestedConfig
  };
}
