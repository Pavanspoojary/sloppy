import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './helpers.mjs';

function startServer(extraArgs = []) {
  const child = spawn(process.execPath, [path.join(ROOT, 'packages/mcp/bin/sloppy-mcp.js'), ...extraArgs], {
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

test('MCP server exposes only 5 primary tools by default to save context tokens', async (t) => {
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
  assert.equal(list.result.tools.length, 5, 'must expose exactly 5 primary tools by default');

  const names = new Set(list.result.tools.map((tool) => tool.name));
  for (const primary of ['sloppy_check', 'sloppy_plan', 'sloppy_fix', 'sloppy_catalog', 'sloppy_rules']) {
    assert.ok(names.has(primary), `missing primary MCP tool ${primary}`);
  }

  // Verify legacy tools are hidden by default
  assert.equal(names.has('sloppy_audit_code'), false, 'sloppy_audit_code must be hidden by default');
  assert.equal(names.has('sloppy_evaluate_rubric'), false, 'sloppy_evaluate_rubric must be hidden by default');
});

test('MCP server exposes all legacy tools when --legacy-tools flag is passed', async (t) => {
  const server = startServer(['--legacy-tools']);
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

  server.send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const list = await server.waitFor((message) => message.id === 2);
  assert.ok(Array.isArray(list.result.tools));
  assert.ok(list.result.tools.length >= 16, 'must expose full tool catalog with legacy tools enabled');

  const names = new Set(list.result.tools.map((tool) => tool.name));
  for (const required of ['sloppy_check', 'sloppy_fix', 'sloppy_audit_code', 'sloppy_evaluate_rubric', 'sloppy_rules', 'sloppy_get_rules']) {
    assert.ok(names.has(required), `missing MCP tool ${required} in legacy mode`);
  }
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
