import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CANONICAL_RULES } from '../packages/core/dist/index.js';
import { ROOT } from './helpers.mjs';

const canonical = Object.entries(CANONICAL_RULES).map(([slug, rule]) => ({ slug, ...rule }));
const canonicalById = new Map(canonical.map((rule) => [rule.ruleId, rule]));
const canonicalBySlug = new Map(canonical.map((rule) => [rule.slug, rule]));

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

test('docs/RULES.md is generated from CANONICAL_RULES with one ID per slug', () => {
  const doc = read('docs/RULES.md');
  const rows = [...doc.matchAll(/^\| `([A-Z]+-\d+)` \| `([A-Z_]+)` \| (.+?) \| (\w+) \| (\w+) \| (auto-fix|detect-only) \|/gm)]
    .map((match) => ({ id: match[1], slug: match[2], title: match[3], tier: match[4], severity: match[5], mode: match[6] }));

  assert.equal(rows.length, canonical.length, 'docs/RULES.md must list every canonical rule exactly once');
  for (const row of rows) {
    const rule = canonicalById.get(row.id);
    assert.ok(rule, `${row.id} is not in CANONICAL_RULES`);
    assert.equal(rule.slug, row.slug, `${row.id} must map to ${rule.slug}, not ${row.slug}`);
    assert.equal(rule.title, row.title);
    assert.equal(rule.mode, row.mode);
  }
  assert.equal(new Set(rows.map((row) => row.slug)).size, canonical.length, 'slugs must be unique');
});

test('README references only canonical rule IDs and includes every rule', () => {
  const readme = read('README.md');
  const referenced = [...readme.matchAll(/\b([A-Z]{3,4}-\d{2})\b/g)].map((match) => match[1]);
  for (const id of referenced) {
    assert.ok(canonicalById.has(id), `README references unknown rule ID ${id}`);
  }
  for (const rule of canonical) {
    assert.ok(readme.includes(`\`${rule.ruleId}\``), `README is missing ${rule.ruleId}`);
    assert.ok(readme.includes(`\`${rule.slug}\``), `README is missing ${rule.slug}`);
  }
});

test('skills reference only canonical rule IDs', () => {
  const files = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  };
  visit(path.join(ROOT, 'skills'));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\b([A-Z]{3,4}-\d{2})\b/g)) {
      assert.ok(canonicalById.has(match[1]), `${path.relative(ROOT, file)} references unknown rule ID ${match[1]}`);
    }
  }
});

test('the catalog uses the same title for every implemented rule ID', () => {
  const catalog = read('docs/AI_SLOP_CATALOG.md');
  for (const match of catalog.matchAll(/^\| `([A-Z]+-\d+)` \| \*\*(.+?)\*\* \|/gm)) {
    const rule = canonicalById.get(match[1]);
    if (!rule) continue; // catalog-only spec, not enforced by the scanner
    assert.equal(match[2], rule.title, `catalog assigns ${match[1]} to "${match[2]}", canonical says "${rule.title}"`);
  }
  for (const rule of canonical) {
    if (catalog.includes(`| \`${rule.ruleId}\` |`)) {
      assert.ok(canonicalBySlug.has(rule.slug));
    }
  }
});

test('rule tables are in sync with the canonical table', () => {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts/sync-rules.mjs'), '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(run.status, 0, `Rule tables drifted. Run npm run rules:sync.\n${run.stdout}\n${run.stderr}`);
});
