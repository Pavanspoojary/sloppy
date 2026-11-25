import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode, detectProjectStack } from '../packages/core/dist/index.js';

test('catches chained type assertions (COD-02)', () => {
  const code = `
export function processUser(raw: unknown) {
  const user = raw as unknown as { id: string; name: string };
  const target = val as any as Target;
  const safe = raw as User; // Not chained
  return { user, target, safe };
}
`;

  const audit = auditCode(code);
  const violations = audit.violations.filter(v => v.type === 'CHAINED_TYPE_ASSERTION');
  assert.equal(violations.length, 2, 'should flag both "as unknown as" and "as any as"');
  assert.equal(violations[0].ruleId, 'COD-02');
  assert.equal(violations[0].tier, 'reflex');
});

test('catches unvalidated dynamic contract returns (COD-03)', () => {
  const code = `
export async function fetchData(url: string): Promise<any> {
  const res = await fetch(url);
  return res.json();
}

export const getPayload = (): unknown => {
  return null;
};

export function getTyped(): Promise<User> {
  return Promise.resolve({ id: '1' });
}
`;

  const audit = auditCode(code);
  const violations = audit.violations.filter(v => v.type === 'UNVALIDATED_DYNAMIC_RETURN');
  assert.equal(violations.length, 2, 'should flag Promise<any> and (): unknown returns');
  assert.equal(violations[0].ruleId, 'COD-03');
});

test('catches broad Record<string, any/unknown> types (COD-04)', () => {
  const code = `
export type AnyMap = Record<string, any>;
export type UnknownDict = Record<string, unknown>;
export type SafeDict = Record<string, number>;
`;

  const audit = auditCode(code);
  const violations = audit.violations.filter(v => v.type === 'BROAD_RECORD_SLOP');
  assert.equal(violations.length, 2, 'should flag Record<string, any> and Record<string, unknown>');
  assert.equal(violations[0].ruleId, 'COD-04');
});

test('catches conditional empty object spreads (COD-05)', () => {
  const code = `
export function makeConfig(isAdmin: boolean) {
  const normal = { id: 1, ...defaultOpts };
  const sloppy = {
    id: 2,
    ...(isAdmin ? { role: 'admin', level: 1 } : {})
  };
  return { normal, sloppy };
}
`;

  const audit = auditCode(code);
  const violations = audit.violations.filter(v => v.type === 'EMPTY_OBJECT_SPREAD');
  assert.equal(violations.length, 1, 'should flag conditional empty object spread');
  assert.equal(violations[0].ruleId, 'COD-05');
  assert.equal(violations[0].tier, 'finish');
});

test('catches unsafe chained non-null assertions (COD-06)', () => {
  const code = `
export function formatAddress(user: User | null) {
  const city = user!.profile!.address!.city;
  const safe = user?.profile?.address?.city;
  return { city, safe };
}
`;

  const audit = auditCode(code);
  const violations = audit.violations.filter(v => v.type === 'NON_NULL_ASSERTION_SLOP');
  assert.ok(violations.length >= 1, 'should flag chained non-null assertions');
  assert.equal(violations[0].ruleId, 'COD-06');
  assert.equal(violations[0].tier, 'floor');
});

test('enforces written invariant rationale on inline ignores in strict mode', () => {
  const codeWithoutRationale = `
// sloppy-ignore-next-line COD-02
const user = raw as unknown as User;
`;

  const codeWithRationale = `
// sloppy-ignore-next-line COD-02 -- Checked invariant: verified with Zod upstream
const user = raw as unknown as User;
`;

  // In non-strict mode: simple ignore works
  const nonStrictAudit = auditCode(codeWithoutRationale, { strict: false });
  assert.equal(nonStrictAudit.violations.filter(v => v.type === 'CHAINED_TYPE_ASSERTION').length, 0, 'should suppress in non-strict mode');

  // In strict mode without written rationale: ignore is REJECTED
  const strictAuditFail = auditCode(codeWithoutRationale, { strict: true });
  assert.equal(strictAuditFail.violations.filter(v => v.type === 'CHAINED_TYPE_ASSERTION').length, 1, 'should reject ignore lacking rationale in strict mode');

  // In strict mode with valid written rationale: ignore is HONORED
  const strictAuditPass = auditCode(codeWithRationale, { strict: true });
  assert.equal(strictAuditPass.violations.filter(v => v.type === 'CHAINED_TYPE_ASSERTION').length, 0, 'should honor ignore with written rationale in strict mode');
});

test('codeOnly option restricts audit to low-evidence engineering rules', () => {
  const mixedCode = `
import React from 'react';

// ============================================================================
// Render component
// ============================================================================
export function MixedComponent({ raw }: { raw: unknown }) {
  const user = raw as unknown as { id: string };
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-transparent bg-clip-text">
      <h1>Hello world</h1>
    </div>
  );
}
`;

  const allAudit = auditCode(mixedCode);
  const codeOnlyAudit = auditCode(mixedCode, { codeOnly: true });

  assert.ok(allAudit.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'normal audit catches visual slop');
  assert.ok(allAudit.violations.some(v => v.type === 'CHAINED_TYPE_ASSERTION'), 'normal audit catches code slop');

  assert.ok(!codeOnlyAudit.violations.some(v => v.type === 'PURPLE_GRADIENT_SLOP'), 'codeOnly excludes visual slop');
  assert.ok(codeOnlyAudit.violations.some(v => v.type === 'CHAINED_TYPE_ASSERTION'), 'codeOnly keeps chained type assertion');
  assert.ok(codeOnlyAudit.violations.some(v => v.type === 'AI_NARRATION_COMMENT_SLOP'), 'codeOnly keeps AI narration comment');
});

test('detectProjectStack accurately detects monorepo engineering stack', () => {
  const stack = detectProjectStack(process.cwd());
  assert.equal(stack.hasTypeScript, true, 'should detect TypeScript');
  assert.ok(stack.summary.length > 0, 'summary should not be empty');
  assert.ok(stack.suggestedConfig.rules['COD-02'], 'suggested config should include COD-02');
  assert.equal(stack.suggestedConfig.strict, true, 'suggested config should recommend strict mode');
});

test('reports exact line numbers across multi-line block comments and regex quotes', () => {
  const code = `
/*
 * Multi-line JSDoc header
 * Line 3
 * Line 4
 */
const pattern = /^['"\`]|['"\`]$/g;
export function inspect(input: Record<string, unknown>) {
  return input;
}
`;

  const audit = auditCode(code);
  const v = audit.violations.find(item => item.type === 'BROAD_RECORD_SLOP');
  assert.ok(v, 'must still detect Record<string, unknown> after regex with quotes');
  assert.equal(v.line, 8, `expected exact line 8, got ${v.line}`);
  assert.match(v.snippet || '', /Record<string, unknown>/);
});

test('maps visible copy and emoji offsets to JSX rather than earlier comments, and ignores typographic glyphs', () => {
  const code = `
// Comment mentioning 👀 emoji and Supercharge your workflow
import React from 'react';

export function Panel() {
  return (
    <div className="p-4 bg-neutral-900">
      <span>❯</span>
      <span>✓</span>
      <span>✕</span>
      <span>🚀</span>
    </div>
  );
}
`;

  const audit = auditCode(code);
  const emojiViolations = audit.violations.filter(v => v.type === 'EMOJI_ICON_SLOP');
  assert.equal(emojiViolations.length, 1, 'should only flag real emoji 🚀, not ❯/✓/✕ or comment 👀');
  assert.equal(emojiViolations[0].line, 11, `expected JSX line 11, not comment line 2 (got ${emojiViolations[0].line})`);
});
