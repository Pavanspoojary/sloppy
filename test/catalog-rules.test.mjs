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

test('catches placeholder and lorem ipsum copy (CPY-07)', () => {
  const code = `
    export function Profile() {
      return (
        <div>
          <h3>John Doe</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'LOREM_IPSUM_SLOP'), 'Should detect LOREM_IPSUM_SLOP');
  const violation = result.violations.find(v => v.type === 'LOREM_IPSUM_SLOP');
  assert.equal(violation.ruleId, 'CPY-07');
});

test('catches raw emojis as UI icons (MED-01)', () => {
  const code = `
    export function Actions() {
      return (
        <div>
          <button className="px-4 py-2">🚀 Launch App</button>
          <h1>🔥 Hot Features</h1>
        </div>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'EMOJI_ICON_SLOP'), 'Should detect EMOJI_ICON_SLOP');
  const violation = result.violations.find(v => v.type === 'EMOJI_ICON_SLOP');
  assert.equal(violation.ruleId, 'MED-01');
});

test('catches arbitrary z-index escalation (TOK-01)', () => {
  const code = `
    export function Modal() {
      return (
        <div className="fixed inset-0 z-[9999] bg-black/50">
          <div className="z-[99999] p-6">Modal Content</div>
        </div>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'Z_INDEX_CHAOS'), 'Should detect Z_INDEX_CHAOS');
  const violation = result.violations.find(v => v.type === 'Z_INDEX_CHAOS');
  assert.equal(violation.ruleId, 'TOK-01');
});

test('catches scroll hijacking (UX-05)', () => {
  const code = `
    export function RootLayout({ children }) {
      return (
        <html className="overflow-hidden">
          <body onWheel={(e) => e.preventDefault()}>
            {children}
          </body>
        </html>
      );
    }
  `;
  const result = auditCode(code);
  assert.ok(result.violations.some(v => v.type === 'SCROLL_HIJACKING'), 'Should detect SCROLL_HIJACKING');
  const violation = result.violations.find(v => v.type === 'SCROLL_HIJACKING');
  assert.equal(violation.ruleId, 'UX-05');
});

test('supports dual-scheme rule IDs in inline ignores (VIS-02 vs PURPLE_GRADIENT_SLOP)', () => {
  const codeWithCode = `
    export function Card() {
      return (
        // sloppy-ignore-next-line VIS-02
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4" />
      );
    }
  `;
  const result1 = auditCode(codeWithCode);
  assert.ok(!result1.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'VIS-02 code should suppress PURPLE_GRADIENT_SLOP');

  const codeWithSlug = `
    export function Card() {
      return (
        // sloppy-ignore-next-line PURPLE_GRADIENT_SLOP
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4" />
      );
    }
  `;
  const result2 = auditCode(codeWithSlug);
  assert.ok(!result2.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'PURPLE_GRADIENT_SLOP slug should suppress');
});
