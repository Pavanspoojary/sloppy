import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fixture, parseJsonStdout, runCli } from './helpers.mjs';

test('check passes a clean fixture with exit 0 and pure JSON stdout', () => {
  const run = runCli(['check', fixture('clean-component.tsx'), '--json']);
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, true);
  assert.equal(payload.score, 0);
  assert.equal(payload.totals.files, 1);
  assert.deepEqual(payload.files[0].violations, []);
  assert.ok(Array.isArray(payload.nextActions));
});

test('check fails a sloppy fixture with exit 1 and actionable output', () => {
  const run = runCli(['check', fixture('slop-component.tsx'), '--json']);
  assert.equal(run.status, 1, run.stderr);
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.ok(payload.score > 0);
  assert.ok(payload.totals.violations >= 4);
  assert.ok(payload.files[0].violations.some((violation) => violation.type === 'PURPLE_GRADIENT_SLOP'));
  assert.ok(payload.nextActions.length > 0, 'an agent needs a next action');
  assert.ok(payload.nextActions.some((action) => action.includes('sloppy fix')));
});

test('check aligns the word budget with the declared surface type', () => {
  const illustration = runCli(['check', fixture('copy-heavy.tsx'), '--type', 'illustration', '--json']);
  assert.equal(illustration.status, 1);
  const failing = parseJsonStdout(illustration);
  assert.ok(failing.files[0].violations.some((violation) => violation.type === 'WORD_BUDGET_EXCEEDED'));

  const application = runCli(['check', fixture('copy-heavy.tsx'), '--type', 'application', '--json']);
  assert.equal(application.status, 0, application.stderr);
  const passing = parseJsonStdout(application);
  assert.equal(passing.ok, true);
});

test('check returns exit 2 for a missing path', () => {
  const run = runCli(['check', fixture('does-not-exist.tsx'), '--json']);
  assert.equal(run.status, 2, `expected usage failure, stdout=${run.stdout} stderr=${run.stderr}`);
});

test('check respects an explicit fail threshold', () => {
  const run = runCli([
    'check',
    fixture('slop-component.tsx'),
    '--json',
    '--fail-on',
    'none',
    '--max-score',
    '100'
  ]);
  assert.equal(run.status, 0, 'a disabled gate must exit 0 even for slop');
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, true);
});

test('audit emits machine-readable JSON', () => {
  const run = runCli(['audit', fixture('slop-component.tsx'), '--json']);
  assert.equal(run.status, 1, 'audit must fail the quality gate by default');
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.equal(payload.totals.files, 1);
  assert.ok(payload.files[0].violations.length > 0);
});

test('version is reported as JSON', () => {
  const run = runCli(['version', '--json']);
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  assert.match(payload.version, /^\d+\.\d+\.\d+/);
});

test('install-mcp writes an idempotent client configuration', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sloppy-mcp-'));
  try {
    const first = runCli(['install-mcp', '--client', 'cursor', '--dir', dir, '--json']);
    assert.equal(first.status, 0, first.stderr);
    const dest = path.join(dir, '.cursor/mcp.json');
    assert.ok(fs.existsSync(dest));
    const content = fs.readFileSync(dest, 'utf8');
    const config = JSON.parse(content);
    assert.deepEqual(config.mcpServers.sloppy, { command: 'npx', args: ['-y', 'sloppy', 'mcp'] });

    const second = runCli(['install-mcp', '--client', 'cursor', '--dir', dir, '--json']);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(fs.readFileSync(dest, 'utf8'), content, 're-running must produce identical content');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('fix --stdin transforms source without touching disk', () => {
  const source = '<div className="bg-gradient-to-r from-purple-500 to-indigo-600" />';
  const run = runCli(['fix', '--stdin', '--json'], { input: source });
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  assert.equal(payload.changed, true);
  assert.equal(payload.changesApplied > 0, true);
  assert.equal(/from-purple-500/.test(payload.transformedCode), false);
  assert.equal(payload.isValidSyntax, true);
});

test('fix --check exits 1 when changes are needed and 0 when clean', () => {
  const dirty = runCli(['fix', fixture('slop-component.tsx'), '--check', '--json']);
  assert.equal(dirty.status, 1);
  assert.equal(parseJsonStdout(dirty).changed, true);

  const clean = runCli(['fix', fixture('clean-component.tsx'), '--check', '--json']);
  assert.equal(clean.status, 0);
  assert.equal(parseJsonStdout(clean).changed, false);
});

test('verify reports honestly instead of printing a fake pass', () => {
  const run = runCli(['verify', 'https://127.0.0.1:1', '--json'], { timeout: 30000 });
  assert.equal(run.status, 2, `verification must fail closed, stdout=${run.stdout} stderr=${run.stderr}`);
  assert.equal(/\[PASS\]/.test(run.stdout), false, 'no fabricated PASS output is allowed');
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.ok(payload.unavailable || payload.violations.length > 0);
});
