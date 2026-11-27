import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fixture } from './helpers.mjs';
import { analyzeFocusOrder, auditA11ySnapshot, runAccessibilityAudit } from '../packages/verify/accessibility.mjs';

const cleanButton = {
  tag: 'BUTTON',
  role: 'button',
  name: 'Save changes',
  selector: 'button.save',
  tabIndex: 0,
  rect: { width: 120, height: 40 },
  focusVisible: true,
  hasLabel: true,
  inlineLink: false
};

test('a clean interactive snapshot produces no accessibility findings', () => {
  const findings = auditA11ySnapshot([
    cleanButton,
    {
      tag: 'INPUT',
      role: 'textbox',
      name: 'Workspace name',
      selector: 'input#workspace',
      type: 'text',
      tabIndex: 0,
      rect: { width: 240, height: 40 },
      focusVisible: true,
      hasLabel: true
    }
  ], { viewport: { width: 1440, height: 900 } });

  assert.deepEqual(findings, []);
});

test('unnamed buttons and unlabeled form controls are high-confidence defects', () => {
  const findings = auditA11ySnapshot([
    { ...cleanButton, name: '' },
    { ...cleanButton, tag: 'INPUT', role: 'textbox', type: 'email', name: '', selector: 'input.email' }
  ]);

  const rules = findings.map((finding) => finding.rule);
  assert.ok(rules.includes('a11y.nameMissing'));
  assert.ok(rules.includes('a11y.inputUnlabeled'));
  assert.ok(findings.every((finding) => finding.objective === true));
  assert.ok(findings.every((finding) => finding.evidence.criterion.includes('4.1.2') || finding.evidence.criterion.includes('3.3.2')));
});

test('disabled controls are not reported because they are not operable', () => {
  const findings = auditA11ySnapshot([
    { ...cleanButton, name: '', disabled: true },
    { ...cleanButton, tag: 'INPUT', role: 'textbox', name: '', disabled: true }
  ]);
  assert.deepEqual(findings, []);
});

test('target size uses the WCAG 2.2 24x24 threshold and exempts inline links', () => {
  const findings = auditA11ySnapshot([
    { ...cleanButton, selector: 'button.icon', rect: { width: 20, height: 20 } },
    { ...cleanButton, tag: 'A', role: 'link', name: 'Read more', selector: 'a.inline', inlineLink: true, rect: { width: 70, height: 18 } }
  ]);

  const targets = findings.filter((finding) => finding.rule === 'a11y.targetTooSmall');
  assert.equal(targets.length, 1);
  assert.match(targets[0].message, /20x20px/);
  assert.match(targets[0].evidence.criterion, /2\.5\.8/);
});

test('focus visibility, duplicate ids, broken references, and unwired state are reported honestly', () => {
  const findings = auditA11ySnapshot(
    [
      { ...cleanButton, selector: 'button.ghost', focusVisible: false },
      { ...cleanButton, selector: 'button.disclosure', ariaExpanded: 'false' }
    ],
    {
      duplicateIds: ['workspace'],
      brokenReferences: [{ attribute: 'aria-controls', id: 'panel-missing', selector: 'button.disclosure' }],
      reducedMotionIgnored: true
    }
  );

  const rules = new Set(findings.map((finding) => finding.rule));
  assert.ok(rules.has('a11y.focusInvisible'));
  assert.ok(rules.has('a11y.duplicateId'));
  assert.ok(rules.has('a11y.brokenReference'));
  assert.ok(rules.has('a11y.stateUnwired'));
  assert.ok(rules.has('a11y.reducedMotionIgnored'));

  const focus = findings.find((finding) => finding.rule === 'a11y.focusInvisible');
  assert.equal(focus.confidence, 'medium');
  const duplicate = findings.find((finding) => finding.rule === 'a11y.duplicateId');
  assert.equal(duplicate.objective, false);
  const motion = findings.find((finding) => finding.rule === 'a11y.reducedMotionIgnored');
  assert.equal(motion.confidence, 'low');
});

test('a local file target returns unavailable instead of a fake accessibility pass', async () => {
  const result = await runAccessibilityAudit('test/fixtures/clean-component.tsx');
  assert.equal(result.ok, false);
  assert.equal(result.isStaticFallback, true);
  assert.equal(result.findings.length, 0);
  assert.match(result.unavailable, /served|DOM/i);
});

