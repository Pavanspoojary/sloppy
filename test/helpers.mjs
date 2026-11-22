import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function fixture(name) {
  return path.join(ROOT, 'test/fixtures', name);
}

export function readFixture(name) {
  return readFileSync(fixture(name), 'utf8');
}

export function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'packages/cli/bin/sloppy.js'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: options.timeout ?? 30000,
    input: options.input
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? ''
  };
}

export function parseJsonStdout(run) {
  try {
    return JSON.parse(run.stdout);
  } catch (error) {
    throw new Error(
      `stdout was not valid JSON (exit ${run.status}).\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`
    );
  }
}
