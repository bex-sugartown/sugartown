import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { AXE_ALLOWLIST, type AxeAllowEntry, type Theme } from './axe-allowlist'

// The same tag list the Storybook a11y gate (#50) reuses. Automated rules
// catch a minority of WCAG criteria; a pass here is not a conformance claim (#153).
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

// Set AXE_BASELINE=<path> to record violations as JSON and never fail.
// Used once in Phase 1 to measure the baseline before the gate goes live.
const BASELINE_PATH = process.env.AXE_BASELINE

// Pure so a probe can exercise it with a made-up list (axe-liveness.spec.ts).
export function isAllowlisted(
  violation: { id: string; nodes: number },
  route: string,
  theme: Theme,
  list: AxeAllowEntry[] = AXE_ALLOWLIST,
): boolean {
  return list.some(
    (a) => a.rule === violation.id && a.route === route && a.theme === theme && violation.nodes <= a.maxNodes,
  )
}

// `route` is a literal path, or a page-type key such as '/nodes/:first' for a
// discovered page, so entries do not depend on which item is first.
export async function expectNoAxeViolations(page: Page, route: string, theme: Theme) {
  const missingIssue = AXE_ALLOWLIST.filter((entry) => !/^#\d+$/.test(entry.issue))
  expect(
    missingIssue,
    'every axe allowlist entry must name an open issue like "#143"',
  ).toEqual([])

  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()

  const violations = results.violations
    .filter((v) => !isAllowlisted({ id: v.id, nodes: v.nodes.length }, route, theme))
    .map((v) => ({
      rule: v.id,
      impact: v.impact,
      route,
      nodes: v.nodes.length,
      help: v.help,
      sample: v.nodes[0]?.target.join(' '),
    }))

  if (BASELINE_PATH) {
    mkdirSync(dirname(BASELINE_PATH), { recursive: true })
    writeFileSync(`${BASELINE_PATH}.${theme}.${encodeURIComponent(route)}.json`, JSON.stringify(violations, null, 2))
    return
  }

  expect(
    violations,
    `axe violations on ${route} (${theme}):\n${violations
      .map((v) => `  ${v.rule} (${v.impact}, ${v.nodes} nodes): ${v.help}\n    e.g. ${v.sample}`)
      .join('\n')}`,
  ).toEqual([])
}
