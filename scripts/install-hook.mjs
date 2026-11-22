#!/usr/bin/env node
/**
 * Sloppy Lightweight Edit-Time Floor Hook Installer
 * Installs real-time Floor check hooks for Cursor, Claude Code, and Git.
 * Runs sub-30ms checks to block dead links, fake metrics, and contrast bugs.
 */

import * as fs from 'fs';
import * as path from 'path';

const cwd = process.cwd();
const args = process.argv.slice(2);

const targetCursor = args.includes('--cursor') || (!args.includes('--claude') && !args.includes('--git'));
const targetClaude = args.includes('--claude') || (!args.includes('--cursor') && !args.includes('--git'));
const targetGit = args.includes('--git') || (!args.includes('--cursor') && !args.includes('--claude'));

console.log('======================================================');
console.log('SLOPPY: INSTALL EDIT-TIME FLOOR HOOKS');
console.log('======================================================\n');

// 1. Git Pre-Commit Floor Hook
if (targetGit) {
  try {
    const gitHooksDir = path.resolve(cwd, '.githooks');
    if (!fs.existsSync(gitHooksDir)) fs.mkdirSync(gitHooksDir, { recursive: true });

    const preCommitPath = path.resolve(gitHooksDir, 'pre-commit');
    const hookScript = `#!/bin/sh
# Sloppy Fast Edit-Time Floor Hook
echo "[SLOPPY HOOK] Running edit-time Floor checks on staged files..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(tsx|jsx|ts|js|html|css)$')

if [ -n "$STAGED_FILES" ]; then
  for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
      npx sloppy audit "$FILE" --floor-only --strict
      if [ $? -ne 0 ]; then
        echo "[SLOPPY HOOK FAILED] Floor gate blocked commit on $FILE."
        exit 1
      fi
    fi
  done
fi
`;
    fs.writeFileSync(preCommitPath, hookScript, { mode: 0o755 });
    console.log('[INSTALLED] Git pre-commit Floor hook -> .githooks/pre-commit');
  } catch (err) {
    console.error(`[ERROR] Failed to install git hook: ${err?.message || err}`);
  }
}

// 2. Cursor IDE Hook
if (targetCursor) {
  try {
    const cursorDir = path.resolve(cwd, '.cursor/hooks');
    if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });

    const cursorHookPath = path.resolve(cursorDir, 'on-save.sh');
    const cursorScript = `#!/bin/sh
# Cursor real-time Floor check hook
FILE="$1"
if [ -f "$FILE" ]; then
  npx sloppy audit "$FILE" --floor-only
fi
`;
    fs.writeFileSync(cursorHookPath, cursorScript, { mode: 0o755 });
    console.log('[INSTALLED] Cursor on-save Floor hook -> .cursor/hooks/on-save.sh');
  } catch (err) {
    console.error(`[ERROR] Failed to install Cursor hook: ${err?.message || err}`);
  }
}

// 3. Claude Code Hook
if (targetClaude) {
  try {
    const claudeDir = path.resolve(cwd, '.claude/hooks');
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });

    const claudeHookPath = path.resolve(claudeDir, 'post-edit.sh');
    const claudeScript = `#!/bin/sh
# Claude Code post-edit Floor check hook
FILE="$1"
if [ -f "$FILE" ]; then
  npx sloppy audit "$FILE" --floor-only --strict
fi
`;
    fs.writeFileSync(claudeHookPath, claudeScript, { mode: 0o755 });
    console.log('[INSTALLED] Claude Code post-edit Floor hook -> .claude/hooks/post-edit.sh');
  } catch (err) {
    console.error(`[ERROR] Failed to install Claude hook: ${err?.message || err}`);
  }
}

console.log('\n[HOOKS READY] Edit-time Floor verification active.\n');
