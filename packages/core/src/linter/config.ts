import { SloppyConfig } from './types.js';

const CONFIG_FILENAMES = [
  'sloppy.config.json',
  '.sloppyrc.json',
  '.sloppyrc'
];

/**
 * Searches upward from the target file or directory for a Sloppy configuration file.
 * Safely no-ops in browser / client environments where Node filesystem is unavailable.
 */
export function loadSloppyConfig(startPath?: string): SloppyConfig | null {
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    return null;
  }

  try {
    // Dynamic import / require avoids bundling fs & path in browser environments
    const fs = (globalThis as any).require ? (globalThis as any).require('fs') : undefined;
    const path = (globalThis as any).require ? (globalThis as any).require('path') : undefined;

    if (!fs || !path) return null;

    let dir = startPath ? path.resolve(startPath) : process.cwd();
    if (fs.existsSync(dir) && fs.statSync(dir).isFile()) {
      dir = path.dirname(dir);
    }

    const root = path.parse(dir).root;

    while (dir && dir !== root) {
      for (const filename of CONFIG_FILENAMES) {
        const candidate = path.join(dir, filename);
        if (fs.existsSync(candidate)) {
          try {
            const content = fs.readFileSync(candidate, 'utf8');
            return JSON.parse(content) as SloppyConfig;
          } catch {
            return null;
          }
        }
      }

      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.sloppy && typeof pkg.sloppy === 'object') {
            return pkg.sloppy as SloppyConfig;
          }
        } catch {
          // ignore parse error
        }
      }

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
    return null;
  }

  return null;
}