test('an unreachable URL fails closed with an explicit unavailable reason', async () => {
  const result = await runAccessibilityAudit('https://127.0.0.1:1', { timeoutMs: 2500 });
  assert.equal(result.ok, false);
  assert.equal(result.findings.length, 0);
  assert.ok(result.unavailable, 'an unreachable target must not report a pass');
});

test('undersized targets are exempt when the 24px spacing exception holds', () => {
  const isolated = auditA11ySnapshot([
    { ...cleanButton, selector: 'button.isolated', rect: { x: 200, y: 200, width: 20, height: 20 } }
  ]);
  assert.equal(isolated.some((finding) => finding.rule === 'a11y.targetTooSmall'), false);

  const crowded = auditA11ySnapshot([
    { ...cleanButton, selector: 'button.first', rect: { x: 200, y: 200, width: 20, height: 20 } },
    { ...cleanButton, selector: 'button.second', rect: { x: 218, y: 200, width: 20, height: 20 } }
  ]);
  assert.ok(crowded.some((finding) => finding.rule === 'a11y.targetTooSmall'));
});

test('positive tabindex is reported as a focus-order override without a high-confidence claim', () => {
  const findings = auditA11ySnapshot([{ ...cleanButton, selector: 'button.hijack', explicitTabIndex: '3' }]);
  const finding = findings.find((item) => item.rule === 'a11y.positiveTabindex');
  assert.ok(finding);
  assert.equal(finding.objective, false);
  assert.match(finding.evidence.criterion, /2\.4\.3/);
});

test('focus-order analysis flags upward jumps but leaves normal sequence alone', () => {
  const normal = analyzeFocusOrder([
    { selector: '#header', docTop: 20 },
    { selector: '#main', docTop: 240 },
    { selector: '#footer', docTop: 900 }
  ]);
  assert.deepEqual(normal, []);

  const jumped = analyzeFocusOrder([
    { selector: '#header', docTop: 20 },
    { selector: '#main', docTop: 640 },
    { selector: '#footer', docTop: 120 }
  ]);
  assert.equal(jumped.length, 1);
  assert.equal(jumped[0].from, '#main');
  assert.equal(jumped[0].to, '#footer');
});

test('reflow and 200% text resize evidence is produced only when the browser reports it', () => {
  const findings = auditA11ySnapshot([cleanButton], {
    reflowOverflow: { scrollWidth: 420, clientWidth: 320 },
    textResizeClipped: [{ selector: 'button.cta', scrollHeight: 64, clientHeight: 40 }]
  });

  const reflow = findings.find((item) => item.rule === 'a11y.reflowOverflow');
  assert.equal(reflow.severity, 'high');
  assert.match(reflow.evidence.criterion, /1\.4\.10/);

  const resize = findings.find((item) => item.rule === 'a11y.textResizeClipped');
  assert.equal(resize.confidence, 'medium');
  assert.match(resize.evidence.criterion, /1\.4\.4/);
});

test('content that only appears after JavaScript is reported as a first-paint defect', () => {
  const findings = auditA11ySnapshot([cleanButton], { firstPaint: { withJsChars: 400, withoutJsChars: 0 } });
  const firstPaint = findings.find((item) => item.rule === 'motion.jsDependentFirstPaint');
  assert.equal(firstPaint.severity, 'high');
  assert.equal(firstPaint.objective, false);

  const staticPage = auditA11ySnapshot([cleanButton], { firstPaint: { withJsChars: 400, withoutJsChars: 380 } });
  assert.equal(staticPage.some((item) => item.rule === 'motion.jsDependentFirstPaint'), false);
});

test('a served page decides first-paint evidence from the rendered DOM', async (t) => {
  const root = path.resolve(path.dirname(fixture('motion/nojs.html')));
  const server = http.createServer(async (req, res) => {
    const file = path.join(root, (req.url || '/').replace(/^\//, '').split('?')[0] || 'nojs.html');
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  try {
    const gated = await runAccessibilityAudit(`${origin}/nojs.html`, { timeoutMs: 12000 });
    if (gated.unavailable) return t.skip(`browser unavailable: ${gated.unavailable}`);
    assert.ok(gated.findings.some((item) => item.rule === 'motion.jsDependentFirstPaint'), JSON.stringify(gated.findings));

    const staticRender = await runAccessibilityAudit(`${origin}/clean.html`, { timeoutMs: 12000 });
    assert.equal(staticRender.findings.some((item) => item.rule === 'motion.jsDependentFirstPaint'), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
