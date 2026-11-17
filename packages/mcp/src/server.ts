import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import {
  auditCode,
  getLook,
  getPatternById,
  getRulesByTopic,
  LOOKS,
  PATTERNS_CATALOG,
  searchPatterns
} from '@sloppy/core';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const PATTERNS_DIR = path.resolve(ROOT_DIR, 'patterns');
const KIT_DIR = path.resolve(ROOT_DIR, 'packages/kit');

export function createSloppyServer() {
  const server = new Server(
    {
      name: 'sloppy-mcp',
      version: '1.0.0'
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
      name: 'sloppy_search_patterns',
      description: 'Search across 73+ curated gold patterns, product studies (Linear, Slack, Raycast, Figma, Notion, Spotify, Telegram, etc.), and layout archetypes.',
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
      name: 'sloppy_list_catalog',
      description: 'List all available patterns in the Sloppy library grouped by category with summary statistics.',
      inputSchema: {
        type: 'object',
        properties: {}
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

      if (name === 'sloppy_list_catalog') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalPatterns: PATTERNS_CATALOG.length,
                  categories: {
                    gold: PATTERNS_CATALOG.filter(p => p.category === 'gold'),
                    productStudies: PATTERNS_CATALOG.filter(p => p.category === 'product-study'),
                    interactions: PATTERNS_CATALOG.filter(p => p.category === 'interaction'),
                    bento: PATTERNS_CATALOG.filter(p => p.category === 'bento'),
                    devices: PATTERNS_CATALOG.filter(p => p.category === 'device')
                  },
                  availableLooks: Object.keys(LOOKS)
                },
                null,
                2
              )
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
  process.stderr.write('Sloppy MCP server running on stdio.\n');
}
