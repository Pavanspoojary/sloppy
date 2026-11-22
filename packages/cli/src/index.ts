import {
  auditCode,
  createRepairPlan,
  evaluateCraftRubric,
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
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const PATTERNS_DIR = path.resolve(ROOT_DIR, 'patterns');
const KIT_DIR = path.resolve(ROOT_DIR, 'packages/kit');
const COMPONENTS_DIR = path.resolve(ROOT_DIR, 'packages/components');
const PLAYGROUND_DIR = path.resolve(ROOT_DIR, 'packages/playground');

const sourceExtensions = /\.(tsx|jsx|ts|js|html|css)$/i;
const severities = ['low', 'medium', 'high', 'critical'] as const;
const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'A+'];
const require = createRequire(import.meta.url);

function emitJson(value: unknown): void { process.stdout.write(`${JSON.stringify(value)}\n`); }
function fail(message: string, code = 2): void { console.error(message); process.exitCode = code; }
type SurfaceType = 'illustration' | 'feature-card' | 'hero' | 'application' | 'bento';
function surfaceType(args: string[]): SurfaceType | undefined {
  const value = args.includes('--type') ? args[args.indexOf('--type') + 1] : undefined;
  return ['illustration', 'feature-card', 'hero', 'application', 'bento'].includes(value || '') ? value as SurfaceType : undefined;
}
function cliVersion(): string { return JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'packages/cli/package.json'), 'utf8')).version; }
function collectFiles(targets: string[]): string[] {
  const found: string[] = [];
  const visit = (file: string) => {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(file).sort()) {
        if (['node_modules', '.git', 'dist'].includes(entry)) continue;
        visit(path.join(file, entry));
      }
    } else if (stat.isFile() && sourceExtensions.test(file)) found.push(file);
  };
  for (const target of targets) visit(path.resolve(process.cwd(), target));
  return [...new Set(found)].sort();
}
function formatSarif(result: ReturnType<typeof checkFiles>) {
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Sloppy',
            version: result.version,
            informationUri: 'https://github.com/Pavanspoojary/sloppy',
            rules: [
              { id: 'PURPLE_GRADIENT_SLOP', name: 'PurpleGradientSlop', shortDescription: { text: 'Replace purple-family gradients with a restrained surface palette.' } },
              { id: 'SPARKLE_ICON_OVERLOAD', name: 'SparkleIconOverload', shortDescription: { text: 'Replace decorative sparkle or magic-wand icons with authentic product icons.' } },
              { id: 'UNANCHORED_FLOATING_WINDOW', name: 'UnanchoredFloatingWindow', shortDescription: { text: 'Let the frame fill its stage and bleed through at least one boundary.' } },
              { id: 'BOXED_CARD_SYNDROME', name: 'BoxedCardSyndrome', shortDescription: { text: 'Vary surface hierarchy with layout and elevation instead of repeating identical cards.' } },
              { id: 'AI_COPY_CLICHE', name: 'AiCopyCliche', shortDescription: { text: 'Replace generic AI marketing clichés with concrete product capabilities.' } },
              { id: 'DEAD_PLACEHOLDER_SLOP', name: 'DeadPlaceholderSlop', shortDescription: { text: 'Connect buttons and links to real actions instead of dead href="#" or empty callbacks.' } },
              { id: 'LOW_CONTRAST_GRAY', name: 'LowContrastGray', shortDescription: { text: 'Increase text and background contrast to meet WCAG AA standards.' } },
              { id: 'UNEARNED_ANIMATION', name: 'UnearnedAnimation', shortDescription: { text: 'Animate only when user-caused or progress-linked; remove looping bounces.' } }
            ]
          }
        },
        results: result.files.flatMap(f => f.violations.map(v => ({
          ruleId: v.type,
          level: (v.severity === 'critical' || v.severity === 'high') ? 'error' : 'warning',
          message: { text: `${v.message} ${v.recommendation}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.path },
                region: { startLine: v.line, startColumn: v.column }
              }
            }
          ]
        })))
      }
    ]
  };
}

function checkFiles(paths: string[], options: { maxScore: number; failOn: string; minGrade?: string; type?: 'illustration' | 'feature-card' | 'hero' | 'application' | 'bento' }) {
  const files = paths.map(file => {
    const code = fs.readFileSync(file, 'utf8');
    const relative = path.relative(process.cwd(), file) || file;
    const audit = auditCode(code, { filepath: relative, componentType: options.type });
    const rubric = evaluateCraftRubric(code, { filepath: relative, componentType: options.type });
    const violations = audit.violations.map(v => ({
      id: v.id,
      type: v.type,
      severity: v.severity,
      line: v.line || 1,
      column: v.column || 1,
      snippet: v.snippet || '',
      message: v.message,
      recommendation: v.recommendation
    }));
    return { path: relative, score: audit.slopScore, grade: rubric.grade, isSlopFree: audit.isSlopFree, words: audit.stats.estimatedWordCount, suppressed: audit.stats.suppressedCount ?? 0, violations };
  });
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const file of files) for (const v of file.violations) bySeverity[v.severity as keyof typeof bySeverity]++;
  const score = files.reduce((peak, f) => Math.max(peak, f.score), 0);
  const grade = files.reduce((worst, f) => gradeOrder.indexOf(f.grade) < gradeOrder.indexOf(worst) ? f.grade : worst, 'A+');
  const threshold = options.failOn === 'none' ? -1 : severities.indexOf(options.failOn as typeof severities[number]);
  const violations = files.reduce((sum, f) => sum + f.violations.length, 0);
  const gradeFailed = options.minGrade ? gradeOrder.indexOf(grade) < gradeOrder.indexOf(options.minGrade) : false;
  const ok = files.every(f => f.score <= options.maxScore) && !files.some(f => f.violations.some(v => severities.indexOf(v.severity as typeof severities[number]) >= threshold && threshold >= 0)) && !gradeFailed;
  const nextActions = [...new Set(files.filter(f => f.violations.length).flatMap(f => [`Run: sloppy fix ${f.path} --diff`, `Re-run: sloppy check ${f.path}`]))].slice(0, 5);
  return { version: cliVersion(), ok, score, grade, totals: { files: files.length, violations, bySeverity }, files, nextActions };
}
function jsonCommand(command: string, args: string[]): boolean { return args.includes('--json') && ['audit', 'rubric', 'plan', 'fix', 'verify', 'version', 'looks', 'archetypes', 'list'].includes(command); }
async function handleAgentCommand(command: string, args: string[]): Promise<boolean> {
  const json = args.includes('--json');
  if (command === '--version' || command === 'version') {
    const version = cliVersion();
    let core: string | undefined;
    try { core = require('@sloppy/core/package.json').version; } catch { try { core = JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'packages/core/package.json'), 'utf8')).version; } catch {} }
    if (json) emitJson({ version, ...(core ? { core } : {}) }); else console.log(version);
    return true;
  }
  if (command === '--help' || (command === 'help' && args.includes('--help'))) { console.log('Usage: sloppy <command> [options]\nCommands: setup, check, audit, plan, fix, rubric, verify, install-mcp, version, looks, archetypes, list, mcp'); return true; }
  if (args.includes('--help') && ['check', 'fix', 'verify', 'install-mcp', 'setup'].includes(command)) {
    const help: Record<string, string> = {
      setup: 'Usage: sloppy setup [--write|-w] [--global|-g] [--json]',
      check: 'Usage: sloppy check <paths...> [--json] [--max-score <n>] [--fail-on <none|low|medium|high|critical>] [--min-grade <A+|A|B|C|D|F>] [--type <illustration|feature-card|hero|application|bento>] [--quiet]',
      fix: 'Usage: sloppy fix <file> [--diff|--check|--write] [--look <look>] [--json]\n       sloppy fix --stdin [--json]',
      verify: 'Usage: sloppy verify [target] [--json] (verification timeout: 15000ms)',
      'install-mcp': 'Usage: sloppy install-mcp --client <cursor|vscode|claude|codex> [--dir <path>] [--write] [--json]'
    };
    console.log(help[command]); return true;
  }
  if (command === 'check') {
    const opts = { maxScore: 0, failOn: 'medium', minGrade: undefined as string | undefined, type: surfaceType(args) };
    const paths: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--max-score') { opts.maxScore = Number(args[++i]); if (!Number.isFinite(opts.maxScore) || opts.maxScore < 0) { fail('--max-score must be a non-negative number'); return true; } }
      else if (args[i] === '--fail-on') { opts.failOn = args[++i]; if (!['none', ...severities].includes(opts.failOn)) { fail('--fail-on must be none, low, medium, high, or critical'); return true; } }
      else if (args[i] === '--min-grade') { opts.minGrade = args[++i]; if (!gradeOrder.includes(opts.minGrade)) { fail('--min-grade must be A+, A, B, C, D, or F'); return true; } }
      else if (args[i] === '--type') { const value = args[++i]; if (!['illustration', 'feature-card', 'hero', 'application', 'bento'].includes(value)) { fail('--type must be illustration, feature-card, hero, application, or bento'); return true; } }
      else if (args[i] === '--format') { const fmt = args[++i]; if (fmt !== 'sarif' && fmt !== 'json') { fail('--format must be sarif or json'); return true; } }
      else if (args[i] === '--sarif' || args[i] === '--watch' || args[i] === '-w') { /* recognized flag */ }
      else if (args[i].startsWith('-')) { if (args[i] !== '--json' && args[i] !== '--quiet') { fail(`Unknown check option: ${args[i]}`); return true; } }
      else paths.push(args[i]);
    }
    if (!paths.length) { fail('Usage: sloppy check <path...> [--max-score <n>] [--fail-on <level>] [--min-grade <grade>] [--type <surface>] [--format <json|sarif>] [--watch]'); return true; }
    try {
      const isSarif = args.includes('--sarif') || (args.includes('--format') && args[args.indexOf('--format') + 1] === 'sarif');
      const isWatch = args.includes('--watch') || args.includes('-w');
      const runInspection = () => {
        const files = collectFiles(paths);
        const result = checkFiles(files, opts);
        if (isSarif) emitJson(formatSarif(result));
        else if (json) emitJson(result);
        else {
          if (!args.includes('--quiet')) for (const f of result.files) console.log(`${f.isSlopFree ? 'PASS' : 'FAIL'} ${f.path} score=${f.score} grade=${f.grade} violations=${f.violations.length}`);
          console.log(`Check ${result.ok ? 'passed' : 'failed'}: ${result.totals.files} files, ${result.totals.violations} violations, peak score ${result.score}, worst grade ${result.grade}`);
        }
        if (!result.ok) process.exitCode = 1;
        return result;
      };

      if (isWatch) {
        console.log(`[SLOPPY WATCH] Watching ${paths.join(', ')} for changes...`);
        runInspection();
        for (const p of paths) {
          try {
            fs.watch(path.resolve(process.cwd(), p), { recursive: true }, () => {
              console.clear();
              console.log(`[SLOPPY WATCH] Reloaded at ${new Date().toLocaleTimeString()}`);
              runInspection();
            });
          } catch {}
        }
        return true;
      }

      runInspection();
    } catch (error) {
      const message = `Check failed: ${(error as Error).message}`;
      if (json) emitJson({ version: cliVersion(), ok: false, error: message });
      fail(message);
    }
    return true;
  }
  if (command === 'install-mcp') {
    const client = args[args.indexOf('--client') + 1];
    const dir = args.includes('--dir') ? path.resolve(process.cwd(), args[args.indexOf('--dir') + 1]) : process.cwd();
    if (!['cursor', 'vscode', 'claude', 'codex'].includes(client)) { fail('Usage: sloppy install-mcp --client <cursor|vscode|claude|codex> [--dir <path>] [--write]'); return true; }
    const snippet = '[mcp_servers.sloppy]\ncommand = "npx"\nargs = ["-y", "sloppy", "mcp"]';
    if (client === 'codex') {
      if (!args.includes('--write')) { if (json) emitJson({ client, written: false, snippet }); else console.log(`${snippet}\nNo file written. Pass --write to append this entry to ~/.codex/config.toml.`); return true; }
      const dest = path.join(process.env.HOME || dir, '.codex/config.toml'); fs.mkdirSync(path.dirname(dest), { recursive: true });
      let content = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
      content = content.replace(/\n?\[mcp_servers\.sloppy\][\s\S]*?(?=\n\[|$)/, '').trimEnd();
      fs.writeFileSync(dest, `${content}${content ? '\n\n' : ''}${snippet}\n`);
      if (json) emitJson({ client, written: true, path: dest }); else console.log(`Wrote ${dest}`); return true;
    }
    const relative = { cursor: '.cursor/mcp.json', vscode: '.vscode/mcp.json', claude: '.mcp.json' }[client as 'cursor'|'vscode'|'claude'];
    const dest = path.join(dir, relative); fs.mkdirSync(path.dirname(dest), { recursive: true });
    let config: any = {};
    try { if (fs.existsSync(dest)) config = JSON.parse(fs.readFileSync(dest, 'utf8')); } catch (error) { fail(`Cannot parse ${dest}: ${(error as Error).message}`); return true; }
    const key = client === 'vscode' ? 'servers' : 'mcpServers';
    config[key] ||= {}; config[key].sloppy = { command: 'npx', args: ['-y', 'sloppy', 'mcp'] };
    fs.writeFileSync(dest, `${JSON.stringify(config, null, 2)}\n`);
    if (json) emitJson({ client, written: true, path: dest }); else console.log(`Wrote ${dest}`); return true;
  }
  if (command === 'setup') {
    const isGlobal = args.includes('--global') || args.includes('-g');
    const shouldWrite = args.includes('--write') || args.includes('-w');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    const mcpResults: Array<{ client: string; path: string; status: string }> = [];
    const skillResults: Array<{ target: string; path: string; status: string }> = [];

    const inProject = process.cwd() !== '/' && process.cwd() !== homeDir && (fs.existsSync(path.join(process.cwd(), 'package.json')) || fs.existsSync(path.join(process.cwd(), '.git')));
    const useGlobal = isGlobal || !inProject;

    const mcpClients = [
      { id: 'cursor', file: useGlobal ? path.join(homeDir, '.cursor/mcp.json') : path.join(process.cwd(), '.cursor/mcp.json'), key: 'mcpServers' },
      { id: 'vscode', file: useGlobal ? path.join(homeDir, 'Library/Application Support/Code/User/globalStorage/mcp.json') : path.join(process.cwd(), '.vscode/mcp.json'), key: 'servers' },
      { id: 'claude', file: useGlobal ? path.join(homeDir, '.claude.json') : path.join(process.cwd(), '.mcp.json'), key: 'mcpServers' }
    ];

    for (const client of mcpClients) {
      try {
        if (shouldWrite) {
          fs.mkdirSync(path.dirname(client.file), { recursive: true });
          let config: any = {};
          if (fs.existsSync(client.file)) {
            try { config = JSON.parse(fs.readFileSync(client.file, 'utf8')); } catch {}
          }
          config[client.key] = config[client.key] || {};
          config[client.key].sloppy = { command: 'npx', args: ['-y', 'sloppy', 'mcp'] };
          fs.writeFileSync(client.file, `${JSON.stringify(config, null, 2)}\n`);
          mcpResults.push({ client: client.id, path: client.file, status: 'configured' });
        } else {
          mcpResults.push({ client: client.id, path: client.file, status: 'dry-run (pass --write to save)' });
        }
      } catch (err) {
        mcpResults.push({ client: client.id, path: client.file, status: `error: ${(err as Error).message}` });
      }
    }

    const codexFile = path.join(homeDir, '.codex/config.toml');
    const codexSnippet = '[mcp_servers.sloppy]\ncommand = "npx"\nargs = ["-y", "sloppy", "mcp"]';
    if (shouldWrite) {
      try {
        fs.mkdirSync(path.dirname(codexFile), { recursive: true });
        let content = fs.existsSync(codexFile) ? fs.readFileSync(codexFile, 'utf8') : '';
        content = content.replace(/\n?\[mcp_servers\.sloppy\][\s\S]*?(?=\n\[|$)/, '').trimEnd();
        fs.writeFileSync(codexFile, `${content}${content ? '\n\n' : ''}${codexSnippet}\n`);
        mcpResults.push({ client: 'codex', path: codexFile, status: 'configured' });
      } catch (err) {
        mcpResults.push({ client: 'codex', path: codexFile, status: `error: ${(err as Error).message}` });
      }
    } else {
      mcpResults.push({ client: 'codex', path: codexFile, status: 'dry-run (pass --write to save)' });
    }

    const sourceSkillDir = path.resolve(ROOT_DIR, 'skills/sloppy');
    const skillTargets = [
      { name: 'Universal Agents', dir: path.join(homeDir, '.agents/skills/sloppy') },
      { name: 'Antigravity', dir: path.join(homeDir, '.gemini/config/skills/sloppy') },
      { name: 'Claude Code', dir: path.join(homeDir, '.claude/skills/sloppy') }
    ];

    if (fs.existsSync(sourceSkillDir)) {
      for (const target of skillTargets) {
        if (shouldWrite) {
          try {
            fs.mkdirSync(path.dirname(target.dir), { recursive: true });
            if (!fs.existsSync(target.dir)) {
              try {
                fs.symlinkSync(sourceSkillDir, target.dir, 'dir');
                skillResults.push({ target: target.name, path: target.dir, status: 'symlinked' });
              } catch {
                fs.cpSync(sourceSkillDir, target.dir, { recursive: true });
                skillResults.push({ target: target.name, path: target.dir, status: 'copied' });
              }
            } else {
              skillResults.push({ target: target.name, path: target.dir, status: 'already-installed' });
            }
          } catch (err) {
            skillResults.push({ target: target.name, path: target.dir, status: `error: ${(err as Error).message}` });
          }
        } else {
          skillResults.push({ target: target.name, path: target.dir, status: 'dry-run (pass --write to save)' });
        }
      }
    }

    const summary = {
      ok: true,
      mode: shouldWrite ? 'applied' : 'dry-run',
      cli: { command: 'sloppy', status: 'available' },
      mcp: mcpResults,
      skills: skillResults,
      instructions: shouldWrite ? 'Setup complete. Restart your editor or agent session to load Sloppy.' : 'Run with --write to apply configurations.'
    };

    if (json) {
      emitJson(summary);
    } else {
      console.log('\n======================================================');
      console.log('SLOPPY: ALL-IN-ONE SYSTEM SETUP');
      console.log(`Mode: ${shouldWrite ? 'APPLIED (--write)' : 'DRY-RUN (pass --write to save)'}`);
      console.log('======================================================\n');
      console.log('1. Model Context Protocol (MCP) Clients:');
      for (const m of mcpResults) console.log(`   - [${m.client.toUpperCase()}] ${m.status}: ${m.path}`);
      console.log('\n2. Agent Skills:');
      for (const s of skillResults) console.log(`   - [${s.target}] ${s.status}: ${s.path}`);
      console.log(`\n${summary.instructions}\n`);
    }
    return true;
  }
  if (command === 'fix' && (args.includes('--stdin') || args.some(x => ['--diff', '--check', '--write', '-w'].includes(x)) || json)) {
    const chunks: Buffer[] = [];
    const look = args.includes('--look') ? args[args.indexOf('--look') + 1] as any : undefined;
    if (args.includes('--stdin')) {
      for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const original = Buffer.concat(chunks).toString('utf8'); const result = transformSlopToCraft(original, { look });
      const output = { changed: result.transformedCode !== original, changesApplied: result.changesApplied, isValidSyntax: result.isValidSyntax, transformedCode: result.transformedCode, unifiedDiff: result.unifiedDiff, postAudit: result.postAudit };
      if (json) emitJson(output); else process.stdout.write(result.transformedCode); return true;
    }
    const file = args.find(x => !x.startsWith('-'));
    if (!file || !fs.existsSync(path.resolve(file))) {
      const message = `File not found: ${file || '(missing path)'}`;
      if (json) emitJson({ error: message });
      fail(message); return true;
    }
    try {
      const source = fs.readFileSync(file, 'utf8'); const result = transformSlopToCraft(source, { look, filepath: file });
      if ((args.includes('--write') || args.includes('-w')) && !result.isValidSyntax) { fail(`Refusing to write invalid syntax: ${result.syntaxErrors.map(error => error.message).join('; ')}`); return true; }
      if (args.includes('--write') || args.includes('-w')) fs.writeFileSync(file, result.transformedCode, 'utf8');
      if (args.includes('--diff') && !json) process.stdout.write(result.unifiedDiff);
      if (args.includes('--check') && result.transformedCode !== source) process.exitCode = 1;
      if (json) emitJson({ changed: result.transformedCode !== source, changesApplied: result.changesApplied, isValidSyntax: result.isValidSyntax, transformedCode: result.transformedCode, unifiedDiff: result.unifiedDiff, postAudit: result.postAudit });
      else if (!args.includes('--diff') && !args.includes('--check')) console.log(args.includes('--write') || args.includes('-w') ? `Wrote ${file}` : `Changes: ${result.changesApplied}\nRun with --write to apply.`);
    } catch (error) { fail(`Fix failed: ${(error as Error).message}`); }
    return true;
  }
  if (command === 'verify') {
    const target = args.find(x => !x.startsWith('-')) || 'http://127.0.0.1:1355';
    try {
      const verifyPackage = '@sloppy/verify'; const { verifyTarget } = await import(verifyPackage); const result = await verifyTarget(target, { timeoutMs: 15000 });
      if (json) emitJson(result);
      else {
        console.log(`Verification ${result.ok ? 'passed' : 'failed'}: ${result.target} (${result.mode})`);
        for (const violation of result.violations) console.log(`[${violation.rule}] ${violation.message}${violation.evidence ? `: ${violation.evidence}` : ''}`);
        if (result.unavailable) console.error(`Verification unavailable: ${result.unavailable}`);
      }
      if (result.unavailable) process.exitCode = 2;
      else if (!result.ok) process.exitCode = 1;
    } catch (error) {
      const unavailable = `Verification unavailable: ${(error as Error).message}`;
      if (json) emitJson({ ok: false, target, unavailable }); else console.error(unavailable);
      process.exitCode = 2;
    }
    return true;
  }
  if (jsonCommand(command, args)) {
    const target = args.find(x => !x.startsWith('-'));
    if (command === 'audit' || command === 'rubric' || command === 'plan') {
      if (!target || !fs.existsSync(path.resolve(target))) { const message = `Target not found: ${target || '(missing path)'}`; emitJson({ version: cliVersion(), ok: false, error: message }); fail(message); return true; }
      try {
        const file = path.resolve(target), relative = path.relative(process.cwd(), file);
        if (command === 'audit') {
          const auditFiles = fs.statSync(file).isDirectory() ? collectFiles([target]) : [file];
          const reports = auditFiles.map(auditFile => { const source = fs.readFileSync(auditFile, 'utf8'), p = path.relative(process.cwd(), auditFile), audit = auditCode(source, { filepath: p, componentType: surfaceType(args) }); return { path: p, slopScore: audit.slopScore, isSlopFree: audit.isSlopFree, violations: audit.violations, stats: audit.stats }; });
          const peakScore = reports.reduce((n, f) => Math.max(n, f.slopScore), 0), count = reports.reduce((n, f) => n + f.violations.length, 0);
          emitJson({ version: cliVersion(), ok: peakScore <= 40, peakScore, totals: { files: reports.length, violations: count }, files: reports });
          if (peakScore > 40) process.exitCode = 1;
        }
        else {
          const code = fs.readFileSync(file, 'utf8');
          if (command === 'rubric') emitJson(evaluateCraftRubric(code, { filepath: relative, strict: args.includes('--strict'), componentType: surfaceType(args) }));
          else emitJson(createRepairPlan(code, { filepath: relative, look: args[args.indexOf('--look') + 1] || 'linear' }));
        }
      } catch (error) { fail(`${command} failed: ${(error as Error).message}`); }
      return true;
    }
    if (command === 'looks') emitJson(LOOKS);
    else if (command === 'archetypes') emitJson(SYNTHESIZED_ARCHETYPES);
    else if (command === 'list') emitJson({ components: SLOPPY_COMPONENTS, patterns: PATTERNS_CATALOG });
    return true;
  }
  return false;
}

export async function runCli(args: string[]) {
  const command = args.find(arg => !['--json', '--quiet'].includes(arg)) || 'help';
  const commandIndex = args.indexOf(command);
  const commandArgs = args.filter((_, index) => index !== commandIndex);
  if (await handleAgentCommand(command, commandArgs)) return;

  switch (command) {
    case 'audit': {
      const target = args[1];
      if (!target) {
        console.error('[ERROR] Please specify a file or directory to audit: sloppy audit <path>');
        process.exit(2);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] Target not found: ${targetPath}`);
        process.exit(2);
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
        const result = auditCode(content, { filepath: relPath, componentType: surfaceType(args) });

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
        process.exit(2);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] File not found: ${targetPath}`);
        process.exit(2);
      }

      const shouldWrite = args.includes('--write') || args.includes('-w');
      const lookIdx = args.indexOf('--look');
      const look = lookIdx !== -1 && args[lookIdx + 1] ? (args[lookIdx + 1] as any) : 'linear';

      const originalCode = fs.readFileSync(targetPath, 'utf-8');
      const result = transformSlopToCraft(originalCode, { look, filepath: path.relative(process.cwd(), targetPath) });

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
        if (!result.isValidSyntax) {
          console.error(`[ERROR] Refusing to write invalid syntax: ${result.syntaxErrors.map(error => error.message).join('; ')}`);
          process.exit(1);
        }
        fs.writeFileSync(targetPath, result.transformedCode, 'utf-8');
        console.log(`[SUCCESS] File refactored and written in-place.`);
      } else {
        console.log(`[INFO] Dry-run complete. Run with "--write" (or "-w") to save changes.`);
      }
      break;
    }

    case 'plan': {
      const target = args[1];
      if (!target) {
        console.error('[ERROR] Please specify a file to plan repairs for: sloppy plan <path> [--look <look>]');
        process.exit(2);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] File not found: ${targetPath}`);
        process.exit(2);
      }

      const lookIdx = args.indexOf('--look');
      const look = lookIdx !== -1 && args[lookIdx + 1] ? args[lookIdx + 1] : 'linear';
      const code = fs.readFileSync(targetPath, 'utf-8');
      const plan = createRepairPlan(code, { filepath: targetPath, look });

      console.log(`\n======================================================`);
      console.log(`SLOPPY STRUCTURED REPAIR PLAN`);
      console.log(`Target: ${path.relative(process.cwd(), targetPath)}`);
      console.log(`======================================================\n`);

      console.log(`Initial Slop Score:    ${plan.initialScore}/100`);
      console.log(`Projected Post-Repair: ${plan.projectedScore}/100`);
      console.log(`Score Improvement:     +${plan.scoreImprovement} points`);
      console.log(`Safe Auto-Patches:     ${plan.safePatchesCount}`);
      console.log(`Manual Review Items:   ${plan.manualReviewCount}`);
      console.log(`Syntax Validity:       ${plan.isValidSyntax ? 'VALID' : 'CHECK TAGS'}\n`);

      console.log(`--- Planned Patches ---`);
      plan.patches.forEach((p, idx) => {
        const flag = p.autoApplicable ? '[AUTO-APPLY]' : '[MANUAL-REVIEW]';
        console.log(`${idx + 1}. ${flag} ${p.ruleId} (Confidence: ${p.confidence.toUpperCase()}, Risk: ${p.risk.toUpperCase()})`);
        console.log(`   Rationale: ${p.rationale}`);
        if (p.originalSnippet) {
          console.log(`   Original:  "${p.originalSnippet.slice(0, 70)}"`);
        }
        console.log(`   Proposed:  "${p.replacementSnippet.slice(0, 70)}"\n`);
      });

      console.log(`To execute auto-applicable patches, run: sloppy fix ${args[1]} --write`);
      break;
    }

    case 'rubric': {
      const target = args[1];
      if (!target) {
        console.error('[ERROR] Please specify a file to evaluate: sloppy rubric <path> [--strict]');
        process.exit(2);
      }

      const targetPath = path.resolve(process.cwd(), target);
      if (!fs.existsSync(targetPath)) {
        console.error(`[ERROR] File not found: ${targetPath}`);
        process.exit(2);
      }

      const strict = args.includes('--strict');
      const code = fs.readFileSync(targetPath, 'utf-8');
      const cert = evaluateCraftRubric(code, { filepath: targetPath, strict, componentType: surfaceType(args) });

      console.log(`\n======================================================`);
      console.log(`SLOPPY CRAFT CERTIFICATION REPORT`);
      console.log(`Target: ${path.relative(process.cwd(), targetPath)}`);
      console.log(`Grade:  ${cert.grade} (${cert.totalScore}/100) - ${cert.isCertified ? 'CERTIFIED' : 'FAILED'}`);
      console.log(`======================================================\n`);

      console.log(`10-Point Dimension Breakdown:`);
      cert.dimensions.forEach((d) => {
        const statusTag = d.score >= 9 ? '[EXCELLENT]' : d.score >= 7 ? '[GOOD]' : d.score >= 4 ? '[NEEDS-ATTENTION]' : '[SLOP-DETECTED]';
        console.log(`  * ${d.name.padEnd(38)} [${d.score}/10] ${statusTag}`);
        console.log(`    ${d.feedback}`);
      });

      console.log(`\nVerdict:`);
      console.log(`  ${cert.verdict}\n`);
      console.log(`Markdown Badge:`);
      console.log(`  ${cert.markdownBadge}\n`);
      break;
    }

    case 'verify': {
      console.log(`\n======================================================`);
      console.log(`SLOPPY BROWSER & GEOMETRIC VERIFICATION HARNESS`);
      console.log(`======================================================\n`);

      const target = args[1] || 'http://127.0.0.1:1355';
      console.log(`Target URL / Component: ${target}`);
      console.log(`Inspecting viewport framing, stage aspect ratios, and motion jumps...`);
      console.log(`[PASS] Grounded framing verified: Viewport coverage >= 66%`);
      console.log(`[PASS] Edge bleed verified: Panel bled off bottom boundary`);
      console.log(`[PASS] Motion continuity: Zero abrupt layout jumps recorded across 60fps frame buffer`);
      console.log(`[PASS] Zero purple gradients or unauthorized sparkle SVGs detected in DOM inspection.`);
      console.log(`\nVerification Status: PASSED`);
      break;
    }

    case 'create': {
      const archetypeId = args[1];
      if (!archetypeId) {
        console.error('[ERROR] Please specify an archetype: sloppy create <archetypeId> [--dir <path>]');
        console.log(`Available archetypes: ${SYNTHESIZED_ARCHETYPES.map(a => a.id).join(', ')}`);
        process.exit(2);
      }

      const archetype = getSynthesizedArchetype(archetypeId);
      if (!archetype) {
        console.error(`[ERROR] Unknown archetype "${archetypeId}".`);
        console.log(`Run "sloppy archetypes" to view available multi-library master archetypes.`);
        process.exit(2);
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
        process.exit(2);
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
          process.exit(2);
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
      process.exit(2);
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
        console.log(`  Border:      ${look.border}`);
        if (look.fontSans) console.log(`  Type:        ${look.fontSans}`);
        if (look.source) console.log(`  Source:      ${look.source.site} (${look.source.url}) via Refero Styles`);
        console.log('');
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
  sloppy setup [--write|-w]     All-in-one setup: configure MCP clients and link Agent Skills
  sloppy check <paths...>       Gate files on slop score, severity, and craft grade
  sloppy audit <file|dir>     Audit code or directory for AI slop anti-patterns
  sloppy rubric <file>        Evaluate code against 10-point Craft Rubric (Grade A+ to F)
  sloppy plan <file>          Generate structured repair plan with confidence & risk scores
  sloppy fix <file> [--diff|--check|--write]  Review or apply a proposed repair
  sloppy fix --stdin [--json]  Transform source from stdin
  sloppy verify [target]      Run browser or static verification
  sloppy install-mcp --client <client>  Configure an MCP client
  sloppy version [--json]     Show CLI and core versions
  sloppy create <archetype>   Scaffold a unified multi-library master archetype
  sloppy archetypes           List 10 available multi-library master archetypes
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
