// Known axe violations, each tied to an open issue. An entry with no issue
// number fails the gate (see helpers/axe.ts). Remove an entry when its issue
// closes; do not widen this list to make a run pass (ST-159).
export type AxeAllowEntry = {
  rule: string
  route: string
  date: string // ISO date the violation was recorded
  issue: string // "#123"
  // The most nodes the allowlisted violation may have. A rule and route alone would
  // hide a new failing node of the same rule, which is how #172 stayed hidden behind #163.
  maxNodes: number
}

export const AXE_ALLOWLIST: AxeAllowEntry[] = [
  // #164: Citation uses deprecated doc-endnote and doc-endnotes roles.
  { rule: 'aria-deprecated-role', route: '/', date: '2026-10-12', issue: '#164', maxNodes: 5 },
  // #172: hot pink small text. Home tile labels (3 nodes) and the 404 'Back to home' link (1 node).
  { rule: 'color-contrast', route: '/', date: '2026-10-13', issue: '#172', maxNodes: 3 },
  { rule: 'color-contrast', route: '/this-route-does-not-exist-smoke-test', date: '2026-10-13', issue: '#172', maxNodes: 1 },
]
