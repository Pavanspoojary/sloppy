import {
  auditCode,
  getComponentById,
  getLook,
  getPatternById,
  getSynthesizedArchetype,
  LOOKS,
  PATTERNS_CATALOG,
  searchAllComponents,
  searchPatterns,
  searchSynthesizedArchetypes,
  SLOPPY_COMPONENTS,
  SLOPPY_LIBRARIES,
  SYNTHESIZED_ARCHETYPES,
  transformSlopToCraft
} from '@sloppy/core';
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
const COMPONENTS_DIR = path.resolve(ROOT_DIR, 'packages/components');
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

    case 'fix': {
      const target = args[1];
      if (!target) {
        console.error('[ERROR] Please specify a file to fix: sloppy fix <path> [--write] [--look <look>]');
        process.exit(1);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] File not found: ${targetPath}`);
        process.exit(1);
      }

      const shouldWrite = args.includes('--write') || args.includes('-w');
      const lookIdx = args.indexOf('--look');
      const look = lookIdx !== -1 && args[lookIdx + 1] ? (args[lookIdx + 1] as any) : 'linear';

      const originalCode = fs.readFileSync(targetPath, 'utf-8');
      const result = transformSlopToCraft(originalCode, { look });

      console.log(`\n======================================================`);
      console.log(`SLOPPY: SURGICAL AI SLOP AUTO-FIXER`);
      console.log(`Target: ${path.relative(process.cwd(), targetPath)}`);
      console.log(`======================================================\n`);

      console.log(`Slop Score: ${result.preAudit.slopScore}/100 -> ${result.postAudit.slopScore}/100`);
      console.log(`Changes Applied: ${result.changesApplied}\n`);

      if (result.transformations.length > 0) {
        console.log(`--- Applied Transformations ---`);
        result.transformations.forEach((t, i) => {
          console.log(`${i + 1}. [${t.type}] ${t.explanation}`);
          console.log(`   Before: "${t.original.slice(0, 60)}"`);
          console.log(`   After:  "${t.replacement.slice(0, 60)}"\n`);
        });
      }

      if (shouldWrite) {
        fs.writeFileSync(targetPath, result.transformedCode, 'utf-8');
        console.log(`[SUCCESS] File refactored and written in-place.`);
      } else {
        console.log(`[INFO] Dry-run complete. Run with "--write" (or "-w") to save changes.`);
      }
      break;
    }

    case 'create': {
      const archetypeId = args[1];
      if (!archetypeId) {
        console.error('[ERROR] Please specify an archetype: sloppy create <archetypeId> [--dir <path>]');
        console.log(`Available archetypes: ${SYNTHESIZED_ARCHETYPES.map(a => a.id).join(', ')}`);
        process.exit(1);
      }

      const archetype = getSynthesizedArchetype(archetypeId);
      if (!archetype) {
        console.error(`[ERROR] Unknown archetype "${archetypeId}".`);
        console.log(`Run "sloppy archetypes" to view available multi-library master archetypes.`);
        process.exit(1);
      }

      const dirIdx = args.indexOf('--dir') !== -1 ? args.indexOf('--dir') : args.indexOf('--dest');
      const customDir = dirIdx !== -1 && args[dirIdx + 1] ? args[dirIdx + 1] : 'src/components';
      const destDir = path.resolve(process.cwd(), customDir);
      fs.mkdirSync(destDir, { recursive: true });

      const destFile = path.resolve(destDir, `${archetype.id}.tsx`);
      fs.writeFileSync(destFile, archetype.tsxCode, 'utf-8');

      console.log(`\n======================================================`);
      console.log(`[SUCCESS] Created Master Archetype: ${archetype.name}`);
      console.log(`Destination: ${path.relative(process.cwd(), destFile)}`);
      console.log(`Libraries Unified: ${archetype.librariesUsed.join(', ')}`);
      console.log(`======================================================\n`);
      console.log(`Anti-Slop Craft Measures Enforced:`);
      for (const m of archetype.antiSlopMeasures) {
        console.log(`  - ${m}`);
      }
      console.log(`\nFocal Point: ${archetype.focalPoint}`);
      break;
    }

    case 'archetypes': {
      console.log(`\n======================================================`);
      console.log(`SLOPPY SYNTHESIZED MASTER ARCHETYPES (${SYNTHESIZED_ARCHETYPES.length})`);
      console.log(`Fusing the best of all 7 libraries without slop`);
      console.log(`======================================================\n`);

      for (const a of SYNTHESIZED_ARCHETYPES) {
        console.log(`* ${a.id.padEnd(28)} [${a.category.toUpperCase()}]`);
        console.log(`  Name:        ${a.name}`);
        console.log(`  Description: ${a.description}`);
        console.log(`  Libraries:   ${a.librariesUsed.join(' + ')}`);
        console.log(`  Focal Point: ${a.focalPoint}\n`);
      }
      console.log(`To scaffold any archetype, run: sloppy create <archetypeId>`);
      break;
    }

    case 'list': {
      const libFilter = args[1]?.toLowerCase();

      if (libFilter && SLOPPY_LIBRARIES[libFilter]) {
        console.log(`\n======================================================`);
        console.log(`SLOPPY COMPONENTS: ${SLOPPY_LIBRARIES[libFilter].name.toUpperCase()}`);
        console.log(`Author: ${SLOPPY_LIBRARIES[libFilter].author} | ${SLOPPY_LIBRARIES[libFilter].githubUrl}`);
        console.log(`======================================================\n`);

        const comps = SLOPPY_COMPONENTS.filter(c => c.library === libFilter);
        for (const c of comps) {
          console.log(`* ${c.id.padEnd(35)} [${c.category.toUpperCase()}] [${c.antiSlopRating.toUpperCase()}]`);
          console.log(`  Name:        ${c.name}`);
          console.log(`  Description: ${c.description}`);
          console.log(`  Guidance:    ${c.antiSlopGuidance}\n`);
        }
        return;
      }

      console.log(`\n======================================================`);
      console.log(`SLOPPY UNIFIED COMPONENT & PATTERN REGISTRY`);
      console.log(`7 Integrated Libraries: stageshow, shadcn, motion-primitives, magicui, react-bits, kokonutui, animate-ui`);
      console.log(`======================================================\n`);

      console.log(`--- Highlighted Curated Components ---`);
      for (const c of SLOPPY_COMPONENTS) {
        console.log(`* ${c.id.padEnd(35)} [${c.library.toUpperCase()}] [${c.category.toUpperCase()}]`);
        console.log(`  ${c.description}`);
        console.log(`  Guidance: ${c.antiSlopGuidance}\n`);
      }

      console.log(`--- Flagship Product Patterns (Stageshow) ---`);
      for (const p of PATTERNS_CATALOG.slice(0, 8)) {
        const motionTag = p.hasMotion ? '[MOTION]' : '[STILL]';
        console.log(`* stageshow/${p.id.padEnd(25)} ${motionTag.padEnd(9)} [${p.theme.toUpperCase()}] ${p.name}`);
        console.log(`  Focal Point: ${p.focalPoint}\n`);
      }

      console.log(`Tip: Filter by library with: sloppy list <stageshow|shadcn|motion-primitives|magicui|react-bits|kokonutui|animate-ui>`);
      break;
    }

    case 'libs': {
      console.log(`\n======================================================`);
      console.log(`SLOPPY INTEGRATED LIBRARIES (7 Major Ecosystems)`);
      console.log(`======================================================\n`);

      for (const lib of Object.values(SLOPPY_LIBRARIES)) {
        console.log(`* ${lib.name.toUpperCase()} (id: "${lib.id}")`);
        console.log(`  Author:         ${lib.author}`);
        console.log(`  Repository:     ${lib.githubUrl}`);
        console.log(`  Description:    ${lib.description}`);
        console.log(`  Anti-Slop Role: ${lib.antiSlopRole}`);
        console.log(`  Core Strengths:`);
        for (const s of lib.strengths) {
          console.log(`    - ${s}`);
        }
        console.log();
      }
      break;
    }

    case 'add': {
      const idOrPattern = args[1];
      if (!idOrPattern) {
        console.error('[ERROR] Please specify a component or pattern ID: sloppy add <library/component>');
        process.exit(1);
      }

      const cleanId = idOrPattern.trim();
      const entry = getComponentById(cleanId);
      const pattern = getPatternById(cleanId);

      const dirIdx = args.indexOf('--dir') !== -1 ? args.indexOf('--dir') : args.indexOf('--dest');
      const customDir = dirIdx !== -1 && args[dirIdx + 1] ? args[dirIdx + 1] : null;

      if (entry) {
        // Add component from packages/components/
        const srcFile = path.resolve(COMPONENTS_DIR, entry.sourcePath);
        if (!fs.existsSync(srcFile)) {
          console.error(`[ERROR] Component source not found: ${srcFile}`);
          process.exit(1);
        }

        const destDir = customDir 
          ? path.resolve(process.cwd(), customDir) 
          : path.resolve(process.cwd(), 'src/components', entry.library);
        fs.mkdirSync(destDir, { recursive: true });
        const destFile = path.resolve(destDir, path.basename(srcFile));

        fs.copyFileSync(srcFile, destFile);
        console.log(`\n[SUCCESS] Installed ${entry.id} -> ${path.relative(process.cwd(), destFile)}`);
        console.log(`\nAnti-Slop Design Guidance:`);
        console.log(`  ${entry.antiSlopGuidance}`);
        if (entry.dependencies.length > 0) {
          console.log(`\nRequired Dependencies:`);
          console.log(`  npm install ${entry.dependencies.join(' ')}`);
        }
        return;
      }

      if (pattern || fs.existsSync(path.resolve(PATTERNS_DIR, cleanId))) {
        // Add pattern from patterns/
        const patternSourceDir = path.resolve(PATTERNS_DIR, cleanId);
        const destDir = customDir
          ? path.resolve(process.cwd(), customDir, cleanId)
          : path.resolve(process.cwd(), 'src/components', cleanId);
        fs.mkdirSync(destDir, { recursive: true });

        const files = fs.readdirSync(patternSourceDir);
        for (const f of files) {
          const src = path.join(patternSourceDir, f);
          const dst = path.join(destDir, f);
          if (fs.statSync(src).isFile()) {
            fs.copyFileSync(src, dst);
          }
        }

        console.log(`\n[SUCCESS] Pattern "${cleanId}" installed to ${path.relative(process.cwd(), destDir)}/`);
        if (pattern) {
          console.log(`Focal Point: ${pattern.focalPoint}`);
        }
        return;
      }

      console.error(`[ERROR] Item "${cleanId}" not found in catalog or patterns.`);
      console.log(`Run "sloppy list" to search available components and patterns.`);
      process.exit(1);
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
Combining: stageshow, shadcn, motion-primitives, magicui, react-bits, kokonutui, animate-ui

Usage:
  sloppy audit <file|dir>     Audit code or directory for AI slop anti-patterns
  sloppy fix <file> [--write] Surgically refactor AI slop in-place into clean craft
  sloppy create <archetype>   Scaffold a unified multi-library master archetype
  sloppy archetypes           List available multi-library master archetypes
  sloppy list [library]       List all components or filter by library
  sloppy libs                 Show the 7 integrated UI libraries and their design roles
  sloppy add <componentId>    Install a component directly into your project
  sloppy init                 Scaffold the anti-slop React kit into ./src/kit/
  sloppy looks                View available design looks and token scales
  sloppy dev                  Launch visual playground on http://127.0.0.1:1355
  sloppy mcp                  Start the stdio Model Context Protocol server
  sloppy help                 Show this help screen
`);
      break;
    }
  }
}
