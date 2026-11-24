import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditCode,
  AUTO_FIX_RULE_TYPES,
  CANONICAL_RULES,
  RULE_METADATA
} from '../packages/core/dist/index.js';
import { fixture, parseJsonStdout, readFixture, runCli } from './helpers.mjs';

const EVIDENCE_KINDS = new Set(['source', 'dom', 'computed-style', 'screenshot', 'interaction', 'runtime', 'standard', 'human-review']);

test('every canonical rule declares evidence, confidence, applicability, and false-positive controls', () => {
  for (const [type, rule] of Object.entries(CANONICAL_RULES)) {
    const meta = RULE_METADATA[type];
    assert.ok(meta, `${rule.ruleId} ${type} is missing RULE_METADATA`);
    assert.ok(['high', 'medium', 'low'].includes(meta.confidence), `${rule.ruleId} needs a confidence`);
    assert.equal(typeof meta.objective, 'boolean', `${rule.ruleId} must say whether it is objective`);
    assert.ok(meta.evidenceKinds.length > 0, `${rule.ruleId} must name its evidence kind`);
    for (const kind of meta.evidenceKinds) assert.ok(EVIDENCE_KINDS.has(kind), `${rule.ruleId} has unknown evidence kind ${kind}`);
    assert.ok(meta.falsePositives.length > 0, `${rule.ruleId} must document at least one false-positive case`);
    assert.ok(meta.notApplicableWhen.length > 0, `${rule.ruleId} must document when it does not apply`);
    assert.ok(meta.validation.length > 0, `${rule.ruleId} must document how a fix is validated`);
  }
});

test('findings carry file, selector, confidence, and evidence instead of a bare message', () => {
  const audit = auditCode(readFixture('gen2-emerald.tsx'), { filepath: fixture('gen2-emerald.tsx') });
  assert.ok(audit.violations.length > 0);
  for (const violation of audit.violations) {
    assert.ok(['high', 'medium', 'low'].includes(violation.confidence));
    assert.equal(typeof violation.objective, 'boolean');
    assert.equal(typeof violation.evidence.description, 'string');
    assert.ok(EVIDENCE_KINDS.has(violation.evidence.kind));
    assert.equal(violation.evidence.file, fixture('gen2-emerald.tsx'));
    assert.equal(violation.evidence.line, violation.line);
    assert.ok(violation.evidence.selector, 'class-based findings should name a selector');
  }
});

test('standards-based findings cite the WCAG criterion they actually test', () => {
  const code = '<div className="bg-neutral-900 text-neutral-700">Low contrast label</div>';
  const audit = auditCode(code);
  const finding = audit.violations.find((violation) => violation.type === 'LOW_CONTRAST_GRAY');
  assert.ok(finding, 'the fixture must trigger low contrast');
  assert.equal(finding.objective, true);
  assert.equal(finding.evidence.kind, 'standard');
  assert.match(finding.evidence.criterion, /1\.4\.3/);
});

test('objective blockers and craft judgments are reported separately', () => {
  const audit = auditCode(readFixture('slop-component.tsx'), { filepath: fixture('slop-component.tsx') });
  assert.ok(audit.stats.objectiveCount + audit.stats.craftCount === audit.stats.totalViolations);
  assert.ok(audit.objectiveViolations.every((violation) => violation.objective));
  assert.ok(audit.craftViolations.every((violation) => !violation.objective));
  assert.equal(audit.stats.byConfidence.high + audit.stats.byConfidence.medium + audit.stats.byConfidence.low, audit.stats.totalViolations);
});

test('auto-fix rules are limited to high-confidence deterministic rewrites', () => {
  for (const type of AUTO_FIX_RULE_TYPES) {
    const meta = RULE_METADATA[type];
    assert.ok(meta, `${type} is auto-fixed but has no metadata`);
    assert.ok(meta.falsePositives.length > 0, `${type} auto-fix needs documented false-positive controls`);
    assert.ok(
      meta.confidence === 'high' || (meta.autoFixScope && meta.autoFixScope.length > 20),
      `${type} is auto-fixed without high confidence and must declare a bounded auto-fix scope`
    );
  }
});

test('sloppy rules --json exposes the evidence metadata agents need', () => {
  const run = runCli(['rules', '--json']);
  assert.equal(run.status, 0, run.stderr);
  const payload = parseJsonStdout(run);
  const bySlug = new Map(payload.rules.map((rule) => [rule.slug, rule]));
  for (const [type, rule] of Object.entries(CANONICAL_RULES)) {
    const emitted = bySlug.get(type);
    assert.ok(emitted, `rules JSON is missing ${type}`);
    assert.equal(emitted.ruleId, rule.ruleId);
    assert.equal(emitted.confidence, RULE_METADATA[type].confidence);
    assert.equal(emitted.objective, RULE_METADATA[type].objective);
    assert.ok(Array.isArray(emitted.falsePositives) && emitted.falsePositives.length > 0);
    assert.ok(Array.isArray(emitted.evidenceKinds));
  }
});

test('sloppy check --json keeps evidence and objective/craft totals', () => {
  const run = runCli(['check', fixture('slop-component.tsx'), '--json']);
  const payload = parseJsonStdout(run);
  assert.equal(payload.totals.violations, payload.totals.objective + payload.totals.craft);
  const violations = payload.files.flatMap((file) => file.violations);
  assert.ok(violations.length > 0);
  assert.ok(violations.every((violation) => violation.evidence && violation.confidence));
});

test('legitimate dense dashboards, tables, and restrained surfaces do not trigger craft slop', () => {
  const audit = auditCode(readFixture('aesthetic-legit.tsx'), { filepath: fixture('aesthetic-legit.tsx') });
  assert.deepEqual(audit.violations, [], `legitimate dashboard must stay clean, got ${audit.violations.map((v) => v.ruleId).join(', ')}`);
  assert.equal(audit.stats.objectiveCount, 0);
  assert.equal(audit.stats.craftCount, 0);
});

test('declared brand direction suppresses the corresponding visual finding without hiding other rules', () => {
  const code = readFixture('gen2-emerald.tsx');
  const audit = auditCode(code, {
    filepath: fixture('gen2-emerald.tsx'),
    config: { design: { brandAccent: 'emerald', lockedTokens: ['accent: #10b981'] } }
  });
  assert.equal(audit.violations.some((violation) => violation.type === 'EMERALD_MONOCULTURE'), false);
});
