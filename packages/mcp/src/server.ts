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
  evaluateCraftRubric,
  getComponentById,
  getLook,
  getPatternById,
  getRulesByTopic,
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
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const PATTERNS_DIR = path.resolve(ROOT_DIR, 'patterns');
const KIT_DIR = path.resolve(ROOT_DIR, 'packages/kit');
const COMPONENTS_DIR = path.resolve(ROOT_DIR, 'packages/components');

export function createSloppyServer() {
  const packageVersion = JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'packages/mcp/package.json'), 'utf8')).version;
  const server = new Server(
    {
      name: 'sloppy-mcp',
      version: packageVersion
    },
    {
      capabilities: { tools: {} },
      instructions: 'Use the closed loop: call sloppy_check before and after edits. Never claim a file is slop-free without a fresh check. Prefer sloppy_fix with write:false and review its diff before applying changes.'
    }
  );

  const tools: Tool[] = [
    {
      name: 'sloppy_check',
      description: 'Audit source code or a file, evaluate its craft grade, and return a gate result with repair actions.',
      inputSchema: { type: 'object', properties: {
        code: { type: 'string', description: 'Source code to check' },
        path: { type: 'string', description: 'Optional source file path to check' },
        maxScore: { type: 'number', description: 'Maximum permitted slop score (default: 0)', default: 0 },
        failOn: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'], description: 'Minimum violation severity that fails the check (default: medium)', default: 'medium' },
        componentType: { type: 'string', enum: ['illustration', 'feature-card', 'hero', 'application', 'bento'], description: 'Rendered surface type; sets the visible word budget' },
        strict: { type: 'boolean', description: 'Enable strict restraint thresholds' }
      } }
    },
    {
      name: 'sloppy_fix',
      description: 'Propose a code transformation and unified diff. Writing to a file requires write:true.',
      inputSchema: { type: 'object', properties: {
        code: { type: 'string', description: 'Source code to transform' },
        path: { type: 'string', description: 'Optional source file path to read; it is only modified when write:true' },
        look: { type: 'string', description: 'Target visual look (default: linear)' },
        write: { type: 'boolean', description: 'Write transformed source to path only when explicitly true (default: false)', default: false }
      } }
    },
    {
      name: 'sloppy_audit_code',
      description: 'Scans JSX, TSX, HTML, or CSS code for classic AI slop anti-patterns (purple gradients, sparkle icon overload, boxed card syndrome, floating ungrounded windows, word budget violations, unearned animations) and returns a severity score (0-100) with precise remediation instructions.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Source code content to inspect for AI slop'
          },
          path: {
            type: 'string',
            description: 'Optional file path to read and audit directly from disk'
          },
          strict: {
            type: 'boolean',
            description: 'Enable strict restraint and word budget auditing'
          }
        }
      }
    },
    {
      name: 'sloppy_search_components',
      description: `Search across ${SLOPPY_COMPONENTS.length} curated UI components from all 7 major ecosystems by natural language query, library, or category, complete with anti-slop ratings and usage guidance.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g. "button", "morphing dialog", "animated beam", "aurora background", "ai prompt", "table", "sliding number", "marquee")'
          },
          library: {
            type: 'string',
            enum: ['all', 'stageshow', 'shadcn', 'motion-primitives', 'magicui', 'react-bits', 'kokonutui', 'animate-ui'],
            description: 'Filter by source library'
          },
          category: {
            type: 'string',
            enum: ['all', 'primitive', 'interaction', 'background', 'text-animation', 'product-shot', 'bento-grid', 'feedback', 'navigation', 'ai'],
            description: 'Filter by component category'
          },
          limit: {
            type: 'integer',
            description: 'Maximum results to return (default: 20)',
            default: 20
          }
        }
      }
    },
    {
      name: 'sloppy_get_component',
      description: 'Fetch the full source code (TSX/JSX), required dependencies, and anti-slop design guidance for any component from any of the 7 libraries (shadcn, motion-primitives, magicui, react-bits, kokonutui, animate-ui, stageshow).',
      inputSchema: {
        type: 'object',
        properties: {
          componentId: {
            type: 'string',
            description: 'Component identifier (e.g. "motion-primitives/morphing-dialog", "magicui/border-beam", "shadcn/button", "kokonutui/ai-prompt", "react-bits/spotlight") or short name like "button" or "morphing-dialog"'
          }
        },
        required: ['componentId']
      }
    },
    {
      name: 'sloppy_search_patterns',
      description: `Search across ${PATTERNS_CATALOG.length} curated product patterns and layout archetypes.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query (e.g. "billing", "table edit", "linear dark", "chart scrub", "ai chat without sparkles", "drag to reorder")'
          },
          category: {
            type: 'string',
            enum: ['all', 'gold', 'product-study', 'interaction', 'bento', 'device'],
            description: 'Filter by pattern category'
          },
          theme: {
            type: 'string',
            enum: ['any', 'light', 'dark'],
            description: 'Filter by color scheme theme'
          },
          limit: {
            type: 'integer',
            description: 'Maximum number of patterns to return (default: 10)',
            default: 10
          }
        }
      }
    },
    {
      name: 'sloppy_get_pattern',
      description: 'Fetch the full source code (TSX/JSX), CSS styles, and motion choreography for any gold pattern or product study by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          patternId: {
            type: 'string',
            description: 'Pattern ID (e.g. "linear", "static-card", "hero-demo", "ai-chat", "dark-bento", "payout-flow", "chart-scrub")'
          }
        },
        required: ['patternId']
      }
    },
    {
      name: 'sloppy_get_kit_primitives',
      description: 'Retrieve clean, production-grade React anti-slop kit primitives and styles (Stage, Window, Phone, Bento, Cursor, Act, Ease, Bar, Pill, etc.) ready to paste or import into your project.',
      inputSchema: {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of component names to retrieve (e.g. ["Stage", "Window", "Cursor", "Act", "Bar", "Phone"])'
          }
        },
        required: ['components']
      }
    },
    {
      name: 'sloppy_get_look',
      description: 'Fetch complete design tokens, color scales, surface steps, border tokens, typography, and CSS variables for curated aesthetic looks. Includes hand-authored looks (minimal, linear, radix, raycast, blueprint, glass, dark-hero) and Refero-sourced production looks (nuxt, linearity, grafana, modern-treasury, milanote, bunny, heptabase, glyphs).',
      inputSchema: {
        type: 'object',
        properties: {
          look: {
            type: 'string',
            description: 'Look name (e.g. "linear", "minimal", "nuxt", "grafana", "milanote")'
          }
        },
        required: ['look']
      }
    },
    {
      name: 'sloppy_get_rules',
      description: 'Query detailed anti-slop guidelines and reference manuals (Craft & Restraint, Framing & Cropping, Motion & Choreography, Bento Grid Design, Word Budget).',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            enum: ['craft', 'framing', 'motion', 'bento', 'word_budget'],
            description: 'Design topic to query'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'sloppy_refactor_slop',
      description: 'Automatically analyzes sloppy component code and proposes an anti-slop refactoring using Stageshow craft principles, restrained word budgeting, and clean surface depth.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The sloppy component code to refactor'
          },
          targetLook: {
            type: 'string',
            description: 'Desired design look (e.g. "linear", "minimal", "dark-hero")',
            default: 'linear'
          }
        },
        required: ['code']
      }
    },
    {
      name: 'sloppy_list_libraries',
      description: 'List all 7 integrated UI libraries (shadcn, motion-primitives, magicui, react-bits, kokonutui, animate-ui, stageshow) with their design roles, strengths, and anti-slop guidelines.',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'sloppy_list_catalog',
      description: `List summary statistics for the entire Sloppy ecosystem across ${SLOPPY_COMPONENTS.length} curated components and ${PATTERNS_CATALOG.length} curated product patterns.`,
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'sloppy_get_archetype',
      description: 'Retrieve flagship multi-library synthesized master archetypes that fuse the best of all 7 libraries (Stageshow, Kokonut UI, Motion Primitives, Magic UI, React Bits, shadcn, and Animate UI) into production-grade slop-free scenes.',
      inputSchema: {
        type: 'object',
        properties: {
          archetypeId: {
            type: 'string',
            description: 'Archetype identifier (e.g. "ai-agent-cockpit", "developer-platform-hero", "fintech-billing-suite", "database-studio", "observability-telemetry", "saas-pricing-matrix", "mobile-island-companion", "creator-analytics-dashboard", "command-palette-raycast"). Omit or pass "all" to list all 10 available master archetypes.'
          }
        }
      }
    },
    {
      name: 'sloppy_evaluate_rubric',
      description: 'Evaluates JSX/TSX code against the full 10-point Sloppy Craft Rubric: surface elevation, word budget, motion intentionality, focal hierarchy, icon authenticity, accent discipline, framing & bleeding, density, chrome integrity, and semantic accessibility. Returns score (0-100), letter grade (A+ to F), dimension scores, and SVG badge.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Source code content to evaluate against the craft rubric'
          },
          path: {
            type: 'string',
            description: 'Optional file path to read and evaluate'
          },
          strict: {
            type: 'boolean',
            description: 'Enable strict restraint and word budget auditing'
          },
          componentType: {
            type: 'string',
            enum: ['illustration', 'feature-card', 'hero', 'application', 'bento'],
            description: 'Rendered surface type; sets the word budget and rubric word dimension'
          }
        }
      }
    },
    {
      name: 'sloppy_plan_repairs',
      description: 'Generates a structured, reviewable repair plan for sloppy code. Analyzes violations, categorizes patches by confidence (high/medium/low) and risk, separates auto-applicable fixes from manual review items, and projects score improvements before applying changes.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Source code content to generate repair plan for'
          },
          path: {
            type: 'string',
            description: 'Optional file path to read and plan repairs'
          },
          look: {
            type: 'string',
            description: 'Desired design token look (default: "linear")',
            default: 'linear'
          }
        }
      }
    }
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'sloppy_check') {
        const input = args as { code?: string; path?: string; maxScore?: number; failOn?: 'none'|'low'|'medium'|'high'|'critical'; componentType?: 'illustration'|'feature-card'|'hero'|'application'|'bento'; strict?: boolean };
        let code = input.code;
        if (input.path) {
          const file = path.resolve(process.cwd(), input.path);
          if (!fs.existsSync(file)) return { content: [{ type: 'text', text: `File not found: ${file}` }], isError: true };
          if (code === undefined) code = fs.readFileSync(file, 'utf8');
        }
        if (code === undefined) return { content: [{ type: 'text', text: 'Provide code or path.' }], isError: true };
        const audit = auditCode(code, { filepath: input.path, componentType: input.componentType, strict: input.strict });
        const rubric = evaluateCraftRubric(code, { filepath: input.path, componentType: input.componentType, strict: input.strict });
        const rank = ['low', 'medium', 'high', 'critical'];
        const threshold = input.failOn === 'none' ? -1 : rank.indexOf(input.failOn || 'medium');
        const maxScore = input.maxScore ?? 0;
        const ok = audit.slopScore <= maxScore && !audit.violations.some(v => threshold >= 0 && rank.indexOf(v.severity) >= threshold);
        const nextActions = [...new Set(audit.violations.flatMap(() => input.path ? [`Run: sloppy fix ${input.path} --diff`, `Re-run: sloppy check ${input.path}`] : ['Review the suggested repairs and re-run sloppy_check']))].slice(0, 5);
        return { content: [{ type: 'text', text: JSON.stringify({ ok, score: audit.slopScore, grade: rubric.grade, violations: audit.violations, nextActions }) }] };
      }

      if (name === 'sloppy_fix') {
        const input = args as { code?: string; path?: string; look?: string; write?: boolean };
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
        const result = { changed: transformed.transformedCode !== code, changesApplied: transformed.changesApplied, isValidSyntax: transformed.isValidSyntax, transformedCode: transformed.transformedCode, unifiedDiff: transformed.unifiedDiff, postAudit: transformed.postAudit };
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      if (name === 'sloppy_audit_code') {
        const inputArgs = args as { code?: string; path?: string; strict?: boolean };
        let code = inputArgs.code || '';
        if (inputArgs.path) {
          const resolvedPath = path.resolve(process.cwd(), inputArgs.path);
          if (fs.existsSync(resolvedPath)) {
            code = fs.readFileSync(resolvedPath, 'utf8');
          } else {
            return {
              content: [{ type: 'text', text: `File not found at path: ${resolvedPath}` }],
              isError: true
            };
          }
        }

        if (!code) {
          return {
            content: [{ type: 'text', text: 'Please provide either "code" or a valid "path" to audit.' }],
            isError: true
          };
        }

        const result = auditCode(code, {
          filepath: inputArgs.path,
          strict: inputArgs.strict
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_search_components') {
        const inputArgs = args as { query?: string; library?: string; category?: string; limit?: number };
        const results = searchAllComponents(inputArgs.query || '', {
          library: inputArgs.library,
          category: inputArgs.category,
          limit: inputArgs.limit || 20
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: results.length, components: results }, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_get_component') {
        const inputArgs = args as { componentId: string };
        const cleanId = inputArgs.componentId.trim();
        const entry = getComponentById(cleanId);

        let resolvedPath = '';
        if (entry && entry.sourcePath) {
          resolvedPath = path.resolve(COMPONENTS_DIR, entry.sourcePath);
        } else {
          // Dynamic fallback search in packages/components/
          const parts = cleanId.split('/');
          if (parts.length === 2) {
            const lib = parts[0];
            const comp = parts[1];
            const direct = path.resolve(COMPONENTS_DIR, lib, `${comp}.tsx`);
            if (fs.existsSync(direct)) resolvedPath = direct;
          } else {
            // Search all subdirectories
            for (const lib of Object.keys(SLOPPY_LIBRARIES)) {
              const cand = path.resolve(COMPONENTS_DIR, lib, `${cleanId}.tsx`);
              if (fs.existsSync(cand)) {
                resolvedPath = cand;
                break;
              }
            }
          }
        }

        if (!resolvedPath || !fs.existsSync(resolvedPath)) {
          return {
            content: [{ type: 'text', text: `Component "${cleanId}" not found in components directory.` }],
            isError: true
          };
        }

        const sourceCode = fs.readFileSync(resolvedPath, 'utf8');
        const cssPath = resolvedPath.replace(/\.tsx?$/, '.css');
        const cssCode = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : undefined;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  id: entry?.id || cleanId,
                  name: entry?.name || path.basename(resolvedPath, path.extname(resolvedPath)),
                  library: entry?.library || 'custom',
                  category: entry?.category || 'primitive',
                  antiSlopRating: entry?.antiSlopRating || 'restrained',
                  antiSlopGuidance: entry?.antiSlopGuidance || 'Use with restraint: ensure one visual focal point and avoid rainbow gradients.',
                  dependencies: entry?.dependencies || [],
                  sourcePath: path.relative(COMPONENTS_DIR, resolvedPath),
                  sourceCode,
                  cssCode
                },
                null,
                2
              )
            }
          ]
        };
      }

      if (name === 'sloppy_search_patterns') {
        const inputArgs = args as { query?: string; category?: string; theme?: string; limit?: number };
        const results = searchPatterns(inputArgs.query || '', {
          category: inputArgs.category,
          theme: inputArgs.theme,
          limit: inputArgs.limit
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: results.length, patterns: results }, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_get_pattern') {
        const inputArgs = args as { patternId: string };
        const patternMeta = getPatternById(inputArgs.patternId);
        const patternDir = path.resolve(PATTERNS_DIR, inputArgs.patternId);

        if (!fs.existsSync(patternDir)) {
          return {
            content: [{ type: 'text', text: `Pattern "${inputArgs.patternId}" not found in patterns directory.` }],
            isError: true
          };
        }

        const files = fs.readdirSync(patternDir);
        const codeFiles: Record<string, string> = {};

        for (const file of files) {
          const filePath = path.resolve(patternDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.md'))) {
            codeFiles[file] = fs.readFileSync(filePath, 'utf8');
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  id: inputArgs.patternId,
                  metadata: patternMeta,
                  files: codeFiles
                },
                null,
                2
              )
            }
          ]
        };
      }

      if (name === 'sloppy_get_kit_primitives') {
        const inputArgs = args as { components: string[] };
        const requested = inputArgs.components || [];
        const primitives: Record<string, { code?: string; css?: string }> = {};

        for (const comp of requested) {
          const compLower = comp.toLowerCase();
          const tsxPath = path.resolve(KIT_DIR, `${compLower}.tsx`);
          const tsPath = path.resolve(KIT_DIR, `${compLower}.ts`);
          const cssPath = path.resolve(KIT_DIR, `${compLower}.css`);

          const entry: { code?: string; css?: string } = {};

          if (fs.existsSync(tsxPath)) {
            entry.code = fs.readFileSync(tsxPath, 'utf8');
          } else if (fs.existsSync(tsPath)) {
            entry.code = fs.readFileSync(tsPath, 'utf8');
          }

          if (fs.existsSync(cssPath)) {
            entry.css = fs.readFileSync(cssPath, 'utf8');
          }

          primitives[comp] = entry;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(primitives, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_get_look') {
        const inputArgs = args as { look: string };
        const lookDef = getLook(inputArgs.look);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(lookDef, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_get_rules') {
        const inputArgs = args as { topic: string };
        const rules = getRulesByTopic(inputArgs.topic);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rules, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_refactor_slop') {
        const inputArgs = args as { code: string; targetLook?: string };
        const audit = auditCode(inputArgs.code);
        const look = getLook(inputArgs.targetLook || 'linear');

        const refactorGuide = {
          auditSummary: audit.summary,
          slopScore: audit.slopScore,
          violationsFound: audit.violations.map(v => `${v.type}: ${v.message}`),
          refactoringRecipe: [
            '1. Replace outer padded container with <Stage width={720} height={360}> for intentional framing.',
            '2. Wrap application interface in <Window title="..." look="' + look.name + '"> and let filler bleed off the bottom or sides.',
            '3. Enforce 3-7 word budget: replace peripheral data with calm placeholder bars (<Bar width={80} />).',
            '4. Strip purple/indigo gradient backgrounds and replace with quiet surface depth tokens: ' + look.background + ' -> ' + look.surface1 + ' -> ' + look.surface2 + '.',
            '5. Remove sparkle icons; use clean Lucide SVG icons (e.g. Check, Filter, Terminal, Search).',
            '6. If animated, use the Act API (<Act on={clock} script={...}>) so every motion has an explicit cause and payoff.'
          ],
          lookTokens: look
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(refactorGuide, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_list_libraries') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(SLOPPY_LIBRARIES, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_list_catalog') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  libraries: Object.keys(SLOPPY_LIBRARIES),
                  totalCuratedComponents: SLOPPY_COMPONENTS.length,
                  totalPatterns: PATTERNS_CATALOG.length,
                  componentsByLibrary: {
                    shadcn: SLOPPY_COMPONENTS.filter(c => c.library === 'shadcn').length,
                    'motion-primitives': SLOPPY_COMPONENTS.filter(c => c.library === 'motion-primitives').length,
                    magicui: SLOPPY_COMPONENTS.filter(c => c.library === 'magicui').length,
                    kokonutui: SLOPPY_COMPONENTS.filter(c => c.library === 'kokonutui').length,
                    'animate-ui': SLOPPY_COMPONENTS.filter(c => c.library === 'animate-ui').length,
                    'react-bits': SLOPPY_COMPONENTS.filter(c => c.library === 'react-bits').length,
                    stageshow: SLOPPY_COMPONENTS.filter(c => c.library === 'stageshow').length
                  },
                  availableLooks: Object.keys(LOOKS),
                  synthesizedArchetypes: SYNTHESIZED_ARCHETYPES.map(a => a.id)
                },
                null,
                2
              )
            }
          ]
        };
      }

      if (name === 'sloppy_get_archetype') {
        const inputArgs = args as { archetypeId?: string };
        const archetypeId = inputArgs.archetypeId?.trim();

        if (!archetypeId || archetypeId === 'all') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  SYNTHESIZED_ARCHETYPES.map(a => ({
                    id: a.id,
                    name: a.name,
                    category: a.category,
                    description: a.description,
                    librariesUsed: a.librariesUsed,
                    antiSlopMeasures: a.antiSlopMeasures,
                    focalPoint: a.focalPoint
                  })),
                  null,
                  2
                )
              }
            ]
          };
        }

        const archetype = getSynthesizedArchetype(archetypeId);
        if (!archetype) {
          return {
            content: [
              {
                type: 'text',
                text: `Archetype "${archetypeId}" not found. Available master archetypes: ${SYNTHESIZED_ARCHETYPES.map(a => a.id).join(', ')}`
              }
            ],
            isError: true
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(archetype, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_evaluate_rubric') {
        const inputArgs = args as { code?: string; path?: string; strict?: boolean; componentType?: 'illustration'|'feature-card'|'hero'|'application'|'bento' };
        let code = inputArgs.code;

        if (!code && inputArgs.path) {
          const resolvedPath = path.resolve(process.cwd(), inputArgs.path);
          if (fs.existsSync(resolvedPath)) {
            code = fs.readFileSync(resolvedPath, 'utf-8');
          } else {
            return {
              content: [{ type: 'text', text: `File not found: ${resolvedPath}` }],
              isError: true
            };
          }
        }

        if (!code) {
          return {
            content: [{ type: 'text', text: 'Please provide either "code" or a valid "path" to evaluate against the rubric.' }],
            isError: true
          };
        }

        const cert = evaluateCraftRubric(code, {
          strict: inputArgs.strict,
          filepath: inputArgs.path,
          componentType: inputArgs.componentType
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(cert, null, 2)
            }
          ]
        };
      }

      if (name === 'sloppy_plan_repairs') {
        const inputArgs = args as { code?: string; path?: string; look?: string };
        let code = inputArgs.code;

        if (!code && inputArgs.path) {
          const resolvedPath = path.resolve(process.cwd(), inputArgs.path);
          if (fs.existsSync(resolvedPath)) {
            code = fs.readFileSync(resolvedPath, 'utf-8');
          } else {
            return {
              content: [{ type: 'text', text: `File not found: ${resolvedPath}` }],
              isError: true
            };
          }
        }

        if (!code) {
          return {
            content: [{ type: 'text', text: 'Please provide either "code" or a valid "path" to plan repairs.' }],
            isError: true
          };
        }

        const plan = createRepairPlan(code, {
          look: inputArgs.look || 'linear',
          filepath: inputArgs.path
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(plan, null, 2)
            }
          ]
        };
      }

      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
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
  const version = JSON.parse(fs.readFileSync(path.resolve(ROOT_DIR, 'packages/mcp/package.json'), 'utf8')).version;
  process.stderr.write(`Sloppy MCP server v${version} running on stdio.\n`);
}
