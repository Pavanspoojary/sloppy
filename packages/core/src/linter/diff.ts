export function unifiedDiff(original: string, modified: string, filename: string): string {
  if (original === modified) return '';
  const a = original.split('\n'), b = modified.split('\n'), n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: { kind: ' ' | '+' | '-'; text: string; ai: number; bi: number }[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) { if (i < n && j < m && a[i] === b[j]) { ops.push({ kind: ' ', text: a[i], ai: i++, bi: j++ }); } else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) ops.push({ kind: '+', text: b[j], ai: i, bi: j++ }); else ops.push({ kind: '-', text: a[i], ai: i++, bi: j }); }
  const changed = ops.map((op, k) => op.kind === ' ' ? -1 : k).filter(k => k >= 0), ranges: [number, number][] = [];
  for (const k of changed) { const start = Math.max(0, k - 3), end = Math.min(ops.length, k + 4), last = ranges[ranges.length - 1]; if (last && start <= last[1]) last[1] = Math.max(last[1], end); else ranges.push([start, end]); }
  const hunks = ranges.map(([start, end]) => { const part = ops.slice(start, end); const oldStart = part.find(x => x.kind !== '+')?.ai ?? (part[0]?.ai ?? 0); const newStart = part.find(x => x.kind !== '-')?.bi ?? (part[0]?.bi ?? 0); const oldCount = part.filter(x => x.kind !== '+').length, newCount = part.filter(x => x.kind !== '-').length; return `@@ -${oldStart + 1},${oldCount} +${newStart + 1},${newCount} @@\n${part.map(x => `${x.kind}${x.text}`).join('\n')}`; });
  return `--- a/${filename}\n+++ b/${filename}\n${hunks.join('\n')}\n`;
}
