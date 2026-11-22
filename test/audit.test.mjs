import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode, evaluateCraftRubric } from '../packages/core/dist/index.js';
import { readFixture } from './helpers.mjs';

test('clean fixture reports zero slop and a certified grade', () => {
  const code = readFixture('clean-component.tsx');
  const audit = auditCode(code, { filepath: 'clean-component.tsx' });

  assert.equal(audit.slopScore, 0, 'a clean component must score 0');
  assert.equal(audit.isSlopFree, true, 'a clean component must be slop free');
  assert.deepEqual(audit.violations, [], 'a clean component must have zero violations');

  const cert = evaluateCraftRubric(code, { filepath: 'clean-component.tsx' });
  assert.ok(cert.totalScore >= 90, `clean fixture should certify, received ${cert.totalScore}`);
  assert.ok(['A+', 'A'].includes(cert.grade), `unexpected grade ${cert.grade}`);
});

test('slop fixture reports the core anti-patterns with accurate locations', () => {
  const code = readFixture('slop-component.tsx');
  const audit = auditCode(code, { filepath: 'slop-component.tsx' });
  const types = new Set(audit.violations.map((violation) => violation.type));

  assert.ok(audit.violations.length >= 4, `expected at least 4 violations, received ${audit.violations.length}`);
  for (const expected of [
    'PURPLE_GRADIENT_SLOP',
    'SPARKLE_ICON_OVERLOAD',
    'UNEARNED_ANIMATION',
    'MADE_UP_AI_BADGE'
  ]) {
    assert.ok(types.has(expected), `expected ${expected}, received ${[...types].join(', ')}`);
  }

  assert.ok(audit.slopScore >= 60, `expected a severe score, received ${audit.slopScore}`);
  for (const violation of audit.violations) {
    assert.ok(violation.message.length > 0, 'every violation needs a message');
    assert.ok(violation.recommendation.length > 0, 'every violation needs a recommendation');
    assert.ok(typeof violation.line === 'number' && violation.line > 0, 'every violation needs a line');
    assert.ok(violation.id.length > 0, 'every violation needs a stable id');
  }

  const cert = evaluateCraftRubric(code, { filepath: 'slop-component.tsx' });
  assert.ok(cert.totalScore < 90, `slop fixture must not certify, received ${cert.totalScore}`);
  assert.equal(cert.isCertified, false);
});

test('multi-line class values are detected', () => {
  const code = readFixture('multiline-slop.tsx');
  const audit = auditCode(code);
  assert.ok(
    audit.violations.some((violation) => violation.type === 'PURPLE_GRADIENT_SLOP'),
    'a gradient split across lines must still be flagged'
  );
});

test('legitimate accent purple is not treated as a gradient', () => {
  const audit = auditCode(readFixture('legit-accent.tsx'));
  assert.equal(
    audit.violations.some((violation) => violation.type === 'PURPLE_GRADIENT_SLOP'),
    false,
    'a solid purple accent is allowed; only gradients are critical'
  );
});

test('progress affordances may animate', () => {
  const audit = auditCode(readFixture('progress-skeleton.tsx'));
  assert.equal(
    audit.violations.some((violation) => violation.type === 'UNEARNED_ANIMATION'),
    false,
    'animate-pulse on a progressbar is a caused, legitimate animation'
  );
});

test('ignore pragma suppresses the next line', () => {
  const audit = auditCode(readFixture('ignore-pragma.tsx'));
  assert.equal(
    audit.violations.some((violation) => violation.type === 'PURPLE_GRADIENT_SLOP'),
    false,
    'sloppy-ignore-next-line must suppress the following line'
  );
  assert.ok(audit.stats.suppressedCount >= 1, 'suppressions must be counted');
});

test('word budget uses configurable component context', () => {
  const code = readFixture('copy-heavy.tsx');
  const illustration = auditCode(code, { componentType: 'illustration' });
  const application = auditCode(code, { componentType: 'application' });
  assert.ok(
    illustration.violations.some((violation) => violation.type === 'WORD_BUDGET_EXCEEDED'),
    'an illustration has a tight word budget'
  );
  assert.equal(
    application.violations.some((violation) => violation.type === 'WORD_BUDGET_EXCEEDED'),
    false,
    'a full application screen has a larger word budget'
  );
});

test('sloppy-allow-file exempts only the named rule', () => {
  const audit = auditCode(readFixture('allow-file.tsx'));
  const types = audit.violations.map((violation) => violation.type);
  assert.equal(types.includes('PURPLE_GRADIENT_SLOP'), false, 'the allowed rule must be suppressed');
  assert.ok(types.includes('SPARKLE_ICON_OVERLOAD'), 'unlisted rules must still fire');
  assert.ok(audit.stats.suppressedCount >= 1, 'the suppression must be counted');
});

test('types and comments are never counted as visible copy', () => {
  const code = `
    /** The pointer a stage draws: the glyph for each kind, where its hotspot sits. */
    export interface CursorProps { cursorRef: Ref<HTMLDivElement> }
    const pause = <T,>(schedule: (done: () => void) => T, cancel: (id: T) => void) =>
      new Promise<void>((resolve) => { schedule(resolve) })
    export function Ready() { return <div>Build passed</div>; }
  `;
  const audit = auditCode(code);
  assert.equal(audit.stats.estimatedWordCount, 2);
  assert.equal(audit.violations.some((violation) => violation.type === 'WORD_BUDGET_EXCEEDED'), false);
});

test('centered content is not mistaken for a floating frame', () => {
  const section = auditCode('<main className="mx-auto my-8 max-w-3xl p-8"><p>Settings</p></main>');
  assert.equal(section.violations.some((violation) => violation.type === 'UNANCHORED_FLOATING_WINDOW'), false);

  const card = auditCode('<div className="mx-auto my-8 max-w-md p-8 rounded-2xl shadow-2xl bg-white"><span>Invoices</span></div>');
  assert.ok(card.violations.some((violation) => violation.type === 'UNANCHORED_FLOATING_WINDOW'), 'a shadowed mini window with uniform air is still flagged');
});

test('auditing is deterministic and never throws on broken input', () => {
  const code = readFixture('slop-component.tsx');
  assert.deepEqual(auditCode(code), auditCode(code));
  assert.doesNotThrow(() => auditCode('<div className="bg-gradient-to-r from-purple-500'));
  assert.doesNotThrow(() => auditCode(''));
});

test('scoring is bounded and monotonic', () => {
  const clean = auditCode(readFixture('clean-component.tsx'));
  const slop = auditCode(readFixture('slop-component.tsx'));
  assert.ok(clean.slopScore >= 0 && clean.slopScore <= 100);
  assert.ok(slop.slopScore >= 0 && slop.slopScore <= 100);
  assert.ok(slop.slopScore > clean.slopScore);
});
