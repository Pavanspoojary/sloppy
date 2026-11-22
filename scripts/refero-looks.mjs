#!/usr/bin/env node
// Bridges the Refero Styles MCP cache into Sloppy's look registry.
//
// The Refero MCP server (maintained by Antigravity) stores each fetched
// DESIGN.md in a local SQLite cache. This script reads that cache directly so a
// look can be re-derived without network access or a running MCP transport.
//
// Usage:
//   node scripts/refero-looks.mjs list
//   node scripts/refero-looks.mjs "Grafana Labs"
//   node scripts/refero-looks.mjs "Grafana Labs" --json
//
// Requires Node 22.5+ for node:sqlite. Older runtimes receive a clear message.

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const CACHE_DIR = process.env.REFERO_CACHE_DIR || path.join(os.homedir(), '.refero-styles');
const DB_PATH = path.join(CACHE_DIR, 'refero.db');

function fail(message) {
  console.error(message);
  process.exit(2);
}

async function openDatabase() {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    fail('node:sqlite is unavailable. Run this script on Node 22.5 or newer.');
  }
  if (!fs.existsSync(DB_PATH)) {
    fail(`Refero cache not found at ${DB_PATH}. Run the Refero MCP server once to populate it.`);
  }
  return new DatabaseSync(DB_PATH, { readOnly: true });
}

function parseColors(designMd) {
  const section = designMd.match(/## Tokens — Colors\s*\n([\s\S]*?)(?=\n## )/);
  if (!section) return [];
  return section[1]
    .split('\n')
    .filter((line) => line.includes('|') && !line.includes('---') && !line.includes('Name |'))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
      return { name: cells[0], value: cells[1]?.replace(/`/g, ''), token: cells[2]?.replace(/`/g, ''), role: cells[3] || '' };
    })
    .filter((color) => color.value?.startsWith('#'));
}

function parseFonts(cssVariables) {
  const families = cssVariables.match(/--font-[a-z0-9-]+:[^;]+;/gi) || [];
  return families
    .filter((line) => !line.includes('--font-weight'))
    .map((line) => line.replace(/;$/, '').trim());
}

function styleReport(row) {
  return {
    site: row.site_name,
    url: row.site_url,
    styleId: row.id,
    theme: row.color_scheme,
    colors: parseColors(row.design_md),
    fonts: parseFonts(row.css_variables || ''),
    tailwindTheme: row.tailwind_theme || '',
    cssVariables: row.css_variables || ''
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--json');
  const asJson = process.argv.includes('--json');
  const db = await openDatabase();

  if (args.length === 0 || args[0] === 'list') {
    const rows = db
      .prepare("select site_name, color_scheme from styles where site_name is not null and site_name != '' order by site_name")
      .all();
    if (asJson) {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }
    for (const row of rows) console.log(`${row.site_name} [${row.color_scheme}]`);
    console.log(`\n${rows.length} cached design systems. Pass a site name for full tokens.`);
    return;
  }

  const query = args.join(' ');
  const row =
    db.prepare('select * from styles where site_name = ?').get(query) ||
    db.prepare("select * from styles where site_name like ? and design_md is not null limit 1").get(`%${query}%`);

  if (!row) fail(`No cached design system matches "${query}". Run list to see the cache.`);

  const report = styleReport(row);
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`${report.site} [${report.theme}] — ${report.url}`);
  console.log(`Refero style id: ${report.styleId}\n`);
  for (const color of report.colors) {
    console.log(`  ${color.name}: ${color.value} — ${color.role}`);
  }
  if (report.fonts.length) {
    console.log('\n  Typography:');
    for (const font of report.fonts) console.log(`    ${font}`);
  }
}

main().catch((error) => fail(error?.message || String(error)));
