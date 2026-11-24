import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { auditCode, evaluateCraftRubric } from '../packages/core/dist/index.js';
import { ROOT } from './helpers.mjs';

test('False-Positive Sweep: Real-world patterns pass without false positives', () => {
  const realPatterns = [
    'patterns/linear/index.tsx',
    'patterns/raycast/index.tsx',
    'patterns/slack/index.tsx',
    'patterns/figma/index.tsx',
    'patterns/spotify/index.tsx',
    'patterns/finder/index.tsx',
    'patterns/notion/index.tsx',
    'patterns/google-calendar/index.tsx',
    'packages/components/animate-ui/dialog.luma.tsx',
    'packages/components/animate-ui/dropdown-menu.luma.tsx'
  ];

  for (const relPath of realPatterns) {
    const fullPath = path.join(ROOT, relPath);
    assert.ok(
      fs.existsSync(fullPath),
      `False-positive fixture is missing: ${relPath}. A skipped fixture would make this test lie about coverage.`
    );

    const source = fs.readFileSync(fullPath, 'utf8');
    const audit = auditCode(source, { filepath: fullPath, componentType: 'application' });
    const rubric = evaluateCraftRubric(source, { filepath: fullPath, componentType: 'application' });

    // Ensure no high or critical false positives on legitimate production code
    const highViolations = audit.violations.filter((v) => ['high', 'critical'].includes(v.severity));
    assert.equal(
      highViolations.length,
      0,
      `False positive detected in ${relPath}: ${JSON.stringify(highViolations, null, 2)}`
    );

    // Verify rubric maintains healthy craft score
    assert.ok(
      ['A+', 'A', 'B'].includes(rubric.grade),
      `${relPath} scored grade ${rubric.grade} (${rubric.overallScore}/100)`
    );
  }
});

test('False-Positive Sweep: Edge cases in copy rules do not flag legitimate technical terms', () => {
  const code = `
    import React from 'react';
    export function TechnicalView() {
      // Legitimate technical references should never trigger fake social proof or clichés
      const userCount = 10000;
      const uptimeTarget = 99.99;
      return (
        <div className="p-4 bg-slate-900 text-slate-100">
          <p>Internal network latency benchmark: 10,000 requests processed.</p>
          <button type="button" onClick={() => console.log('clicked')}>
            Export Metrics
          </button>
        </div>
      );
    }
  `;

  const audit = auditCode(code, { componentType: 'application' });
  const fakeProof = audit.violations.filter((v) => v.ruleId === 'FABRICATED_SOCIAL_PROOF');
  assert.equal(fakeProof.length, 0, 'Internal technical count must not trigger FABRICATED_SOCIAL_PROOF');
});

test('False-Positive Sweep: documentation strings that quote a dead link or handler are not findings', () => {
  const code = `
    export const ruleNotes = {
      deadLinks: 'Never ship href="#" or onClick={() => {}} in product UI.',
      message: 'Connect links to real routes.'
    };
    export function Notes() {
      return <p className="text-sm text-neutral-400">See the rule notes.</p>;
    }
  `;

  const audit = auditCode(code, { componentType: 'application' });
  assert.equal(
    audit.violations.some((violation) => violation.type === 'DEAD_PLACEHOLDER_SLOP'),
    false,
    'quoted examples in strings must not be treated as rendered attributes'
  );
});
