import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { auditCode, transformSlopToCraft, generateAuditReport } from '../packages/core/dist/index.js';

test('catches AI narration comments and decorative section divider banners (COD-01)', () => {
  const code = `
import React from 'react';

// ============================================================================
// Main Component
// ============================================================================
export function Header() {
  // Render the header button
  return (
    <header className="p-4 bg-neutral-900 border-b border-neutral-800">
      {/* Return the component JSX */}
      <button className="px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors">
        Click me
      </button>
    </header>
  );
}

// Invariant: Header must remain sticky on desktop
// Note: Workaround for Safari 15 flexbox child height
`;

  const audit = auditCode(code);
  const commentViolations = audit.violations.filter(v => v.type === 'AI_NARRATION_COMMENT_SLOP');
  assert.ok(commentViolations.length >= 2, `expected at least 2 AI narration violations, found ${commentViolations.length}`);
  assert.ok(commentViolations.some(v => v.ruleId === 'COD-01'));
  assert.ok(audit.violations.every(v => !v.snippet?.includes('Invariant: Header must remain sticky')));
});

test('autofix strips AI narration comments while preserving invariant notes', () => {
  const code = `
import React from 'react';

// ============================================================================
export function Action() {
  // Render the button
  return (
    <button className="px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors">
      Submit
    </button>
  );
}
// Invariant: Must retain submit callback
`;

  const result = transformSlopToCraft(code);
  assert.ok(!result.transformedCode.includes('// Render the button'), 'Narration comment must be stripped');
  assert.ok(!result.transformedCode.includes('// ===='), 'Banner divider must be stripped');
  assert.ok(result.transformedCode.includes('// Invariant: Must retain submit callback'), 'Invariant comment must be preserved');
  assert.ok(result.isValidSyntax, 'Result must remain valid syntax');
});

test('surgical fix respects --only filter by violation index', () => {
  const code = `
import React from 'react';
import { Sparkles } from 'lucide-react';

export function Mixed() {
  // Render the header container
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
      <Sparkles className="w-4 h-4 text-purple-400" />
      <button className="px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700">Go</button>
    </div>
  );
}
`;

  const preAudit = auditCode(code);
  const purpleV = preAudit.violations.find(v => v.type === 'PURPLE_GRADIENT_SLOP');
  const sparkleV = preAudit.violations.find(v => v.type === 'SPARKLE_ICON_OVERLOAD');
  const commentV = preAudit.violations.find(v => v.type === 'AI_NARRATION_COMMENT_SLOP');

  assert.ok(purpleV && purpleV.index, 'Purple violation must have index');
  assert.ok(sparkleV && sparkleV.index, 'Sparkle violation must have index');
  assert.ok(commentV && commentV.index, 'Comment violation must have index');

  // Fix only the comment index
  const commentOnlyResult = transformSlopToCraft(code, { only: [commentV.index] });
  assert.ok(!commentOnlyResult.transformedCode.includes('// Render the header container'), 'Comment should be removed');
  assert.ok(commentOnlyResult.transformedCode.includes('from-purple-600'), 'Purple gradient must be untouched');
  assert.ok(commentOnlyResult.transformedCode.includes('<Sparkles'), 'Sparkle icon must be untouched');

  // Fix only the purple gradient index
  const purpleOnlyResult = transformSlopToCraft(code, { only: [purpleV.index] });
  assert.ok(!purpleOnlyResult.transformedCode.includes('from-purple-600'), 'Purple gradient should be fixed');
  assert.ok(purpleOnlyResult.transformedCode.includes('<Sparkles'), 'Sparkles must remain untouched');
  assert.ok(purpleOnlyResult.transformedCode.includes('// Render the header container'), 'Comment must remain untouched');
});

test('catches sterile surfaces when interactive controls lack micro-interactions (LIV-01)', () => {
  const sterileCode = `
import React from 'react';

export function SterileButtons() {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800">
      <button className="px-4 py-2 bg-neutral-800 text-white rounded">Button One</button>
      <button className="px-4 py-2 bg-neutral-800 text-white rounded">Button Two</button>
    </div>
  );
}
`;

  const audit = auditCode(sterileCode);
  assert.ok(audit.violations.some(v => v.type === 'STERILE_SURFACE_SLOP' && v.ruleId === 'LIV-01'), 'Must flag sterile buttons lacking hover/transition states');
});

test('after-mode generates structured audit report with approval checklist', () => {
  const code = `
import React from 'react';
import { Sparkles } from 'lucide-react';

export function Broken() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
      <Sparkles className="w-4 h-4 text-purple-400" />
    </div>
  );
}
`;

  const dateStr = new Date().toISOString().split('T')[0];
  const expectedReportFile = path.resolve(process.cwd(), `audit-001-${dateStr}.md`);

  const audit = auditCode(code, { mode: 'after', report: true, filepath: 'src/Broken.tsx' });
  assert.ok(audit.reportPath && fs.existsSync(audit.reportPath), 'Audit report file must exist on disk');

  const reportContent = fs.readFileSync(audit.reportPath, 'utf8');
  assert.ok(reportContent.includes('# Sloppy Numbered Audit Report'), 'Report must have header');
  assert.ok(reportContent.includes('## Numbered Audit Findings'), 'Report must have findings section');
  assert.ok(reportContent.includes('## Approval-Gated Fix Execution'), 'Report must have approval execution section');
  assert.ok(reportContent.includes('sloppy fix src/Broken.tsx --only'), 'Report must instruct surgical fix command');

  // Clean up test report file
  try { fs.unlinkSync(audit.reportPath); } catch {}
});
