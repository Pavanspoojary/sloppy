---
name: sloppy-layoutmobile
description: Specialist anti-slop skill for responsive viewport framing, breaking boxed card syndrome, bleeding layout panels, and mobile density. Load on-demand when structuring grids, heroes, mobile layouts, or responsive viewports.
metadata:
  version: 1.4.0
---

# Sloppy Layout & Mobile: Viewport Framing & Responsive Density

This specialist skill provides layout framing rules that break the boxed card syndrome and guarantee responsive integrity from 375px mobile to 1920px widescreen.

---

## 1. Breaking the Boxed Card Syndrome (`STR-01`)

AI models habitually wrap every chunk of UI in an identical bordered card: `rounded-xl border p-6 bg-neutral-900`.

### Architectural Remedies:
- **Surface Elevation Instead of Repetition**: Use background contrast (`bg-neutral-900` vs `bg-neutral-950`) to separate sections rather than repeating borders.
- **Asymmetric Bento Layouts**: Group related tools into varied aspect ratios (2:1 dominant focal cell, 1:1 supporting telemetry cells) rather than identical 3-column cards.
- **Divider Lines Over Boxes**: Use crisp 1px hairpins (`border-b border-neutral-800/80` or `divide-y divide-neutral-800/60`) to separate list items cleanly.

---

## 2. Eliminating Unanchored Floating Windows (`STR-02`)

AI landing pages frequently shrink an entire SaaS dashboard into a floating 400px card centered with uniform air on all 4 sides.

### Framing & Bleeding Protocol:
1. **Stage Coverage (>= 66%)**: The primary application frame must occupy at least two-thirds of the viewport stage width.
2. **Edge Bleeding**: Bleed secondary panels off at least one stage boundary (e.g., bottom edge or right edge). This implies an expansive, real product rather than an isolated toy illustration.
3. **Stage Root Anchoring**: Always wrap scenes in an anchored stage container:
   ```tsx
   <Stage width="100%" height={640} look="linear">
     <Window title="Cluster Operations" look="linear">
       {/* Bleeds cleanly to bottom boundary */}
     </Window>
   </Stage>
   ```

---

## 3. Responsive Density & Mobile Overflow Prevention

- **`UX-05` (Scroll Hijacking & Wheel Interference - Floor Blocker)**: Never lock `html, body { overflow: hidden }` or attach invasive custom `onWheel` handlers. Let native scrolling work uninterrupted.
- **Horizontal Overflow (`MOBILE_OVERFLOW`)**:
  - Test layouts at 375px, 390px, and 430px viewports using `sloppy verify <target> --multi-width`.
  - Prevent fixed pixel widths (`w-[600px]`) that trigger horizontal scrollbars on mobile. Always use `max-w-full`, `w-full`, or flex wrapping.
- **Center-Alignment Discipline (`LAY-01`)**: Center-align only the primary hero headline. Supporting cards, feature lists, and code blocks must remain left-aligned for high readability.

---

## 4. Ponytail Minimal Layout Architecture (Zero Div Soup)

- **Eliminate Wrapper Div Syndrome**: Flatten layout hierarchies. Do not wrap single children in redundant flex/grid containers. If a section can be laid out with 1 parent container, never generate 3 nested `div` wrappers.
- **Whitespace Over Borders**: Use structured gap tokens (`gap-6`, `gap-8`) and natural padding instead of enclosing every section in a bordered box.
- **Single Focal Center**: Every screen needs one clear focal hierarchy. Avoid splitting user attention across 6 competing mini-cards.
- **Native Layout Primitives**: Use CSS Grid and Flexbox with native `gap`, `clamp()`, and `:has()` rather than importing runtime layout calculators.
