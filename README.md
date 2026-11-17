# Sloppy: The AI Slop UI Fixer

A unified anti-slop design engine, React kit, 73+ pattern library, Model Context Protocol (MCP) server, and universal Agent Skill designed to stop AI agents from generating low-taste, generic "AI slop" UI.

---

## Why Sloppy Exists

When AI coding agents (Claude, Cursor, Copilot, Gemini CLI, Devin, v0) generate user interfaces, they routinely fall into the same predictable AI slop anti-patterns:
- **Purple & Indigo Gradients**: Mindlessly applying `bg-gradient-to-r from-purple-500 to-indigo-600` on random cards and buttons.
- **Sparkle Overload**: Slapping `LucideSparkles` on any and every interface element.
- **Boxed Card Monotony**: Wrapping every single object in identical `rounded-xl border p-6 bg-card` containers with zero hierarchical depth.
- **Floating Ungrounded Windows**: Shrinking an entire application into a tiny card with uniform air on all 4 sides instead of deliberate cropping or bleeding.
- **Word Overload**: Filling every row with fake numbers and robotic copy instead of disciplined word budgeting (3–7 key strings, calm placeholder bars elsewhere).
- **Unearned Animations**: Arbitrary spinning, bouncing, or sudden content swaps without cause-and-effect transitions.

Sloppy cures this by combining **Stageshow's** craft principles and React kit into an agent-first ecosystem.

---

## The 5 Anti-Slop Commandments

1. **Restraint Over Detail (The 3–7 Word Budget)**:
   Count the real strings on screen: usually 3 to 7. Use real words only on what the story is about. Use quiet placeholder bars (`<Bar />`) for the rest. Filling every row with fake numbers makes an interface look synthetic.
2. **Grounded Framing Over Floating Boxes**:
   The window, card, or phone must fill at least two-thirds of the stage and run off at least one edge. Never float a shrunken window with air on all four sides. Crop aggressively to the panel where the action happens; let non-focal filler bleed off the edge.
3. **Surface Depth Over Flat Cards**:
   Do not wrap every element in identical bordered cards. Step from the page ground to surface 1, surface 2, and surface 3 using quiet grays or true dark steps. Reserve the accent color for one intentional signal.
4. **Caused Motion Over Random Animation**:
   Never add unearned spinning, pulsing, or bouncy keyframes (`animate-bounce`). A cursor moves with purpose, presses with visible feedback, and triggers a state transition. Animate the relationship, not just the object. The payoff must hold for 2–3 seconds for comfortable reading.
5. **Authentic Craft Over Sparkle Slop**:
   Zero purple/indigo gradients. Zero sparkles (`LucideSparkles`) for AI. Use genuine product chrome, real typography hierarchy, and quiet confidence.

---

## Quick Start

### 1. Install CLI Globally
```bash
npm install -g sloppy
# or run directly with npx
npx sloppy help
```

### 2. Audit Code for AI Slop
```bash
# Scan a single file
sloppy audit ./src/components/Hero.tsx

# Scan an entire directory
sloppy audit ./src/
```

### 3. Add a Gold Anti-Slop Pattern
```bash
# List all 73+ curated patterns
sloppy list

# Add a pattern (e.g. Linear, AI Chat without sparkles, Payout Flow)
sloppy add linear
sloppy add ai-chat
```

### 4. Scaffold the Anti-Slop Kit into Your Project
```bash
sloppy init
# Installs pure React + CSS primitives into ./src/kit/
```

### 5. Launch the Visual Playground
```bash
sloppy dev
# Opens local catalog viewer and teaching comparison studio on http://127.0.0.1:1355
```

---

## MCP Server Integration

Sloppy includes a first-class Model Context Protocol (MCP) server. Configure it in your agent settings (e.g. `~/.gemini/config/mcp_config.json`, Claude Desktop, or Cursor):

```json
{
  "mcpServers": {
    "sloppy": {
      "command": "sloppy-mcp",
      "args": []
    }
  }
}
```

### Exposed MCP Tools

| Tool | Description |
|---|---|
| `sloppy_audit_code` | Scans JSX/TSX/CSS for AI slop anti-patterns with severity scores and remediation diffs. |
| `sloppy_search_patterns` | Searches across 73+ gold patterns and product studies (Linear, Slack, Raycast, Figma, etc.). |
| `sloppy_get_pattern` | Fetches full runnable TSX, scoped CSS, and motion choreography for any pattern ID. |
| `sloppy_get_kit_primitives` | Retrieves drop-in React/CSS primitives (`Stage`, `Window`, `Phone`, `Bento`, `Cursor`, `Act`, `Bar`). |
| `sloppy_get_look` | Returns design tokens, surface depth layers, border tokens, and CSS variables for 7+ looks. |
| `sloppy_get_rules` | Queries specific anti-slop guidelines (`craft`, `framing`, `motion`, `bento`, `word_budget`). |
| `sloppy_refactor_slop` | Automated code refactoring guide that transforms sloppy components into clean Stageshow UI. |
| `sloppy_list_catalog` | Lists all available patterns in the Sloppy library grouped by category. |

---

## Monorepo Architecture

```
slopy/
├── packages/
│   ├── core/              # Anti-slop engine: rules, linter, tokens, pattern registry
│   ├── kit/               # The portable React anti-slop UI & motion kit
│   ├── mcp/               # Model Context Protocol server (stdio & stream)
│   ├── cli/               # Developer CLI (sloppy audit, init, add, dev, mcp)
│   ├── verify/            # Perceptual & geometric verification engine
│   └── playground/        # Interactive Vite + React catalog & comparison viewer
├── patterns/              # 73+ curated gold patterns, product studies, teaching pairs
├── skills/
│   └── sloppy/            # Universal Agent Skill definition (SKILL.md)
└── README.md
```

---

## Design Looks & Token Palettes

- **minimal**: Quiet grays, high restraint, calm editorial contrast.
- **linear**: Disciplined dark mode, micro-borders, deep blacks, refined purple accent used strictly for signals.
- **radix**: Accessible, systematic, clean slate styling based on Radix UI token hierarchy.
- **raycast**: Stark command-palette focus, high contrast, crisp shadows, red/orange signal accents.
- **blueprint**: Architectural, engineering-grade monospace style with blueprint cyan accents.
- **glass**: Translucent frosted glass over subtle gradient underlay with soft specular border highlights.
- **dark-hero**: True black background with high elevation steps, emerald/cyan accents, and laser focus.

---

## License

MIT License.
