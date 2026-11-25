export interface NodeEnv {
  fs?: typeof import('node:fs');
  path?: typeof import('node:path');
}

let cachedNodeEnv: NodeEnv | undefined;

/**
 * Resolves Node's built-in fs and path modules safely across ESM, CJS, and
 * browser bundles without static Node imports that break Vite client builds.
 */
export function getNodeEnv(): NodeEnv {
  if (cachedNodeEnv) return cachedNodeEnv;
  try {
    if (typeof process !== 'undefined' && process.versions?.node) {
      if (typeof process.getBuiltinModule === 'function') {
        cachedNodeEnv = {
          fs: process.getBuiltinModule('node:fs') as typeof import('node:fs'),
          path: process.getBuiltinModule('node:path') as typeof import('node:path')
        };
        return cachedNodeEnv;
      }
      const req = new Function('id', 'return require(id)') as (id: string) => unknown;
      cachedNodeEnv = {
        fs: req('fs') as typeof import('node:fs'),
        path: req('path') as typeof import('node:path')
      };
      return cachedNodeEnv;
    }
  } catch {
    // Browser / edge sandbox without Node built-ins
  }
  cachedNodeEnv = {};
  return cachedNodeEnv;
}

/**
 * Walks upward from startPath to find and read the first matching filename without
 * check-then-use filesystem races. Safe no-op in browser environments.
 */
export function findUpFile(
  startPath: string | undefined,
  readMatch: (dir: string, fs: typeof import('node:fs'), path: typeof import('node:path')) => boolean
): void {
  try {
    const { fs, path } = getNodeEnv();
    if (!fs || !path) return;

    let dir = startPath ? path.resolve(startPath) : process.cwd();
    try {
      if (fs.statSync(dir).isFile()) dir = path.dirname(dir);
    } catch {
      dir = path.dirname(dir);
    }

    const root = path.parse(dir).root;
    while (dir && dir !== root) {
      if (readMatch(dir, fs, path)) return;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
    // Ignore filesystem errors in restricted environments
  }
}
