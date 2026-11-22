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
  LOOKS,
  searchAllComponents,
  searchPatterns,
  searchSynthesizedArchetypes,
  transformSlopToCraft
} from '@sloppy/core';
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

export const PRIMARY_TOOLS: Tool[] = [
  {
    name: 'sloppy_check',
    description: 'Audit source code or a file, evaluate its craft grade, and return a quality gate result with repair actions.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code to check' },
        path: { type: 'string', description: 'Optional source file path to check' },
        maxScore: { type: 'number', description: 'Maximum permitted slop score (default: 0)', default: 0 },
        failOn: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'], description: 'Minimum violation severity that fails the check (default: medium)', default: 'medium' },
        componentType: { type: 'string', enum: ['illustration', 'feature-card', 'hero', 'application', 'bento'], description: 'Rendered surface type; sets the visible word budget' },
        strict: { type: 'boolean', description: 'Enable strict restraint thresholds' },
        codeOnly: { type: 'boolean', description: 'Audit low-evidence TypeScript code rules only (COD-01..06)' },
        compact: { type: 'boolean', description: 'Return high-density token-optimized summary for coding agents' }
      }
    }
  },
  {
    name: 'sloppy_plan',
    description: 'Generate a structured, reviewable repair plan for sloppy code with dry-run diff preview and projected score improvements.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code content to generate repair plan for' },
        path: { type: 'string', description: 'Optional file path to read and plan repairs' },
        look: { type: 'string', description: 'Desired design token look (default: "linear")', default: 'linear' }
      }
    }
  },
  {
    name: 'sloppy_fix',
    description: 'Transform sloppy code into clean craft with verified unified diffs, syntax validation, and post-audit results.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code content to repair' },
        path: { type: 'string', description: 'Optional file path to read, transform, and optionally write back' },
        look: { type: 'string', description: 'Desired design look (e.g. "linear", "minimal", "dark-hero")', default: 'linear' },
        write: { type: 'boolean', description: 'Whether to write changes directly to disk when path is provided (default: false)', default: false }
      }
    }
  },
  {
    name: 'sloppy_catalog',
    description: 'Unified lookup across components, patterns, looks, and master archetypes in the anti-slop library.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or keyword' },
        type: { type: 'string', enum: ['all', 'components', 'patterns', 'looks', 'archetypes'], description: 'Filter category (default: "all")', default: 'all' },
        limit: { type: 'integer', description: 'Maximum results to return (default: 20)', default: 20 }
      }
    }
  },
  {
    name: 'sloppy_rules',
    description: 'Query authoritative anti-slop rules, guidelines, craft rubric definitions, and surface word budgets.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['craft', 'framing', 'motion', 'bento', 'word_budget', 'stack', 'all'],
          description: 'Design topic to query (default: "craft")',
          default: 'craft'
        }
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
      instructions: 'Use the closed loop: call sloppy_check before and after edits. Never claim a file is slop-free without a fresh check. Prefer sloppy_plan or sloppy_fix with write:false and review its diff before applying changes.'
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
        if (input.path) {
          const file = path.resolve(process.cwd(), input.path);
          if (!fs.existsSync(file)) return { content: [{ type: 'text', text: `File not found: ${file}` }], isError: true };
          if (code === undefined) code = fs.readFileSync(file, 'utf8');
        }
        if (code === undefined) return { content: [{ type: 'text', text: 'Provide code or path.' }], isError: true };

        const audit = auditCode(code, {
          filepath: input.path,
          componentType: input.componentType,
          strict: input.strict,
          codeOnly: input.codeOnly
        });
        const rubric = evaluateCraftRubric(code, { filepath: input.path, componentType: input.componentType, strict: input.strict });
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
                  grade: rubric.grade,
                  issues: audit.violations.map(v => `${v.tier}:${v.ruleId || v.type}@L${v.line}`)
                })
              }
            ]
          };
        }

        const nextActions = [
          ...new Set(
            audit.violations.flatMap(() =>
              input.path ? [`Run: sloppy fix ${input.path} --diff`, `Re-run: sloppy check ${input.path}`] : ['Review suggested repairs and re-run sloppy_check']
            )
          )
        ].slice(0, 5);

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
          const resolvedPath = path.resolve(process.cwd(), inputArgs.path);
          if (fs.existsSync(resolvedPath)) {
            code = fs.readFileSync(resolvedPath, 'utf8');
          } else {
            return { content: [{ type: 'text', text: `File not found: ${resolvedPath}` }], isError: true };
          }
        }
        if (!code) {
          return { content: [{ type: 'text', text: 'Provide code or path to plan repairs.' }], isError: true };
        }

        const plan = createRepairPlan(code, {
          look: (inputArgs.look as any) || 'linear',
          filepath: inputArgs.path
        });

        return { content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }] };
      }

      if (name === 'sloppy_fix') {
        const input = (args || {}) as { code?: string; path?: string; look?: string; write?: boolean };
        let code = input.code;
        let resolvedPath: string | undefined;
        if (input.path) {
          resolvedPath = path.resolve(process.cwd(), input.path);
          if (!fs.existsSync(resolvedPath)) return { content: [{ type: 'text', text: `File not found: ${resolvedPath}` }], isError: true };
          if (code === undefined) code = fs.readFileSync(resolvedPath, 'utf8');
        }
        if (code === undefined) return { content: [{ type: 'text', text: 'Provide code or path.' }], isError: true };

        const transformed = transformSlopToCraft(code, { look: (input.look as any) || 'linear', filepath: input.path });
        if (input.write === true && resolvedPath) fs.writeFileSync(resolvedPath, transformed.transformedCode, 'utf8');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                changed: transformed.transformedCode !== code,
                changesApplied: transformed.changesApplied,
                isValidSyntax: transformed.isValidSyntax,
                transformedCode: transformed.transformedCode,
                unifiedDiff: transformed.unifiedDiff,
                postAudit: transformed.postAudit
              })
            }
          ]
        };
      }

      if (name === 'sloppy_catalog') {
        const inputArgs = (args || {}) as { query?: string; type?: string; limit?: number };
        const q = inputArgs.query || '';
        const limit = inputArgs.limit || 20;
        const kind = inputArgs.type || 'all';

        const components = (kind === 'all' || kind === 'components') ? searchAllComponents(q, { limit }) : [];
        const patterns = (kind === 'all' || kind === 'patterns') ? searchPatterns(q, { limit }) : [];
        const archetypes = (kind === 'all' || kind === 'archetypes') ? searchSynthesizedArchetypes(q) : [];
        const looks = (kind === 'all' || kind === 'looks') ? Object.keys(LOOKS).filter((l) => !q || l.includes(q.toLowerCase())) : [];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: q,
                category: kind,
                counts: {
                  components: components.length,
                  patterns: patterns.length,
                  archetypes: archetypes.length,
                  looks: looks.length
                },
                components: components.slice(0, limit),
                patterns: patterns.slice(0, limit),
                archetypes,
                looks
              }, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_rules' || name === 'sloppy_get_rules') {
        const inputArgs = (args || {}) as { topic?: string };
        if (inputArgs.topic === 'stack') {
          const stackResult = detectProjectStack();
          return { content: [{ type: 'text', text: JSON.stringify(stackResult, null, 2) }] };
        }
        const rules = getRulesByTopic(inputArgs.topic || 'craft');
        return { content: [{ type: 'text', text: JSON.stringify(rules, null, 2) }] };
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
