export interface NodeEnv {
  fs?: typeof import('node:fs');
  path?: typeof import('node:path');
}

/**
 * Resolves Node's built-in fs and path modules safely across ESM, CJS, and
 * browser bundles without static Node imports that break Vite client builds.
 */
export function getNodeEnv(): NodeEnv {
  try {
    if (typeof process !== 'undefined' && process.versions?.node) {
      if (typeof process.getBuiltinModule === 'function') {
        return {
          fs: process.getBuiltinModule('node:fs') as typeof import('node:fs'),
          path: process.getBuiltinModule('node:path') as typeof import('node:path')
        };
      }
      const req = new Function('id', 'return require(id)') as (id: string) => unknown;
      return {
        fs: req('fs') as typeof import('node:fs'),
        path: req('path') as typeof import('node:path')
      };
    }
  } catch {
    // Browser / edge sandbox without Node built-ins
  }
  return {};
}
