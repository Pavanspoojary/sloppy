import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode, loadSloppyConfig } from '../packages/core/dist/index.js';

test('config allows brand gradients when allowGradients is true', () => {
  const code = `<div style="background: linear-gradient(135deg, #7c3aed, #a855f7)">Hero</div>`;
  const strictResult = auditCode(code);
  assert.ok(strictResult.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'Default audit should flag purple gradient');

  const allowedResult = auditCode(code, {
    config: {
      brand: { allowGradients: true }
    }
  });
  assert.ok(!allowedResult.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'Audit with allowGradients: true should not flag brand gradient');
});

test('config allows rule overrides to disable a rule', () => {
  const code = `<div className="text-center items-center justify-center place-items-center flex"><span className="text-center">Centered</span></div>`;
  const normalResult = auditCode(code);
  
  const disabledResult = auditCode(code, {
    config: {
      rules: {
        CENTER_ALIGNED_EVERYTHING: 'off'
      }
    }
  });
  assert.ok(!disabledResult.violations.some(v => v.type === 'CENTER_ALIGNED_EVERYTHING'));
});

test('config customizes word budget per surface', () => {
  const words = Array(25).fill('word').join(' ');
  const code = `<div>${words}</div>`;
  
  // By default illustration limit is 12 words
  const defaultAudit = auditCode(code, { componentType: 'illustration' });
  assert.ok(defaultAudit.violations.some(v => v.type === 'WORD_BUDGET_EXCEEDED'));

  // Custom budget overrides to 30 words
  const customAudit = auditCode(code, {
    componentType: 'illustration',
    config: {
      wordBudget: {
        illustration: 30
      }
    }
  });
  assert.ok(!customAudit.violations.some(v => v.type === 'WORD_BUDGET_EXCEEDED'));
});

test('rule-specific inline ignore suppresses only the named rule', () => {
  const code = `
    // sloppy-ignore-next-line PURPLE_GRADIENT_SLOP
    <div style="background: linear-gradient(135deg, #7c3aed, #a855f7)" className="p-8 m-8 border rounded-lg bg-zinc-900">
      <Sparkles className="animate-bounce" />
    </div>
  `;
  const result = auditCode(code);
  assert.ok(!result.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'PURPLE_GRADIENT_SLOP should be suppressed');
  assert.ok(result.violations.some(v => v.type === 'SPARKLE_ICON_OVERLOAD'), 'Other rules must not be suppressed');
});
