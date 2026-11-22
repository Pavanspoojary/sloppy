import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './helpers.mjs';

async function loadVerifier() {
  const module = await import('../packages/verify/verification.mjs');
  assert.equal(typeof module.verifyTarget, 'function', 'packages/verify must export verifyTarget');
  return module.verifyTarget;
}

test('static verification passes a grounded component', async () => {
  const verifyTarget = await loadVerifier();
  const result = await verifyTarget(fixture('clean-component.tsx'));

  assert.equal(result.mode, 'static');
  assert.equal(result.ok, true, JSON.stringify(result.violations, null, 2));
  assert.deepEqual(result.violations, []);
});

test('static verification reports real framing and accent violations', async () => {
  const verifyTarget = await loadVerifier();
  const result = await verifyTarget(fixture('slop-component.tsx'));

  assert.equal(result.mode, 'static');
  assert.equal(result.ok, false);
  const rules = new Set(result.violations.map((violation) => violation.rule));
  assert.ok(rules.has('accent.purpleGradient'), [...rules].join(', '));
  assert.ok(rules.has('icon.sparkle'), [...rules].join(', '));
  assert.ok(rules.has('motion.unearned'), [...rules].join(', '));
  assert.ok(rules.has('framing.stage'), [...rules].join(', '));
});

test('static verification flags a floating ungrounded frame', async () => {
  const verifyTarget = await loadVerifier();
  const result = await verifyTarget(fixture('floating-frame.tsx'));

  assert.equal(result.mode, 'static');
  assert.ok(
    result.violations.some((violation) => violation.rule === 'framing.floating'),
    JSON.stringify(result.violations, null, 2)
  );
});

test('browser verification fails closed and settles', async () => {
  const verifyTarget = await loadVerifier();
  const startedAt = Date.now();
  const result = await verifyTarget('https://127.0.0.1:1', { timeoutMs: 8000 });
  const elapsed = Date.now() - startedAt;

  assert.equal(result.mode, 'browser');
  assert.equal(result.ok, false, 'an unreachable target must never report success');
  assert.ok(result.unavailable || result.violations.length > 0);
  assert.ok(elapsed < 25000, `verification took ${elapsed}ms`);
});
