---
name: sloppy-ui
description: Specialist anti-slop skill for visual design, surface hierarchy, monochromatic ground, single accent discipline, and authentic product iconography. Load on-demand when styling components, color palettes, dark/light themes, or icons.
metadata:
  version: 1.4.0
---

# Sloppy UI: Visual Craft, Surface Elevation & Icon Authenticity

This specialist skill provides deep, actionable rules for surfaces, elevation, color restraint, and icon replacement. It references core Sloppy rule IDs without duplicating context tokens.

---

## 1. Surface Elevation Hierarchy (Step 0 to Step 3)

Never render floating cards on a raw void. Every screen must follow a disciplined 4-step surface scale:

| Step | Surface Role | Dark Mode Token | Light Mode Token | Border Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **Step 0** | Canvas / Viewport Ground | `bg-neutral-950` / `#09090b` | `bg-neutral-100` / `#f4f4f5` | None |
| **Step 1** | Primary Container / Stage | `bg-neutral-900/90` | `bg-white` | `border border-neutral-800/60` |
| **Step 2** | Elevated Card / Panel | `bg-neutral-800/80` | `bg-neutral-50` | `border border-neutral-700/50` |
| **Step 3** | Floating Modal / Popover | `bg-neutral-800/95` | `bg-white` | `border border-neutral-700 shadow-lg` |

### Core Rules Enforced:
- **`STR-03` (Flat Surface Monotony)**: At least two distinct elevation steps must exist in any composition. Repeating identical flat panels without depth is blocked.
- **`LIV-01` (Sterile Surface Slop)**: Do not strip styling down to a naked flat box. Pair neutral grounds with subtle border contrast (`border-neutral-800/60`), backdrop blurs, and hover micro-interactions.

---

## 2. Monochromatic Ground & Single Semantic Accent

AI agents default to purple-indigo gradients on everything (`VIS-02`). Replace synthetic gradients with strict monochromatic restraint:

1. **Neutral Base Ground**: 90%+ of surfaces must use neutral zinc/slate/stone scales (`bg-neutral-950`, `bg-neutral-900`).
2. **Single Semantic Accent**: Select at most ONE purposeful accent color across the entire view for true signals:
   - Success / Active: Emerald (`text-emerald-400`, `bg-emerald-500/10`)
   - Warning / Caution: Amber (`text-amber-400`, `bg-amber-500/10`)
   - Critical / Error: Rose / Red (`text-rose-400`, `bg-rose-500/10`)
   - Information / Telemetry: Cyan / Sky (`text-sky-400`, `bg-sky-500/10`)
3. **`VIS-01` (Hero Gradient Text)**: Replace multicolored text clipping (`bg-clip-text text-transparent bg-gradient-to-r...`) with solid high-contrast white text (`text-white font-semibold tracking-tight`).
4. **`VIS-02` (Purple Gradient Slop)**: Purple and indigo gradients are blocked by default (Reflex tier) unless explicitly declared with written rationale.
5. **`VIS-03` (Gen-2 Emerald Monoculture)**: Emerald accents on dark grounds are the new default. Only use them when `DESIGN.md` declares the brand accent; otherwise pick the product's own token.
6. **`VIS-06` (Blur Overuse)**: Cap `backdrop-blur` at 1-2 functional overlays per page. A blurred card over a flat background is glassmorphism filler.
7. **`VIS-07` (Glow Shadows)**: No colored ambient glow (`shadow-indigo-500/50`, colored `drop-shadow`). Use one neutral grounded shadow or a 1px border.

---

## 3. Authentic Icon Replacement (Zero Sparkle Clichés)

AI agents blindly insert sparkles or magic wands on generic buttons (`MED-02`).

### Strict Replacement Protocol:
- **Sparkles / Magic Wand (`<Sparkles>`, `<MagicWand>`)** -> Replace with domain-accurate icons:
  - Analytics / Metrics -> `<Activity className="w-4 h-4 text-neutral-400" />`
  - Performance / Fast Actions -> `<Zap className="w-4 h-4 text-neutral-400" />`
  - Developer Tools -> `<Terminal className="w-4 h-4 text-neutral-400" />`
  - Database / Infrastructure -> `<Database className="w-4 h-4 text-neutral-400" />`
  - Security / Access -> `<Shield className="w-4 h-4 text-neutral-400" />`
- **`MED-01` (Raw Emojis in UI Chrome)**: Never use raw emojis in buttons, badges, or headers. Use clean SVG icons with disciplined neutral colors.

---

## 4. Typographic Contrast & Text Readability

- **`VIS-08` (Low Contrast Gray Text - Floor Blocker)**: All body text and labels must maintain a minimum 4.5:1 contrast ratio against their immediate background (3:1 for text >= 18px or bold 14px).
- Pair high-contrast primary text (`text-neutral-100`) with secondary muted labels (`text-neutral-400`). Never wash out text with `text-neutral-600` on dark backgrounds.

---

## 5. The Ponytail UI Restraint Standard (Anti-Overengineering)

"The best UI is the UI you never had to render." When styling or designing UI, stop at the lowest rung of the Ponytail UI Ladder:
- **UI YAGNI**: Never invent speculative cards, filter pills, search bars, extra tabs, or settings dialogs that weren't requested.
- **Card Proliferation**: Avoid wrapping every text line or list item in its own bordered card (`rounded-xl border p-4 bg-card`). Use clean typographic hierarchy and 1px dividers (`divide-y divide-neutral-800/60`).
- **Surface Elevation Restraint**: Maximum 2 surface steps on a single screen (e.g., Step 0 Canvas -> Step 1 Stage -> Step 2 Item). Never create Step 3 nested panels within Step 2 panels unless it is an active modal dialog.
- **Restrained Visual Signals**: Use a single accent color across the entire view. Never combine emerald badges, purple cards, blue CTAs, and amber highlights simultaneously.
