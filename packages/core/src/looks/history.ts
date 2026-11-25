import { LOOKS, LookDefinition, getLook } from './index.js';
import { getNodeEnv } from '../node-env.js';

const HISTORY_FILE = '.sloppy/dealt-looks.json';
const MAX_HISTORY = 5;

// In-memory fallback if file system write fails or in browser
let inMemoryHistory: string[] = [];

export function getRecentlyDealtLooks(cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '/', limit = MAX_HISTORY): string[] {
  if (typeof window === 'undefined') {
    try {
      const { fs, path } = getNodeEnv();
      if (fs && path) {
        const fullPath = path.resolve(cwd, HISTORY_FILE);
        if (fs.existsSync(fullPath)) {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (Array.isArray(data)) return data.slice(-limit);
        }
      }
    } catch {
      // Fall back to in-memory history
    }
  }
  return inMemoryHistory.slice(-limit);
}

export function recordDealtLook(name: string, cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '/'): void {
  const current = getRecentlyDealtLooks(cwd, 20);
  const updated = [...current.filter(n => n !== name), name].slice(-MAX_HISTORY);
  inMemoryHistory = updated;

  if (typeof window === 'undefined') {
    try {
      const { fs, path } = getNodeEnv();
      if (fs && path) {
        const dir = path.resolve(cwd, '.sloppy');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.resolve(dir, 'dealt-looks.json'), JSON.stringify(updated, null, 2));
      }
    } catch {
      // If running in sandboxed environment, inMemoryHistory retains state
    }
  }
}

export interface NextMaterialOptions {
  theme?: 'light' | 'dark';
  excludeRecent?: boolean;
  cwd?: string;
}

/**
 * Returns a fresh, high-craft material look while ensuring outputs do not repeat
 * the same material dealt in recent generations.
 */
export function getNextMaterial(options: NextMaterialOptions = {}): LookDefinition {
  const recent = options.excludeRecent !== false ? getRecentlyDealtLooks(options.cwd) : [];
  const allNames = Object.keys(LOOKS);
  
  // Filter by theme if specified
  const filtered = allNames.filter(name => {
    const look = LOOKS[name];
    if (options.theme && look.theme !== options.theme) return false;
    return true;
  });

  // Pick candidates not in recent history
  let candidates = filtered.filter(name => !recent.includes(name));
  if (candidates.length === 0) {
    candidates = filtered.length ? filtered : allNames;
  }

  const selectedName = candidates[Math.floor(Math.random() * candidates.length)] || 'linear';
  recordDealtLook(selectedName, options.cwd);
  return getLook(selectedName);
}
