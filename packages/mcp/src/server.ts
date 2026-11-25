import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import {
  auditCode,
  createRepairPlan,
  detectProjectStack,
  evaluateCraftRubric,
  getRulesByTopic,
  CANONICAL_RULES,
  RULE_METADATA,
  LOOKS,
  searchAllComponents,
  searchMotionEcosystems,
  searchPatterns,
  searchSynthesizedArchetypes,
  transformSlopToCraft
} from '@sloppy-ai/core';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');

function getPackageVersion(): string {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')).version;
  } catch {
    try {
      return JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'packages/mcp/package.json'), 'utf8')).version;
    } catch {
      return '1.0.0';
    }
  }
}

function readTargetFile(targetPath: string): { resolved: string; code: string } | { resolved: string; error: string } {
  const resolved = path.resolve(process.cwd(), targetPath);
  try {
    return { resolved, code: fs.readFileSync(resolved, 'utf8') };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    return { resolved, error: code === 'ENOENT' ? `File not found: ${resolved}` : `Cannot read ${resolved}: ${(err as Error).message}` };
  }
}

function gradeFromScore(score: number): string {
  if (score === 0) return 'A+';
  if (score <= 10) return 'A';
  if (score <= 25) return 'B';
  if (score <= 45) return 'C';
  if (score <= 70) return 'D';
  return 'F';
}

export const PRIMARY_TOOLS: Tool[] = [
  {
    name: 'sloppy_check',
    description: 'Audit source code and return quality gate result.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code string' },
        path: { type: 'string', description: 'File path' },
        maxScore: { type: 'number', description: 'Max permitted slop score (default 0)', default: 0 },
        failOn: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'], description: 'Failure severity threshold (default medium)', default: 'medium' },
        componentType: { type: 'string', enum: ['illustration', 'feature-card', 'hero', 'application', 'bento'], description: 'Surface type for word budget' },
        strict: { type: 'boolean', description: 'Strict restraint mode' },
        codeOnly: { type: 'boolean', description: 'Audit TS/React rules only (COD-01..06)' },
        compact: { type: 'boolean', description: 'Token-minimal summary response' }
      }
    }
  },
  {
    name: 'sloppy_plan',
    description: 'Generate dry-run repair plan and unified diff.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code string' },
        path: { type: 'string', description: 'File path' },
        look: { type: 'string', description: 'Design look (default linear)', default: 'linear' }
      }
    }
  },
  {
    name: 'sloppy_fix',
    description: 'Apply safe craft transforms with wiring guard and syntax check.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code string' },
        path: { type: 'string', description: 'File path' },
        look: { type: 'string', description: 'Design look (default linear)', default: 'linear' },
        write: { type: 'boolean', description: 'Write changes to disk (default false)', default: false },
        includeCode: { type: 'boolean', description: 'Include full transformedCode when write=true' },
        only: {
          type: 'array',
          items: { type: ['string', 'number'] },
          description: 'Allowlist of finding indices or rule IDs'
        }
      }
    }
  },
  {
    name: 'sloppy_catalog',
    description: 'Search components, patterns, looks, archetypes, and motion libraries.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword' },
        type: { type: 'string', enum: ['all', 'components', 'patterns', 'looks', 'archetypes', 'motion'], description: 'Category (default all)', default: 'all' },
        detail: { type: 'string', enum: ['summary', 'full'], description: 'Payload detail level (default summary)', default: 'summary' },
        limit: { type: 'integer', description: 'Max items per category (default 10)', default: 10 }
      }
    }
  },
  {
    name: 'sloppy_rules',
    description: 'Query craft guidelines, stack detection, or canonical rule evidence.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['craft', 'framing', 'motion', 'bento', 'word_budget', 'stack', 'evidence', 'all'],
          description: 'Topic (default craft)',
          default: 'craft'
        },
        ruleId: { type: 'string', description: 'Optional single rule ID/slug filter' },
        tier: { type: 'string', enum: ['floor', 'reflex', 'finish'], description: 'Optional severity tier filter' },
        compact: { type: 'boolean', description: 'Return compact rule rows' }
      }
    }
  }
];

