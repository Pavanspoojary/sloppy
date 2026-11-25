import { SloppyConfig } from './types.js';
import { findUpFile } from '../node-env.js';

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
  let resolved: SloppyConfig | null = null;
  findUpFile(startPath, (dir, fs, path) => {
    for (const filename of CONFIG_FILENAMES) {
      try {
        const content = fs.readFileSync(path.join(dir, filename), 'utf8');
        resolved = JSON.parse(content) as SloppyConfig;
        return true;
      } catch {
        // File missing or invalid JSON; continue checking candidates
      }
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.sloppy && typeof pkg.sloppy === 'object') {
        resolved = pkg.sloppy as SloppyConfig;
        return true;
      }
    } catch {
      // Ignore missing or unreadable package.json
    }
    return false;
  });
  return resolved;
}
