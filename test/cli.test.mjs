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

test('setup command emits structured dry-run payload', () => {
  const run = runCli(['setup', '--json']);
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, true);
  assert.equal(payload.mode, 'dry-run');
  assert.ok(Array.isArray(payload.mcp));
  assert.ok(Array.isArray(payload.skills));
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

test('check --format sarif outputs OASIS SARIF 2.1.0 JSON', () => {
  const run = runCli(['check', fixture('slop-component.tsx'), '--format', 'sarif']);
  assert.equal(run.status, 1);
  const sarif = parseJsonStdout(run);
  assert.equal(sarif.version, '2.1.0');
  assert.ok(sarif.runs && sarif.runs.length > 0);
  assert.equal(sarif.runs[0].tool.driver.name, 'Sloppy');
  assert.ok(sarif.runs[0].results.length > 0);
});

test('verify reports honestly instead of printing a fake pass', () => {
  const run = runCli(['verify', 'https://127.0.0.1:1', '--json'], { timeout: 30000 });
  assert.equal(run.status, 2, `verification must fail closed, stdout=${run.stdout} stderr=${run.stderr}`);
  assert.equal(/\[PASS\]/.test(run.stdout), false, 'no fabricated PASS output is allowed');
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.ok(payload.unavailable || payload.violations.length > 0);
});

test('fix, audit, plan, rubric, and verify have one behaviour for human and --json', () => {
  const source = fs.readFileSync(fixture('slop-component.tsx'), 'utf8');
  const human = runCli(['fix', '--stdin'], { input: source });
  const machine = runCli(['fix', '--stdin', '--json'], { input: source });
  assert.equal(human.status, 0, human.stderr);
  assert.equal(machine.status, 0, machine.stderr);
  assert.equal(parseJsonStdout(machine).transformedCode, human.stdout, 'stdin human and JSON output must agree');

  const auditHuman = runCli(['audit', fixture('slop-component.tsx')]);
  const auditJson = runCli(['audit', fixture('slop-component.tsx'), '--json']);
  assert.equal(auditHuman.status, auditJson.status, 'audit exit codes must agree');
  assert.equal(/AI SLOP AUDIT REPORT/.test(auditHuman.stdout), true);
  assert.equal(parseJsonStdout(auditJson).totals.files, 1);

  const planJson = runCli(['plan', fixture('slop-component.tsx'), '--json']);
  const planHuman = runCli(['plan', fixture('slop-component.tsx')]);
  assert.equal(planJson.status, planHuman.status);
  assert.ok(Array.isArray(parseJsonStdout(planJson).patches));
  assert.equal(/STRUCTURED REPAIR PLAN/.test(planHuman.stdout), true);

  const rubricJson = runCli(['rubric', fixture('clean-component.tsx'), '--json']);
  const rubricHuman = runCli(['rubric', fixture('clean-component.tsx')]);
  assert.equal(rubricJson.status, rubricHuman.status);
  assert.equal(parseJsonStdout(rubricJson).evaluationMethod, 'static-source-scan');
  assert.equal(/CRAFT CERTIFICATION REPORT/.test(rubricHuman.stdout), true);
});

test('every fix path prints the wiring block and reports it in JSON', () => {
  const source = fs.readFileSync(fixture('slop-component.tsx'), 'utf8');
  const stdinHuman = runCli(['fix', '--stdin'], { input: source });
  assert.match(stdinHuman.stderr, /Wiring Guard \[PASSED\]/);

  const diffHuman = runCli(['fix', fixture('slop-component.tsx'), '--diff']);
  assert.match(diffHuman.stderr, /Wiring Guard \[PASSED\]/);
  assert.match(diffHuman.stdout, /^@@/m);

  const jsonRun = runCli(['fix', fixture('slop-component.tsx'), '--json']);
  const payload = parseJsonStdout(jsonRun);
  assert.ok('wiringGuard' in payload, 'JSON fix output must carry wiringGuard');
  assert.ok('manualReviewItems' in payload, 'JSON fix output must carry manualReviewItems');
  assert.ok('only' in payload, 'JSON fix output must carry the surgical only filter');

  const human = runCli(['fix', fixture('slop-component.tsx')]);
  assert.match(human.stdout, /Wiring Guard \[PASSED\]/);
});

test('user-facing copy does not claim an AST where the implementation is a scanner', () => {
  const rubric = runCli(['rubric', fixture('clean-component.tsx'), '--json']);
  assert.equal(/\bAST\b/.test(rubric.stdout), false, 'rubric JSON must not mention AST');

  const verify = runCli(['verify', fixture('gen2-clean.tsx'), '--multi-width', '--static']);
  assert.equal(/\bAST\b/.test(verify.stdout), false, 'multi-width output must not mention AST');
  assert.match(verify.stdout, /Static Source Simulation/);
});

test('check --render merges multi-width contrast and overflow findings into one report', () => {
  const jsonRun = runCli(['check', fixture('fixed-width.tsx'), '--render', '--static', '--json']);
  assert.equal(jsonRun.status, 1, jsonRun.stderr);
  const payload = parseJsonStdout(jsonRun);
  assert.ok(payload.runtime, 'the check payload must include runtime findings');
  assert.equal(payload.runtime.isStaticFallback, true);
  const staticFinding = payload.runtime.findings.find((finding) => finding.type === 'STATIC_FIXED_WIDTH');
  assert.ok(staticFinding);
  assert.equal(staticFinding.objective, true);
  assert.equal(staticFinding.confidence, 'medium');
  assert.equal(staticFinding.evidence.kind, 'source');
  assert.equal(staticFinding.evidence.viewport.width, 375);
  assert.ok(payload.totals.violations >= payload.runtime.findings.length);

  const human = runCli(['check', fixture('fixed-width.tsx'), '--render', '--static']);
  assert.equal(human.status, 1);
  assert.match(human.stdout, /Runtime \(static source simulation\)/);
  assert.match(human.stdout, /mobile-small/);
  assert.match(human.stdout, /runtime findings included/);
});

test('check --a11y reports rendered accessibility findings in the same payload', () => {
  const run = runCli(['check', 'https://127.0.0.1:1', '--a11y', '--json']);
  assert.equal(run.status, 2, 'an unavailable browser audit must fail closed, not pass');
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.ok(payload.accessibility, 'check must include the accessibility result');
  assert.equal(payload.accessibility.mode, 'browser');
  assert.ok(payload.accessibility.unavailable);
  assert.equal(payload.accessibility.findings.length, 0, 'no findings may be invented without a DOM snapshot');
});

test('verify --a11y refuses to claim a pass for a source file with no rendered DOM', () => {
  const run = runCli(['verify', fixture('clean-component.tsx'), '--a11y', '--json']);
  assert.equal(run.status, 2, run.stderr);
  const payload = parseJsonStdout(run);
  assert.equal(payload.ok, false);
  assert.equal(payload.isStaticFallback, true);
  assert.match(payload.unavailable, /served|DOM/i);
});

test('check --json --compact emits token-dense payload and SARIF exports full canonical rule table', () => {
  const compactRun = runCli(['check', fixture('slop-component.tsx'), '--json', '--compact']);
  assert.equal(compactRun.status, 1, compactRun.stderr);
  const compactPayload = parseJsonStdout(compactRun);
  assert.equal(compactPayload.ok, false);
  assert.ok(Array.isArray(compactPayload.files[0].issues), 'compact output must list compact issue strings');
  assert.equal(typeof compactPayload.files[0].issues[0], 'string');

  const sarifRun = runCli(['check', fixture('slop-component.tsx'), '--format', 'sarif']);
  assert.equal(sarifRun.status, 1);
  const sarif = parseJsonStdout(sarifRun);
  const ruleIds = new Set(sarif.runs[0].tool.driver.rules.map((r) => r.id));
  assert.ok(ruleIds.has('CHAINED_TYPE_ASSERTION'), 'SARIF driver rules must include COD-02');
  assert.ok(ruleIds.has('DESIGN_TOKEN_DRIFT'), 'SARIF driver rules must include TOK-02');
});

test('audit accepts multiple targets and flags in any order', () => {
  const multiRun = runCli(['audit', '--strict', fixture('clean-component.tsx'), fixture('slop-component.tsx'), '--json', '--compact']);
  assert.equal(multiRun.status, 1, multiRun.stderr);
  const payload = parseJsonStdout(multiRun);
  assert.equal(payload.totals.files, 2, 'audit must inspect all target paths passed');
  assert.equal(payload.files.length, 1, 'compact audit JSON only emits files with violations');
});

test('rules supports --compact and --rule filtering, and check supports --cache and --changed', async (t) => {
  const ruleRun = runCli(['rules', '--json', '--compact', '--rule', 'MOT-03']);
  assert.equal(ruleRun.status, 0, ruleRun.stderr);
  const rulePayload = parseJsonStdout(ruleRun);
  assert.equal(rulePayload.rules.length, 1);
  assert.equal(rulePayload.rules[0].ruleId, 'MOT-03');
  assert.equal(rulePayload.autoFix, undefined);

  const os = await import('node:os');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sloppy-cache-test-'));
  const tmpFile = path.join(tmpDir, 'clean.tsx');
  fs.writeFileSync(tmpFile, fs.readFileSync(fixture('clean-component.tsx'), 'utf8'));
  const { execFileSync } = await import('node:child_process');
  const cliBin = path.resolve(path.dirname(fixture('clean-component.tsx')), '../../packages/cli/bin/sloppy.js');
  t.after(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  const first = JSON.parse(execFileSync(process.execPath, [cliBin, 'check', tmpFile, '--cache', '--json', '--compact'], { cwd: tmpDir, encoding: 'utf8' }));
  assert.equal(first.ok, true);
  assert.equal(fs.existsSync(path.join(tmpDir, '.sloppy/cache.json')), true, '--cache must persist .sloppy/cache.json');
  const second = JSON.parse(execFileSync(process.execPath, [cliBin, 'check', tmpFile, '--cache', '--json', '--compact'], { cwd: tmpDir, encoding: 'utf8' }));
  assert.equal(second.ok, true);

  const changedRun = runCli(['check', '--changed', '--json', '--compact']);
  assert.ok([0, 1].includes(changedRun.status));
  const changedPayload = parseJsonStdout(changedRun);
  assert.equal(typeof changedPayload.ok, 'boolean');
});
