import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { auditCode, evaluateCraftRubric, transformSlopToCraft } from '../packages/core/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../benchmarks/fixtures');

test('real-world v0 specimen is accurately caught by Sloppy Quality Gate', () => {
  const code = fs.readFileSync(path.join(FIXTURES_DIR, 'v0-dashboard-slop.tsx'), 'utf8');
  const audit = auditCode(code, { componentType: 'application' });
  const rubric = evaluateCraftRubric(code, { componentType: 'application' });

  assert.equal(audit.isSlopFree, false, 'Raw v0 specimen must fail the slop gate');
  assert.ok(audit.slopScore >= 50, `Slop score should reflect severe slop, got ${audit.slopScore}`);
  assert.ok(['F', 'D', 'C'].includes(rubric.grade), `Rubric grade should be failing, got ${rubric.grade}`);

  const types = new Set(audit.violations.map(v => v.type));
  assert.ok(types.has('PURPLE_GRADIENT_SLOP'), 'Must catch purple gradient');
  assert.ok(types.has('SPARKLE_ICON_OVERLOAD'), 'Must catch sparkle icons');
  assert.ok(types.has('UNEARNED_ANIMATION'), 'Must catch unearned animations');
  assert.ok(types.has('MADE_UP_AI_BADGE'), 'Must catch made-up AI badge');
  assert.ok(types.has('BOXED_CARD_SYNDROME'), 'Must catch boxed card syndrome');
  assert.ok(types.has('UNANCHORED_FLOATING_WINDOW'), 'Must catch unanchored floating window');
});

test('transformSlopToCraft repairs raw v0 specimen into restrained craft', () => {
  const code = fs.readFileSync(path.join(FIXTURES_DIR, 'v0-dashboard-slop.tsx'), 'utf8');
  const transformed = transformSlopToCraft(code, { look: 'linear' });

  assert.ok(transformed.changesApplied > 0, 'Must apply surgical repairs');
  assert.ok(!transformed.transformedCode.includes('from-purple-600'), 'Purple gradient must be removed');
  assert.ok(!transformed.transformedCode.includes('animate-spin'), 'Unearned animate-spin must be eliminated');
  assert.ok(!transformed.transformedCode.includes('animate-ping'), 'Unearned animate-ping must be eliminated');

  // Verify post-audit slop score drops dramatically
  assert.ok(transformed.postAudit.slopScore < transformed.preAudit.slopScore, 'Post-audit score must improve');
});

test('real-world Bolt specimen triggers center-alignment and boxed-card syndrome', () => {
  const code = fs.readFileSync(path.join(FIXTURES_DIR, 'bolt-pricing-slop.tsx'), 'utf8');
  const audit = auditCode(code, { componentType: 'feature-card' });

  assert.equal(audit.isSlopFree, false, 'Raw Bolt specimen must fail the gate');
  const types = new Set(audit.violations.map(v => v.type));
  assert.ok(types.has('BOXED_CARD_SYNDROME'), 'Must catch repeated uniform boxed cards');
  assert.ok(types.has('SPARKLE_ICON_OVERLOAD'), 'Must catch sparkle icons');
});
