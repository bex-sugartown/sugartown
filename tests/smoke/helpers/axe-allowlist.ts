// Known axe violations, each tied to an open issue. An entry with no issue
// number fails the gate (see helpers/axe.ts). Remove an entry when its issue
// closes; do not widen this list to make a run pass (ST-159).
export type AxeAllowEntry = {
  rule: string
  route: string
  date: string // ISO date the violation was recorded
  issue: string // "#123"
}

// #163: preheader banner text and link, white on #ff247d at 3.62:1, on every route.
const PREHEADER_CONTRAST_ROUTES = [
  '/',
  '/articles',
  '/tools/vercel',
  '/categories/governance',
  '/this-route-does-not-exist-smoke-test',
]

export const AXE_ALLOWLIST: AxeAllowEntry[] = [
  ...PREHEADER_CONTRAST_ROUTES.map((route) => ({
    rule: 'color-contrast',
    route,
    date: '2026-10-12',
    issue: '#163',
  })),
  // #164: Citation uses deprecated doc-endnote and doc-endnotes roles.
  { rule: 'aria-deprecated-role', route: '/', date: '2026-10-12', issue: '#164' },
]
