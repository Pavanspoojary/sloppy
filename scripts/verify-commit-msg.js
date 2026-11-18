#!/usr/bin/env node
/**
 * Professional Commit Message Validator
 * Enforces Conventional Commits and professional wording standards across all version control operations.
 */

import * as fs from 'fs';
import * as path from 'path';

const msgPath = process.argv[2];
if (!msgPath) {
  console.error('[COMMIT-MSG ERROR] Path to commit message file must be provided.');
  process.exit(1);
}

const rawMessage = fs.readFileSync(path.resolve(process.cwd(), msgPath), 'utf-8').trim();
// Ignore automated merge commits or squash commits from git
if (rawMessage.startsWith('Merge ') || rawMessage.startsWith('Revert ') || rawMessage.startsWith('v[0-9]')) {
  process.exit(0);
}

const firstLine = rawMessage.split('\n')[0].trim();

// Conventional commit pattern: type(scope)?: description
const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9\-._/]+\))?:\s+([a-z0-9A-Z].+)$/;

if (!conventionalCommitRegex.test(firstLine)) {
  console.error('\n[COMMIT-MSG ERROR] Commit message does not adhere to Professional Conventional Commits format.');
  console.error(`Invalid header: "${firstLine}"`);
  console.error('\nExpected format:');
  console.error('  <type>(<scope>): <imperative descriptive summary>');
  console.error('\nValid types:');
  console.error('  feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
  console.error('\nExamples:');
  console.error('  feat(core): implement AST-based unearned animation detector');
  console.error('  fix(archetypes): settle indicator transitions to achieve Grade A+ rubric');
  console.error('  docs(agents): formalize zero-tolerance anti-slop guidelines\n');
  process.exit(1);
}

// Check for unpolished or unprofessional terms
const forbiddenTerms = [
  'stuff', 'bullshit', 'crap', 'garbage', 'fix shit', 'random', 'wip', 'temp', 'dummy', 'asdf', 'test commit', 'foo', 'bar'
];

const lowerFirstLine = firstLine.toLowerCase();
for (const term of forbiddenTerms) {
  if (lowerFirstLine.includes(term)) {
    console.error(`\n[COMMIT-MSG ERROR] Commit message contains informal or unprofessional phrasing: "${term}"`);
    console.error('Please rephrase with senior-level, technically precise terminology.\n');
    process.exit(1);
  }
}

// Check that subject line does not end with a period
if (firstLine.endsWith('.')) {
  console.error('\n[COMMIT-MSG ERROR] Subject line must not end with a trailing period.');
  process.exit(1);
}

console.log('[COMMIT-MSG VALIDATED] Commit message meets professional standards.');
process.exit(0);
