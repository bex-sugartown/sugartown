// #50 Phase 3: turns coverage/coverage-summary.json into a per-component markdown table.
// Writes to $GITHUB_STEP_SUMMARY when set (the CI job summary), and always prints it.
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const summary = JSON.parse(readFileSync(path.join(root, 'coverage/coverage-summary.json'), 'utf8'));

// Component = the folder under .../components/. Files directly in components/ group by file name.
const groups = new Map();
for (const [file, m] of Object.entries(summary)) {
  if (file === 'total') continue;
  const rel = file.split('/components/')[1];
  if (!rel) continue;
  const parts = rel.split('/');
  const name = parts.length > 1 ? parts[0] : parts[0].replace(/\.[^.]+$/, '');
  const area = file.includes('/packages/design-system/') ? 'design-system' : 'web';
  const key = `${area}/${name}`;
  const g = groups.get(key) ?? { lines: [0, 0], branches: [0, 0], functions: [0, 0] };
  for (const k of ['lines', 'branches', 'functions']) {
    g[k][0] += m[k].covered;
    g[k][1] += m[k].total;
  }
  groups.set(key, g);
}

const pct = ([c, t]) => (t === 0 ? 'n/a' : `${((c / t) * 100).toFixed(0)}%`);
const rows = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
const sum = (k) => rows.reduce((a, [, g]) => [a[0] + g[k][0], a[1] + g[k][1]], [0, 0]);

const out = [
  '## Storybook coverage by component',
  '',
  'Source covered by running every story and its play function, both themes. Partial by design: only components with stories appear fully.',
  '',
  '| Component | Lines | Branches | Functions |',
  '|---|---|---|---|',
  ...rows.map(([n, g]) => `| ${n} | ${pct(g.lines)} | ${pct(g.branches)} | ${pct(g.functions)} |`),
  `| **All ${rows.length} components** | **${pct(sum('lines'))}** | **${pct(sum('branches'))}** | **${pct(sum('functions'))}** |`,
  '',
].join('\n');

console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + '\n');
