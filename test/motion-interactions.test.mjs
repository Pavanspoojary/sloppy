import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fixture } from './helpers.mjs';
import {
  auditMotionInteractionSamples,
  runMotionInteractionAudit
} from '../packages/verify/motion-interactions.mjs';

const box = (x, y, width = 100, height = 40) => ({ x, y, width, height });

test('a settled interaction with stable anchor and no running motion stays clean', () => {
  const findings = auditMotionInteractionSamples([
    {
      name: 'menu',
      target: '#panel',
      before: { target: box(10, 10), anchor: box(0, 0) },
      after: { target: box(10, 10), anchor: box(0, 0) },
      settled: box(10, 10),
      later: box(10, 10),
      runningAfterSettle: [],
      frames: [16.7, 16.7, 16.8, 16.7, 17.1, 16.6],
      interrupted: true,
      interruptRecovered: true
    }
  ]);
  assert.deepEqual(findings, []);
});

test('a late layout change, moving anchor, stuck transition, and half-recovered interrupt are reported', () => {
  const findings = auditMotionInteractionSamples([
    {
      name: 'late shift',
      target: '#panel',
      settled: box(10, 10),
      later: box(10, 18)
    },
    {
      name: 'moving anchor',
      target: '#panel',
      before: { anchor: box(0, 0) },
      after: { anchor: box(0, 28) }
    },
    {
      name: 'stuck',
      target: '#slow',
      runningAfterSettle: ['opacity', 'transform']
    },
    {
      name: 'interrupted',
      target: '#slow',
      interrupted: true,
      interruptRecovered: false
    }
  ]);
  const rules = new Set(findings.map((finding) => finding.rule));
  assert.ok(rules.has('motion.handoffShift'), [...rules].join(', '));
  assert.ok(rules.has('motion.anchorDrift'), [...rules].join(', '));
  assert.ok(rules.has('motion.stuckTransition'), [...rules].join(', '));
  assert.ok(rules.has('motion.interruptNotRecovered'), [...rules].join(', '));
  for (const finding of findings) assert.equal(finding.evidence.kind, 'interaction');
});

test('a slow interaction reports a frame-budget finding only as low-confidence craft', () => {
  const findings = auditMotionInteractionSamples([
    { name: 'janky', target: '#panel', frames: [16, 80, 90, 16, 75, 16] }
  ]);
  const budget = findings.find((finding) => finding.rule === 'motion.frameBudget');
  assert.ok(budget);
  assert.equal(budget.confidence, 'low');
  assert.equal(budget.objective, false);
});

test('the audit fails closed without a served URL or a declared interaction', async () => {
  const noUrl = await runMotionInteractionAudit('src/Panel.tsx', { spec: { interactions: [{ trigger: '#a', target: '#b' }] } });
  assert.equal(noUrl.ok, false);
  assert.equal(noUrl.mode, 'unavailable');
  assert.ok(noUrl.unavailable);

  const noSpec = await runMotionInteractionAudit('https://127.0.0.1:1', { spec: { interactions: [] } });
  assert.equal(noSpec.ok, false);
  assert.equal(noSpec.mode, 'unavailable');
});

async function serveFixtures() {
  const root = path.resolve(path.dirname(fixture('motion/clean.html')));
  const server = http.createServer(async (req, res) => {
    const file = path.join(root, (req.url || '/').replace(/^\//, '').split('?')[0] || 'clean.html');
    try {
      const body = await fs.readFile(file);
      const type = file.endsWith('.json') ? 'application/json' : 'text/html';
      res.writeHead(200, { 'content-type': type });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { origin: `http://127.0.0.1:${port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

test('a clean served interaction page passes the rendered motion audit', async (t) => {
  const server = await serveFixtures();
  try {
    const spec = JSON.parse(await fs.readFile(fixture('motion/clean.json'), 'utf8'));
    const result = await runMotionInteractionAudit(`${server.origin}/clean.html`, { spec, timeoutMs: 12000 });
    if (result.mode === 'unavailable') return t.skip(`browser unavailable: ${result.unavailable}`);
    const real = result.findings.filter((finding) => finding.rule !== 'motion.frameBudget');
    assert.deepEqual(real, [], JSON.stringify(real, null, 2));
    assert.equal(result.ok, result.findings.every((finding) => finding.rule === 'motion.frameBudget'));
  } finally {
    await server.close();
  }
});

test('a served page that shifts, sticks, and cannot be interrupted is reported', async (t) => {
  const server = await serveFixtures();
  try {
    const spec = JSON.parse(await fs.readFile(fixture('motion/broken.json'), 'utf8'));
    const result = await runMotionInteractionAudit(`${server.origin}/broken.html`, { spec, timeoutMs: 12000 });
    if (result.mode === 'unavailable') return t.skip(`browser unavailable: ${result.unavailable}`);
    const rules = new Set(result.findings.map((finding) => finding.rule));
    for (const rule of ['motion.anchorDrift', 'motion.handoffShift', 'motion.stuckTransition', 'motion.interruptNotRecovered']) {
      assert.ok(rules.has(rule), `missing ${rule}; got ${[...rules].join(', ')}`);
    }
    assert.equal(result.ok, false);
  } finally {
    await server.close();
  }
});