export function createSloppyServer() {
  const packageVersion = getPackageVersion();
  const server = new Server(
    {
      name: 'sloppy-mcp',
      version: packageVersion
    },
    {
      capabilities: { tools: {} },
      instructions:
        'Anti-Slop closed loop: call sloppy_check before and after edits. Never claim a file is slop-free without a fresh check. ' +
        'Ponytail Lazy UI Ladder: (1) UI YAGNI—never build speculative cards, search bars, filter pills, or modal wizards not requested; ' +
        '(2) Native platform first—reach for semantic <button>, <select>, <dialog>, <input> before hand-rolling div soup; ' +
        '(3) Single surface elevation—1 clean elevated surface beats nested cards inside cards; ' +
        '(4) Restrained motion—plain CSS transitions over unearned loops, always guard reduced motion; ' +
        '(5) Radical copy budget—max 3-7 words per header, zero cheerleading or fake stats. ' +
        'Prefer sloppy_plan or sloppy_fix with write:false and review diff before writing.'
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: PRIMARY_TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'sloppy_check') {
        const input = (args || {}) as {
          code?: string;
          path?: string;
          maxScore?: number;
          failOn?: 'none' | 'low' | 'medium' | 'high' | 'critical';
          componentType?: 'illustration' | 'feature-card' | 'hero' | 'application' | 'bento';
          strict?: boolean;
          codeOnly?: boolean;
          compact?: boolean;
        };
        let code = input.code;
        if (input.path && code === undefined) {
          const target = readTargetFile(input.path);
          if ('error' in target) return { content: [{ type: 'text', text: target.error }], isError: true };
          code = target.code;
        }
        if (code === undefined) return { content: [{ type: 'text', text: 'Provide code or path.' }], isError: true };

        const audit = auditCode(code, {
          filepath: input.path,
          componentType: input.componentType,
          strict: input.strict,
          codeOnly: input.codeOnly
        });
        const rank = ['low', 'medium', 'high', 'critical'];
        const threshold = input.failOn === 'none' ? -1 : rank.indexOf(input.failOn || 'medium');
        const maxScore = input.maxScore ?? 0;
        const ok = audit.slopScore <= maxScore && !audit.violations.some((v) => threshold >= 0 && rank.indexOf(v.severity) >= threshold);

        if (input.compact) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  ok,
                  score: audit.slopScore,
                  grade: gradeFromScore(audit.slopScore),
                  issues: audit.violations.map(v => `${v.tier}:${v.ruleId || v.type}@L${v.line}`)
                })
              }
            ]
          };
        }

        const rubric = evaluateCraftRubric(code, { filepath: input.path, componentType: input.componentType, strict: input.strict, audit });
        const nextActions = audit.violations.length > 0
          ? (input.path ? [`Run: sloppy fix ${input.path} --diff`, `Re-run: sloppy check ${input.path}`] : ['Review suggested repairs and re-run sloppy_check'])
          : [];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok,
                score: audit.slopScore,
                grade: rubric.grade,
                violations: audit.violations,
                nextActions
              })
            }
          ]
        };
      }

      if (name === 'sloppy_plan') {
        const inputArgs = (args || {}) as { code?: string; path?: string; look?: string };
        let code = inputArgs.code;
        if (!code && inputArgs.path) {
          const target = readTargetFile(inputArgs.path);
          if ('error' in target) return { content: [{ type: 'text', text: target.error }], isError: true };
          code = target.code;
        }
        if (!code) {
          return { content: [{ type: 'text', text: 'Provide code or path to plan repairs.' }], isError: true };
        }

        const plan = createRepairPlan(code, {
          look: (inputArgs.look as any) || 'linear',
          filepath: inputArgs.path
        });

        return { content: [{ type: 'text', text: JSON.stringify(plan) }] };
      }

      if (name === 'sloppy_fix') {
        const input = (args || {}) as { code?: string; path?: string; look?: string; write?: boolean; includeCode?: boolean; only?: (string | number)[] };
        let code = input.code;
        let resolvedPath: string | undefined;
        if (input.path) {
          resolvedPath = path.resolve(process.cwd(), input.path);
          if (code === undefined) {
            const target = readTargetFile(input.path);
            if ('error' in target) return { content: [{ type: 'text', text: target.error }], isError: true };
            code = target.code;
          }
        }
        if (code === undefined) return { content: [{ type: 'text', text: 'Provide code or path.' }], isError: true };

        const only = Array.isArray(input.only) ? input.only : undefined;
        const transformed = transformSlopToCraft(code, { look: (input.look as any) || 'linear', filepath: input.path, only });
        const wiringGuard = transformed.wiringGuard;
        let written = false;
        if (input.write === true && resolvedPath) {
          if (!transformed.isValidSyntax) {
            return { content: [{ type: 'text', text: `Refusing to write invalid syntax: ${transformed.syntaxErrors.map((e) => e.message).join('; ')}` }], isError: true };
          }
          if (wiringGuard && !wiringGuard.passed) {
            return { content: [{ type: 'text', text: `Refusing to write: the wiring guard detected dropped handlers or links. ${wiringGuard.details}` }], isError: true };
          }
          fs.writeFileSync(resolvedPath, transformed.transformedCode, 'utf8');
          written = true;
        }

        const includeCode = input.includeCode ?? !written;
        const fixPayload: {
          changed: boolean;
          written: boolean;
          changesApplied: number;
          isValidSyntax: boolean;
          transformedCode?: string;
          unifiedDiff: string;
          postAudit: unknown;
          only: (string | number)[] | null;
          wiringGuard: unknown;
          manualReviewItems: string[];
        } = {
          changed: transformed.transformedCode !== code,
          written,
          changesApplied: transformed.changesApplied,
          isValidSyntax: transformed.isValidSyntax,
          unifiedDiff: transformed.unifiedDiff,
          postAudit: written
            ? { slopScore: transformed.postAudit.slopScore, violations: transformed.postAudit.stats.totalViolations }
            : transformed.postAudit,
          only: only ?? null,
          wiringGuard,
          manualReviewItems: transformed.manualReviewItems
        };
        if (includeCode) fixPayload.transformedCode = transformed.transformedCode;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(fixPayload)
            }
          ]
        };
      }

      if (name === 'sloppy_catalog') {
        const inputArgs = (args || {}) as { query?: string; type?: string; detail?: string; limit?: number };
        const q = inputArgs.query || '';
        const limit = inputArgs.limit || 10;
        const kind = inputArgs.type || 'all';
        const full = inputArgs.detail === 'full';

        const components = (kind === 'all' || kind === 'components') ? searchAllComponents(q, { limit }).slice(0, limit) : [];
        const patterns = (kind === 'all' || kind === 'patterns') ? searchPatterns(q, { limit }).slice(0, limit) : [];
        const archetypes = (kind === 'all' || kind === 'archetypes') ? searchSynthesizedArchetypes(q).slice(0, limit) : [];
        const looks = (kind === 'all' || kind === 'looks') ? Object.keys(LOOKS).filter((l) => !q || l.includes(q.toLowerCase())).slice(0, limit) : [];
        const motionEcosystems = (kind === 'all' || kind === 'motion') ? searchMotionEcosystems(q).slice(0, limit) : [];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: q,
                category: kind,
                detail: full ? 'full' : 'summary',
                counts: {
                  components: components.length,
                  patterns: patterns.length,
                  archetypes: archetypes.length,
                  looks: looks.length,
                  motionEcosystems: motionEcosystems.length
                },
                components: full ? components : components.map(c => ({ id: c.id, name: c.name, library: c.library, category: c.category })),
                patterns: full ? patterns : patterns.map(p => ({ id: p.id, name: p.name, category: p.category, focalPoint: p.focalPoint })),
                archetypes: full ? archetypes : archetypes.map(a => ({ id: a.id, name: a.name, category: a.category })),
                looks,
                motionEcosystems: full ? motionEcosystems : motionEcosystems.map(m => ({ id: m.id, name: m.name, packages: m.packages, category: m.category, license: m.license }))
              })
            }
          ]
        };
      }

      if (name === 'sloppy_rules' || name === 'sloppy_get_rules') {
        const inputArgs = (args || {}) as { topic?: string; ruleId?: string; tier?: string; compact?: boolean };
        if (inputArgs.topic === 'stack') {
          return { content: [{ type: 'text', text: JSON.stringify(detectProjectStack()) }] };
        }
        if (inputArgs.topic === 'all' || inputArgs.topic === 'evidence') {
          const filterId = inputArgs.ruleId?.trim().toUpperCase();
          const filterTier = inputArgs.tier?.trim().toLowerCase();
          const canonical = Object.entries(CANONICAL_RULES)
            .filter(([slug, rule]) =>
              (!filterId || rule.ruleId.toUpperCase() === filterId || slug.toUpperCase() === filterId) &&
              (!filterTier || rule.tier === filterTier)
            )
            .map(([slug, rule]) =>
              inputArgs.compact
                ? { ruleId: rule.ruleId, slug, tier: rule.tier, mode: rule.mode, severity: rule.defaultSeverity, title: rule.title }
                : { slug, ...rule, ...(RULE_METADATA[slug as keyof typeof RULE_METADATA] || {}) }
            );
          return { content: [{ type: 'text', text: JSON.stringify({ version: packageVersion, rules: canonical }) }] };
        }
        const rules = getRulesByTopic(inputArgs.topic || 'craft');
        return { content: [{ type: 'text', text: JSON.stringify(rules) }] };
      }

      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}. Available tools: sloppy_check, sloppy_plan, sloppy_fix, sloppy_catalog, sloppy_rules.` }],
        isError: true
      };
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Error executing ${name}: ${error?.message || String(error)}` }],
        isError: true
      };
    }
  });

  return server;
}

export async function runServer() {
  const server = createSloppyServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const version = getPackageVersion();
  process.stderr.write(`Sloppy MCP server v${version} running on stdio (5 primary verbs).\n`);
}
