// Known axe violations, each tied to an open issue. An entry with no issue
// number fails the gate (see helpers/axe.ts). Remove an entry when its issue
// closes; do not widen this list to make a run pass (ST-159).
// The theme an entry was recorded in. An entry hides a violation only in its own
// theme, so a light entry cannot hide the same rule on the same route in dark (ST-166).
export type Theme = 'light' | 'dark'

export type AxeAllowEntry = {
  rule: string
  route: string
  theme: Theme
  date: string // ISO date the violation was recorded
  issue: string // "#123"
  // The most nodes the allowlisted violation may have. A rule and route alone would
  // hide a new failing node of the same rule, which is how #172 stayed hidden behind #163.
  maxNodes: number
}

export const AXE_ALLOWLIST: AxeAllowEntry[] = [
  // #164: Citation uses deprecated doc-endnote and doc-endnotes roles.
  { rule: 'aria-deprecated-role', route: '/', theme: 'light', date: '2026-10-12', issue: '#164', maxNodes: 5 },
  // #172: hot pink small text. Home tile labels (3 nodes) and the 404 'Back to home' link (1 node).
  { rule: 'color-contrast', route: '/', theme: 'light', date: '2026-10-13', issue: '#172', maxNodes: 3 },
  { rule: 'color-contrast', route: '/this-route-does-not-exist-smoke-test', theme: 'light', date: '2026-10-13', issue: '#172', maxNodes: 1 },
  // Dark theme, recorded 2026-11-02 by the dark pass (#186). Counts follow page content, so a publish
  // that adds filter options or glossary terms can fail the gate until the owning issue is fixed.
  // #164: the same Citation roles as in light.
  { rule: 'aria-deprecated-role', route: '/', theme: 'dark', date: '2026-11-02', issue: '#164', maxNodes: 5 },
  // #171: text-brand (#ff247d) on the dark surface, 4.28 to 4.44:1 (18 nodes, 3 of them on #1c2240 at 4.28:1).
  { rule: 'color-contrast', route: '/', theme: 'dark', date: '2026-11-02', issue: '#171', maxNodes: 18 },
]
