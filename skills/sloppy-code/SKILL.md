---
name: sloppy-code
description: Specialist anti-slop skill for React/TypeScript component architecture, accessibility semantics, dead placeholder cleanup, and code comment hygiene. Load on-demand when writing component code, refactoring logic, or auditing comments.
metadata:
  version: 1.4.0
---

# Sloppy Code: Component Semantics, Accessibility & Comment Hygiene

This specialist skill enforces professional senior-developer standards across React, TypeScript, and JSX implementations. It strips synthetic AI noise and guarantees accessible interactive controls.

---

## 1. Comment Hygiene Pass (`COD-01`)

AI code generators litter files with low-signal narration comments and decorative box-drawing banners.

### Narration Comments Blocked & Stripped:
- Comments stating the obvious next line:
  - `// Render the header button`
  - `// Return the component JSX`
  - `// Main container wrapper`
  - `// State management variables`
  - `// Handle click event`
- Decorative ascii box-drawing section banners:
  - `/* ========================================================================== */`
  - `// ---------------------------------------------------------------------------`
  - `///////////////////////////////////////////////////////////////////////////////`

### Comments Strictly Preserved:
- **Invariants**: `// Invariant: User token must be validated before render`
- **Workaround Rationales**: `// Workaround: Safari 15 flex child requires explicit min-height`
- **Performance Rationale**: `// Note: Debounce threshold must remain >= 300ms to avoid rate-limiting`
- **Pragmas**: `// eslint-disable...`, `// @ts-expect-error...`, `// sloppy-override: ...`

---

## 2. Accessible Controls & Semantics (`AX-01` - Floor Blocker)

AI agents routinely render `<div onClick={handleClick}>` without accessibility affordances.

### Required Accessibility Semantics:
1. Prefer native `<button>` elements for all interactive actions.
2. If a `<div>` or `<span>` must be interactive:
   - Provide `role="button"`
   - Provide `tabIndex={0}` for keyboard navigation
   - Provide an `onKeyDown` handler that triggers on Enter and Space:
     ```tsx
     <div
       role="button"
       tabIndex={0}
       onClick={handleClick}
       onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
       className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400"
     >
       Action
     </div>
     ```

---

## 3. Zero Dead Placeholder Callbacks (`UX-02` - Floor Blocker)

- **Dead Anchor Targets**: Never use `href="#"` or `href="javascript:void(0)"`. Link to authentic routes (`href="/dashboard"`, `href="/api/docs"`) or use a semantic `<button>`.
- **Empty Handlers**: Replace empty stubs like `onClick={() => {}}` with functional dispatch, state mutation, or an explicit logged callback (`onClick={() => console.log('Action triggered')}`).

---

## 4. Stacking Context Discipline (`TOK-01` - Floor Blocker)

- Arbitrary z-index escalation (`z-[9999]`, `z-[99999]`, `style={{ zIndex: 10000 }}`) is blocked.
- Use structured, predictable stacking scale:
  - `z-0`: Base canvas ground
  - `z-10`: Sticky headers and navbars
  - `z-20`: Dropdowns, popovers, tooltips
  - `z-50`: Modals, dialog overlays, command bars
