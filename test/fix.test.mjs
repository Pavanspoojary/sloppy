import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRepairPlan,
  transformSlopToCraft
} from '../packages/core/dist/index.js';
import { readFixture } from './helpers.mjs';

test('autofix lowers the slop score and reports a valid result', () => {
  const code = readFixture('slop-component.tsx');
  const result = transformSlopToCraft(code, { look: 'linear' });

  assert.ok(result.changesApplied > 0, 'the fixture must trigger transformations');
  assert.ok(
    result.postAudit.slopScore < result.preAudit.slopScore,
    `score must improve: ${result.preAudit.slopScore} -> ${result.postAudit.slopScore}`
  );
  assert.equal(result.isValidSyntax, true, `fixer produced invalid syntax: ${JSON.stringify(result.syntaxErrors)}`);
  assert.ok(result.transformedCode.length > 0);
});

test('autofix never leaves an undefined icon identifier', () => {
  const result = transformSlopToCraft(readFixture('slop-component.tsx'), { look: 'linear' });
  const output = result.transformedCode;

  assert.equal(/<Sparkles\b/.test(output), false, 'the sparkle element must be replaced, not left behind');
  assert.equal(
    /import\s*\{[^}]*\bSparkles\b[^}]*\}\s*from\s*['"]lucide-react['"]/.test(output),
    false,
    'a dangling Sparkles import must not remain'
  );

  if (/<Zap\b/.test(output)) {
    assert.ok(
      /import\s*\{[^}]*\bZap\b[^}]*\}\s*from\s*['"]lucide-react['"]/.test(output),
      'Zap is used, so Zap must be imported'
    );
  }
});

test('autofix is idempotent', () => {
  const first = transformSlopToCraft(readFixture('slop-component.tsx'), { look: 'linear' });
  const second = transformSlopToCraft(first.transformedCode, { look: 'linear' });

  assert.equal(second.changesApplied, 0, 'a second pass must have nothing to change');
  assert.equal(second.isIdempotent, true, 'the fixer must report itself idempotent');
  assert.equal(second.transformedCode, first.transformedCode, 'a second pass must not mutate the output');
});

test('autofix handles class values split across lines', () => {
  const result = transformSlopToCraft(readFixture('multiline-slop.tsx'), { look: 'linear' });
  assert.equal(/from-purple-500/.test(result.transformedCode), false);
  assert.equal(/to-indigo-600/.test(result.transformedCode), false);
  assert.equal(result.isValidSyntax, true);
});

test('autofix produces a reviewable unified diff', () => {
  const result = transformSlopToCraft(readFixture('slop-component.tsx'), { look: 'linear' });
  assert.ok(result.unifiedDiff.includes('@@'), 'diff must contain a hunk header');
  assert.ok(result.unifiedDiff.includes('--- '), 'diff must contain an old-file header');
  assert.ok(result.unifiedDiff.includes('+++ '), 'diff must contain a new-file header');
});

test('autofix does not rewrite legitimate product copy by default', () => {
  const code = readFixture('copy-heavy.tsx');
  const result = transformSlopToCraft(code, { look: 'linear' });
  assert.equal(result.transformedCode, code, 'real copy must not be replaced without explicit opt-in');
});

test('repair plan is reviewable and honest', () => {
  const code = readFixture('slop-component.tsx');
  const plan = createRepairPlan(code, { look: 'linear', filepath: 'slop-component.tsx' });

  assert.ok(plan.patches.length > 0, 'expected planned patches');
  assert.ok(plan.safePatchesCount > 0, 'expected at least one safe auto patch');
  assert.ok(plan.projectedScore <= plan.initialScore, 'projected score must not be worse');
  assert.ok(plan.unifiedDiff.length > 0, 'expected a unified diff');
  assert.equal(plan.repairedCode, transformSlopToCraft(code, { look: 'linear' }).transformedCode);

  for (const patch of plan.patches) {
    assert.ok(patch.rationale.length > 0);
    assert.ok(patch.replacementSnippet.length > 0);
    if (patch.autoApplicable) {
      assert.equal(patch.confidence, 'high');
      assert.notEqual(patch.originalSnippet, patch.replacementSnippet);
    }
  }
});

test('autofix replaces gradients with a flat neutral surface, not new slop', () => {
  const result = transformSlopToCraft(readFixture('slop-component.tsx'), { look: 'linear' });
  assert.equal(/backdrop-blur/.test(result.transformedCode), false, 'the fixer must not add backdrop-blur');
  assert.equal(/shadow-2xl/.test(result.transformedCode), false, 'the fixer must not add shadow-2xl');
  assert.ok(/bg-neutral-900|bg-neutral-50/.test(result.transformedCode), 'the replacement must be a flat neutral surface');
  assert.equal(/from-purple|to-indigo/.test(result.transformedCode), false);
});
