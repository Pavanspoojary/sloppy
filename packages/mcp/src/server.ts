import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import {
  auditCode,
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
  const server = new Server(
    {
      name: 'sloppy-mcp',
      version: '1.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const tools: Tool[] = [
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
      description: 'Search across 700+ UI components from all 7 major ecosystems (shadcn, motion-primitives, magicui, react-bits, kokonutui, animate-ui, and stageshow) by natural language query, library, or category, complete with anti-slop ratings and usage guidance.',
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
      description: 'Search across 73+ curated gold product scenes (Linear, Slack, Raycast, Figma, Notion, Spotify, Telegram, etc.) and layout archetypes.',
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
      description: 'Fetch complete design tokens, color scales, surface steps, border tokens, and CSS variables for curated aesthetic looks (minimal, linear, radix, raycast, blueprint, glass, dark-hero).',
      inputSchema: {
        type: 'object',
        properties: {
          look: {
            type: 'string',
            description: 'Look name (e.g. "linear", "minimal", "radix", "raycast", "blueprint", "glass", "dark-hero")'
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
      description: 'List summary statistics for the entire Sloppy ecosystem across all 7 component libraries and 73+ product patterns.',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'sloppy_autofix_code',
      description: 'Automatically and surgically transforms sloppy AI code into pristine craft: replaces purple gradients with quiet surface elevation, replaces sparkles with semantic icons, tames unearned animations, grounds floating windows, and injects word budgeting.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The sloppy JSX/TSX/HTML code to automatically refactor'
          },
          path: {
            type: 'string',
            description: 'Optional file path to read, refactor, and audit'
          },
          look: {
            type: 'string',
            enum: ['linear', 'minimal', 'dark-hero', 'raycast', 'radix', 'blueprint', 'glass'],
            description: 'Target design token look (default: "linear")',
            default: 'linear'
          },
          groundFraming: {
            type: 'boolean',
            description: 'Whether to ground floating windows to stage edges (default: true)',
            default: true
          }
        }
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
            description: 'Archetype identifier (e.g. "ai-agent-cockpit", "developer-platform-hero", "fintech-billing-suite"). Omit or pass "all" to list all available master archetypes.'
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

      if (name === 'sloppy_autofix_code') {
        const inputArgs = args as { code?: string; path?: string; look?: any; groundFraming?: boolean };
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
            content: [{ type: 'text', text: 'Please provide either "code" or a valid "path" to autofix.' }],
            isError: true
          };
        }

        const result = transformSlopToCraft(code, {
          look: inputArgs.look || 'linear',
          groundFraming: inputArgs.groundFraming !== false
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
  process.stderr.write('Sloppy MCP server v1.1.0 running on stdio.\n');
}
