import { SloppyConfig } from '../linter/types.js';

export interface StackDetectionResult {
  hasTypeScript: boolean;
  framework: 'next' | 'remix' | 'vite' | 'astro' | 'react' | 'vanilla';
  styling: 'tailwind-v4' | 'tailwind-v3' | 'css-modules' | 'styled-components' | 'vanilla';
  uiLibrary: 'shadcn' | 'radix' | 'mui' | 'chakra' | 'none';
  icons: 'lucide' | 'heroicons' | 'react-icons' | 'none';
  hasMotion: boolean;
  hasZod: boolean;
  summary: string[];
  suggestedConfig: SloppyConfig;
}

function getNodeFsAndPath(): { fs?: any; path?: any } {
  try {
    if (typeof process !== 'undefined' && process.versions?.node) {
      if (typeof (process as any).getBuiltinModule === 'function') {
        return {
          fs: (process as any).getBuiltinModule('node:fs'),
          path: (process as any).getBuiltinModule('node:path')
        };
      }
      const nodeRequire = new Function('id', 'return require(id)');
      return {
        fs: nodeRequire('fs'),
        path: nodeRequire('path')
      };
    }
  } catch {}
  return {};
}

/**
 * Inspects package.json, tsconfig.json, components.json, and styling configs
 * in the target directory to determine the project's engineering and design stack.
 */
export function detectProjectStack(cwd?: string): StackDetectionResult {
  const root = cwd ? cwd : (typeof process !== 'undefined' && process.cwd ? process.cwd() : '.');
  
  let pkg: any = {};
  let hasTsConfig = false;
  let hasComponentsJson = false;
  let hasTailwindConfig = false;

  try {
    const { fs, path } = getNodeFsAndPath();
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

  // 6. Motion & Zod
  const hasMotion = Boolean(deps['framer-motion'] || deps.motion);
  const hasZod = Boolean(deps.zod);

  // Generate summary
  const summary: string[] = [];
  summary.push(`Framework: ${framework}`);
  summary.push(`Language: ${hasTypeScript ? 'TypeScript (strict source-scan rules active)' : 'JavaScript'}`);
  summary.push(`Styling: ${styling}`);
  if (uiLibrary !== 'none') summary.push(`UI Components: ${uiLibrary}`);
  if (icons !== 'none') summary.push(`Icon System: ${icons}`);
  if (hasMotion) summary.push(`Animation: Motion library present`);
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
    hasZod,
    summary,
    suggestedConfig
  };
}
