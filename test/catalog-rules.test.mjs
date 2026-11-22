import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode } from '../packages/core/dist/index.js';

test('catches hero gradient text (VIS-01)', () => {
  const code = `
    export function Hero() {
      return (
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          The Future of Engineering
        </h1>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'HERO_GRADIENT_TEXT'), 'Should detect HERO_GRADIENT_TEXT');
});

test('catches negative parallelism copy cliché (CPY-04)', () => {
  const code = `
    export function Intro() {
      return (
        <p>It's not just a tool — it's an intelligent workspace built for scale.</p>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'NEGATIVE_PARALLELISM'), 'Should detect NEGATIVE_PARALLELISM');
});

test('catches fabricated social proof metrics (CPY-01)', () => {
  const code = `
    export function Proof() {
      return (
        <div>
          <span>Trusted by 50,000+ teams worldwide with 99.99% uptime guarantee</span>
        </div>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'FABRICATED_SOCIAL_PROOF'), 'Should detect FABRICATED_SOCIAL_PROOF');
});

test('catches leftover chatbot conversational phrasing (CPY-06)', () => {
  const code = `
    export function Card() {
      return (
        <div>
          <p>I hope this helps! Here is the breakdown of your operational revenue.</p>
        </div>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'CHATBOT_SIGN_OFF_SLOP'), 'Should detect CHATBOT_SIGN_OFF_SLOP');
});

test('catches inaccessible clickable div without role (AX-01)', () => {
  const badCode = `
    export function Action() {
      return (
        <div onClick={() => console.log('clicked')} className="p-2 cursor-pointer">
          Click Here
        </div>
      );
    }
  `;
  const badResult = auditCode(badCode);
  assert.ok(badResult.violations.some(v => v.type === 'FAKE_CONTROL_SLOP'), 'Should detect FAKE_CONTROL_SLOP for unaccessible div');

  const goodCode = `
    export function Action() {
      return (
        <div role="button" tabIndex={0} onClick={() => console.log('clicked')} className="p-2 cursor-pointer">
          Click Here
        </div>
      );
    }
  `;
  const goodResult = auditCode(goodCode);
  assert.ok(!goodResult.violations.some(v => v.type === 'FAKE_CONTROL_SLOP'), 'Should not flag accessible div with role="button"');
});
