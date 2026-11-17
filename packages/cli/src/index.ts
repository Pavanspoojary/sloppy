import { auditCode, getLook, getPatternById, LOOKS, PATTERNS_CATALOG, searchPatterns } from '@sloppy/core';
import { runServer } from '@sloppy/mcp';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const PATTERNS_DIR = path.resolve(ROOT_DIR, 'patterns');
const KIT_DIR = path.resolve(ROOT_DIR, 'packages/kit');
const PLAYGROUND_DIR = path.resolve(ROOT_DIR, 'packages/playground');

export async function runCli(args: string[]) {
  const command = args[0] || 'help';

  switch (command) {
    case 'audit': {
      const target = args[1];
      if (!target) {
        console.error('[ERROR] Please specify a file or directory to audit: sloppy audit <path>');
        process.exit(1);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] Target not found: ${targetPath}`);
        process.exit(1);
      }

      const stat = fs.statSync(targetPath);
      const filesToAudit: string[] = [];

      if (stat.isFile()) {
        filesToAudit.push(targetPath);
      } else if (stat.isDirectory()) {
        const findFiles = (dir: string) => {
          const entries = fs.readdirSync(dir);
          for (const entry of entries) {
            if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
            const full = path.join(dir, entry);
            if (fs.statSync(full).isDirectory()) {
              findFiles(full);
            } else if (/\.(tsx|jsx|ts|js|html|css)$/.test(entry)) {
              filesToAudit.push(full);
            }
          }
        };
        findFiles(targetPath);
      }

      console.log(`\n======================================================`);
      console.log(`SLOPPY: AI SLOP AUDIT REPORT`);
      console.log(`Auditing ${filesToAudit.length} file(s)...`);
      console.log(`======================================================\n`);

      let totalViolations = 0;
      let maxScore = 0;

      for (const file of filesToAudit) {
        const content = fs.readFileSync(file, 'utf8');
        const relPath = path.relative(process.cwd(), file);
        const result = auditCode(content, { filepath: relPath });

        totalViolations += result.violations.length;
        maxScore = Math.max(maxScore, result.slopScore);

        if (result.violations.length > 0) {
          const statusBadge = result.slopScore >= 50 ? '[SEVERE SLOP]' : '[MODERATE SLOP]';
          console.log(`--- ${relPath} ${statusBadge} (Score: ${result.slopScore}/100) ---`);
          for (const v of result.violations) {
            const loc = v.line ? `Line ${v.line}: ` : '';
            console.log(`  [${v.severity.toUpperCase()}] ${v.type}`);
            console.log(`    ${loc}${v.message}`);
            if (v.snippet) {
              console.log(`    Code: "${v.snippet.slice(0, 80)}"`);
            }
            console.log(`    Fix:  ${v.recommendation}\n`);
          }
        } else {
          console.log(`[PASS] ${relPath} - Zero AI slop detected (Score: 0/100)`);
        }
      }

      console.log(`------------------------------------------------------`);
      console.log(`Audit Summary:`);
      console.log(`  Files scanned:    ${filesToAudit.length}`);
      console.log(`  Total issues:     ${totalViolations}`);
      console.log(`  Peak slop score:  ${maxScore}/100`);
      console.log(`------------------------------------------------------\n`);

      if (maxScore > 40) {
        process.exitCode = 1;
      }
      break;
    }

    case 'list': {
      console.log(`\n======================================================`);
      console.log(`SLOPPY PATTERN LIBRARY (${PATTERNS_CATALOG.length} Patterns)`);
      console.log(`======================================================\n`);

      for (const p of PATTERNS_CATALOG) {
        const motionTag = p.hasMotion ? '[MOTION]' : '[STILL]';
        console.log(`* ${p.id.padEnd(18)} ${motionTag.padEnd(9)} [${p.theme.toUpperCase()}] ${p.name}`);
        console.log(`  Summary:     ${p.summary}`);
        console.log(`  Focal Point: ${p.focalPoint}`);
        console.log(`  Tags:        ${p.tags.join(', ')}\n`);
      }
      break;
    }

    case 'add': {
      const patternId = args[1];
      if (!patternId) {
        console.error('[ERROR] Please specify a pattern ID: sloppy add <pattern-id>');
        process.exit(1);
      }

      const pattern = getPatternById(patternId);
      const patternSourceDir = path.resolve(PATTERNS_DIR, patternId);

      if (!fs.existsSync(patternSourceDir)) {
        console.error(`[ERROR] Pattern "${patternId}" not found in library.`);
        process.exit(1);
      }

      const destDir = path.resolve(process.cwd(), 'src/components', patternId);
      fs.mkdirSync(destDir, { recursive: true });

      const files = fs.readdirSync(patternSourceDir);
      for (const f of files) {
        const src = path.join(patternSourceDir, f);
        const dst = path.join(destDir, f);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dst);
        }
      }

      console.log(`[SUCCESS] Pattern "${patternId}" copied to ./src/components/${patternId}/`);
      if (pattern) {
        console.log(`Focal Point: ${pattern.focalPoint}`);
      }
      break;
    }

    case 'init': {
      const destDir = path.resolve(process.cwd(), 'src/kit');
      fs.mkdirSync(destDir, { recursive: true });

      const copyRecursive = (src: string, dst: string) => {
        fs.mkdirSync(dst, { recursive: true });
        for (const item of fs.readdirSync(src)) {
          if (item === 'node_modules' || item === 'dist' || item === 'package.json' || item === 'tsconfig.json') continue;
          const s = path.join(src, item);
          const d = path.join(dst, item);
          if (fs.statSync(s).isDirectory()) {
            copyRecursive(s, d);
          } else {
            fs.copyFileSync(s, d);
          }
        }
      };

      copyRecursive(KIT_DIR, destDir);
      console.log(`[SUCCESS] Sloppy Anti-Slop React Kit installed into ./src/kit/`);
      console.log(`Import components with: import { Stage, Window, Act, Bar } from './kit'`);
      break;
    }

    case 'looks': {
      console.log(`\n======================================================`);
      console.log(`SLOPPY DESIGN LOOKS & SURFACE TOKENS`);
      console.log(`======================================================\n`);

      for (const [key, look] of Object.entries(LOOKS)) {
        console.log(`* Look: ${look.name.toUpperCase()} [${look.theme.toUpperCase()}]`);
        console.log(`  Description: ${look.description}`);
        console.log(`  Accent:      ${look.accent}`);
        console.log(`  Background:  ${look.background}`);
        console.log(`  Surfaces:    1: ${look.surface1} | 2: ${look.surface2} | 3: ${look.surface3}`);
        console.log(`  Border:      ${look.border}\n`);
      }
      break;
    }

    case 'dev': {
      console.log(`Starting Sloppy Visual Playground on http://127.0.0.1:1355 ...`);
      const child = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', '1355'], {
        cwd: PLAYGROUND_DIR,
        stdio: 'inherit',
        shell: true
      });
      child.on('exit', (code) => {
        process.exit(code || 0);
      });
      break;
    }

    case 'mcp': {
      await runServer();
      break;
    }

    case 'help':
    default: {
      console.log(`
SLOPPY: The AI Slop UI Fixer (MCP + Kit + Skill Engine)

Usage:
  sloppy audit <file|dir>    Audit code or directory for AI slop anti-patterns
  sloppy list                List all 73+ curated patterns in library
  sloppy add <patternId>     Copy a pattern directly into your project
  sloppy init                Scaffold the anti-slop React kit into ./src/kit/
  sloppy looks               View available design looks and token scales
  sloppy dev                 Launch visual playground on http://127.0.0.1:1355
  sloppy mcp                 Start the stdio Model Context Protocol server
  sloppy help                Show this help screen
`);
      break;
    }
  }
}
