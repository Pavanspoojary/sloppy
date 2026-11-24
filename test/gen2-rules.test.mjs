import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { auditCode, AUTO_FIX_RULE_TYPES, CANONICAL_RULES } from '../packages/core/dist/index.js';
import { fixture, parseJsonStdout, readFixture, runCli } from './helpers.mjs';

// Each Gen-2 rule is introduced one at a time, with an explicit fix mode, a
// failing fixture, and a clean fixture that must stay quiet.
const CASES = [
  { type: 'EMERALD_MONOCULTURE', id: 'VIS-03', mode: 'detect-only', failing: 'gen2-emerald.tsx', clean: 'gen2-clean.tsx' },
  { type: 'BLUR_OVERUSE', id: 'VIS-06', mode: 'detect-only', failing: 'gen2-blur.tsx', clean: 'gen2-clean.tsx' },
  { type: 'GLOW_SHADOW', id: 'VIS-07', mode: 'detect-only', failing: 'gen2-glow.tsx', clean: 'gen2-clean.tsx' },
  { type: 'STATUS_DOT_SLOP', id: 'CPY-02', mode: 'detect-only', failing: 'copy-status-dot.tsx', clean: 'copy-clean.tsx' },
  { type: 'AI_PROSE_FILLER', id: 'CPY-05', mode: 'detect-only', failing: 'copy-filler.tsx', clean: 'copy-clean.tsx' }
];

for (const rule of CASES) {
  test(`${rule.id} ${rule.type} is labelled ${rule.mode} and has both fixtures`, () => {
    const canonical = CANONICAL_RULES[rule.type];
    assert.ok(canonical, `${rule.type} must exist in CANONICAL_RULES`);
    assert.equal(canonical.ruleId, rule.id);
    assert.equal(canonical.mode, rule.mode);
    assert.equal(rule.mode === 'detect-only' ? AUTO_FIX_RULE_TYPES.includes(rule.type) : false, false);
  });

  test(`${rule.id} ${rule.type} fails its fixture and passes the clean fixture`, () => {
    const dirty = auditCode(readFixture(rule.failing), { filepath: fixture(rule.failing) });
    const detected = dirty.violations.filter((violation) => violation.type === rule.type);
    assert.ok(detected.length > 0, `${rule.failing} must trigger ${rule.type}; got ${dirty.violations.map((v) => v.type).join(', ') || 'none'}`);
    assert.ok(detected.every((violation) => violation.ruleId === rule.id));

    const clean = auditCode(readFixture(rule.clean), { filepath: fixture(rule.clean) });
    assert.deepEqual(
      clean.violations.filter((violation) => violation.type === rule.type),
      [],
      `${rule.clean} must not trigger ${rule.type}`
    );
  });
}

test('the rule table exposes a mode for every rule and auto-fix rules are declared', () => {
  for (const [type, rule] of Object.entries(CANONICAL_RULES)) {
    assert.ok(['auto-fix', 'detect-only'].includes(rule.mode), `${type} needs an explicit mode`);
  }
  for (const autoFix of ['PURPLE_GRADIENT_SLOP', 'SPARKLE_ICON_OVERLOAD', 'UNEARNED_ANIMATION', 'AI_NARRATION_COMMENT_SLOP']) {
    assert.ok(AUTO_FIX_RULE_TYPES.includes(autoFix), `${autoFix} must be declared auto-fix`);
  }
});

test('sloppy rules reports the same IDs, modes, and slugs as the canonical table', () => {
  const run = runCli(['rules', '--json']);
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  assert.ok(Array.isArray(payload.rules));
  const bySlug = new Map(payload.rules.map((rule) => [rule.slug, rule]));
  for (const [type, rule] of Object.entries(CANONICAL_RULES)) {
    const emitted = bySlug.get(type);
    assert.ok(emitted, `sloppy rules is missing ${type}`);
    assert.equal(emitted.ruleId, rule.ruleId);
    assert.equal(emitted.mode, rule.mode);
    assert.equal(emitted.title, rule.title);
  }
});

test('a declared DESIGN.md brand accent suppresses the Gen-2 emerald rule only', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sloppy-design-'));
  try {
    fs.writeFileSync(path.join(dir, 'DESIGN.md'), [
      '# DESIGN.md',
      '',
      '## Palette lock',
      '',
      '- brand-primary: emerald',
      '',
      '## Surface lock',
      '',
      '- radius: 6px',
      '- blur-cap: 3'
    ].join('\n'));
    fs.writeFileSync(path.join(dir, 'Card.tsx'), readFixture('gen2-emerald.tsx'));

    const declared = auditCode(fs.readFileSync(path.join(dir, 'Card.tsx'), 'utf8'), { filepath: path.join(dir, 'Card.tsx') });
    assert.equal(declared.designContract?.found, true, 'the contract must be discovered');
    assert.equal(declared.designContract?.brandAccent, 'emerald');
    assert.equal(declared.violations.some((violation) => violation.type === 'EMERALD_MONOCULTURE'), false);

    const blurFile = path.join(dir, 'Blur.tsx');
    fs.writeFileSync(blurFile, readFixture('gen2-blur.tsx'));
    const blur = auditCode(readFixture('gen2-blur.tsx'), { filepath: blurFile });
    assert.equal(blur.designContract?.blurCap, 3, 'the contract must override the default blur cap');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('TOK-02 is detect-only and enforces the DESIGN.md palette token lock', () => {
  const canonical = CANONICAL_RULES.DESIGN_TOKEN_DRIFT;
  assert.equal(canonical.ruleId, 'TOK-02');
  assert.equal(canonical.mode, 'detect-only');
  assert.equal(AUTO_FIX_RULE_TYPES.includes('DESIGN_TOKEN_DRIFT'), false);

  const config = { design: { lockedTokens: ['accent: #0f766e', 'surface: #fafafa'] } };
  const unlocked = auditCode(readFixture('token-drift.tsx'), { filepath: fixture('token-drift.tsx') });
  assert.equal(unlocked.violations.some((violation) => violation.type === 'DESIGN_TOKEN_DRIFT'), false, 'no palette declared means no token lock');

  const drifted = auditCode(readFixture('token-drift.tsx'), { filepath: fixture('token-drift.tsx'), config });
  const found = drifted.violations.filter((violation) => violation.type === 'DESIGN_TOKEN_DRIFT');
  assert.equal(found.length, 1);
  assert.match(found[0].message, /#ff00aa/);

  const clean = auditCode(readFixture('token-clean.tsx'), { filepath: fixture('token-clean.tsx'), config });
  assert.equal(clean.violations.some((violation) => violation.type === 'DESIGN_TOKEN_DRIFT'), false);
});
