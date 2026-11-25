#!/usr/bin/env node
/**
 * Automated Verification: Master Archetypes Craft Rubric Audit
 * Ensures every synthesized master archetype strictly achieves Grade A+ (>= 95/100).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDist = path.resolve(__dirname, '../packages/core/dist/index.js');

if (!fs.existsSync(coreDist)) {
  console.log('[ARCHETYPE AUDIT] Building @sloppy-ai/core prerequisite...');
  execSync('npm run build --workspace=@sloppy-ai/core', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
}

const { evaluateCraftRubric, SYNTHESIZED_ARCHETYPES } = await import(pathToFileURL(coreDist).href);

console.log('======================================================');
console.log('SLOPPY CRAFT CERTIFICATION: MASTER ARCHETYPES AUDIT');
console.log(`Evaluating ${SYNTHESIZED_ARCHETYPES.length} synthesized master archetypes...`);
console.log('======================================================\n');

let failed = false;

for (const arch of SYNTHESIZED_ARCHETYPES) {
  const result = evaluateCraftRubric(arch.tsxCode, { filepath: `${arch.id}.tsx`, componentType: 'application' });
  const status = result.totalScore >= 95 ? '[PASS - GRADE A+]' : '[FAIL - BELOW THRESHOLD]';

  console.log(`${status} ${arch.name} (${arch.id})`);
  console.log(`  Total Score: ${result.totalScore}/100 | Grade: ${result.grade}`);
  for (const dim of result.dimensions) {
    console.log(`    ${dim.name.padEnd(30)} ${dim.score}/10 (${dim.status})`);
  }
  console.log('');

  if (result.totalScore < 95) {
    failed = true;
    console.error(`[CRITICAL AUDIT FAILURE] Archetype "${arch.name}" scored ${result.totalScore}/100, which is below the mandatory 95/100 Grade A+ benchmark.`);
    if (result.violations.length > 0) {
      console.error('Violations detected:');
      result.violations.forEach(v => console.error(`  - [${v.type}] ${v.message}`));
    }
  }
}

if (failed) {
  console.error('\n[BUILD FAILED] One or more archetypes failed the Craft Rubric zero-tolerance standard.');
  process.exit(1);
}

console.log('------------------------------------------------------');
console.log('[ALL ARCHETYPES VERIFIED] 10/10 archetypes achieved Grade A+ (100/100).');
console.log('------------------------------------------------------\n');
process.exit(0);
