import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './helpers.mjs';

function startServer() {
  const child = spawn(process.execPath, [path.join(ROOT, 'packages/mcp/bin/sloppy-mcp.js')], {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let buffer = '';
  const waiters = [];
  const messages = [];
  let stderr = '';

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    let index = buffer.indexOf('\n');
    while (index !== -1) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      index = buffer.indexOf('\n');
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      messages.push(message);
      for (const waiter of [...waiters]) {
        if (waiter.predicate(message)) {
          waiters.splice(waiters.indexOf(waiter), 1);
          waiter.resolve(message);
        }
      }
    }
  });

  function send(message) {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  function waitFor(predicate, timeoutMs = 15000) {
    const existing = messages.find(predicate);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = waiters.findIndex((waiter) => waiter.resolve === resolve);
        if (index !== -1) waiters.splice(index, 1);
        reject(new Error(`MCP timeout. stderr:\n${stderr}\nstdout:\n${buffer}`));
      }, timeoutMs);
      waiters.push({
        predicate,
        resolve: (message) => {
          clearTimeout(timer);
          resolve(message);
        }
      });
    });
  }

  return { child, send, waitFor, getStderr: () => stderr };
}

test('MCP server exposes strictly the 5 primary tools to save context tokens', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'sloppy-test', version: '1.0.0' }
    }
  });

  const init = await server.waitFor((message) => message.id === 1);
  assert.ok(init.result, `initialize failed: ${JSON.stringify(init)}`);
  assert.ok(init.result.instructions, 'the server must teach the audit-fix-verify loop');

  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  server.send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });

  const list = await server.waitFor((message) => message.id === 2);
  assert.ok(Array.isArray(list.result.tools));
  assert.equal(list.result.tools.length, 5, 'must expose strictly 5 primary tools (YAGNI/Ponytail)');

  const names = new Set(list.result.tools.map((tool) => tool.name));
  for (const primary of ['sloppy_check', 'sloppy_plan', 'sloppy_fix', 'sloppy_catalog', 'sloppy_rules']) {
    assert.ok(names.has(primary), `missing primary MCP tool ${primary}`);
  }

  // Verify legacy bloat is eliminated
  assert.equal(names.has('sloppy_audit_code'), false);
  assert.equal(names.has('sloppy_evaluate_rubric'), false);
  assert.equal(names.has('sloppy_search_components'), false);
});

test('MCP sloppy_check returns a machine-readable verdict', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'sloppy-test', version: '1.0.0' }
    }
  });
  await server.waitFor((message) => message.id === 1);
  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'sloppy_check',
      arguments: { code: '<div className="bg-gradient-to-r from-purple-500 to-indigo-600" />' }
    }
  });

  const response = await server.waitFor((message) => message.id === 2);
  assert.ok(response.result, JSON.stringify(response));
  const text = response.result.content.find((item) => item.type === 'text').text;
  const payload = JSON.parse(text);
  assert.equal(payload.ok, false);
  assert.ok(payload.violations.length > 0);
  assert.ok(payload.nextActions.length > 0);
});

test('MCP sloppy_rules queries craft guidelines', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'sloppy-test', version: '1.0.0' }
    }
  });
  await server.waitFor((message) => message.id === 1);
  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'sloppy_rules',
      arguments: { topic: 'framing' }
    }
  });

  const response = await server.waitFor((message) => message.id === 2);
  assert.ok(response.result, JSON.stringify(response));
  const text = response.result.content.find((item) => item.type === 'text').text;
  const payload = JSON.parse(text);
  assert.ok(payload.rules || payload.commandments, 'must return framing rules payload');
});

test('MCP sloppy_fix exposes only, wiringGuard, and manualReviewItems', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'sloppy-test', version: '1.0.0' } }
  });
  await server.waitFor((message) => message.id === 1);
  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'sloppy_fix',
      arguments: {
        code: '<button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-indigo-600">Save</button>',
        only: ['PURPLE_GRADIENT_SLOP']
      }
    }
  });

  const response = await server.waitFor((message) => message.id === 2);
  assert.ok(response.result, JSON.stringify(response));
  const payload = JSON.parse(response.result.content.find((item) => item.type === 'text').text);
  assert.deepEqual(payload.only, ['PURPLE_GRADIENT_SLOP']);
  assert.ok(payload.wiringGuard, 'sloppy_fix must report the wiring guard');
  assert.equal(payload.wiringGuard.passed, true);
  assert.ok(Array.isArray(payload.manualReviewItems));
  assert.equal(/from-purple-500/.test(payload.transformedCode), false);
});

test('MCP sloppy_rules evidence topic exposes confidence and false-positive controls', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'sloppy-test', version: '1.0.0' }
    }
  });
  await server.waitFor((message) => message.id === 1);
  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: 'sloppy_rules', arguments: { topic: 'evidence' } }
  });

  const response = await server.waitFor((message) => message.id === 2);
  assert.ok(response.result, `rules call failed: ${JSON.stringify(response)}`);
  const text = response.result.content[0].text;
  const payload = JSON.parse(text);
  assert.ok(Array.isArray(payload.rules) && payload.rules.length >= 30);
  const contrast = payload.rules.find((rule) => rule.ruleId === 'VIS-08');
  assert.equal(contrast.confidence, 'high');
  assert.equal(contrast.objective, true);
  assert.ok(contrast.evidenceKinds.includes('standard'));
  assert.ok(contrast.falsePositives.length > 0);
});

test('MCP sloppy_catalog defaults to summary mode and sloppy_rules supports ruleId and compact filters', async (t) => {
  const server = startServer();
  t.after(() => {
    server.child.kill('SIGTERM');
  });

  server.send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'sloppy-test', version: '1.0.0' } }
  });
  await server.waitFor((message) => message.id === 1);
  server.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  server.send({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: 'sloppy_catalog', arguments: { query: 'motion', limit: 5 } }
  });
  const catalogRes = await server.waitFor((message) => message.id === 2);
  const catalog = JSON.parse(catalogRes.result.content[0].text);
  assert.equal(catalog.detail, 'summary');
  if (catalog.components.length) {
    assert.equal(catalog.components[0].description, undefined);
  }

  server.send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'sloppy_rules', arguments: { topic: 'evidence', ruleId: 'MOT-03', compact: true } }
  });
  const ruleRes = await server.waitFor((message) => message.id === 3);
  const rulePayload = JSON.parse(ruleRes.result.content[0].text);
  assert.equal(rulePayload.rules.length, 1);
  assert.equal(rulePayload.rules[0].ruleId, 'MOT-03');
  assert.equal(rulePayload.rules[0].falsePositives, undefined);
});
