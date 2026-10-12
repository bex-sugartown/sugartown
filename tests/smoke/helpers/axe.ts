import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { AXE_ALLOWLIST } from './axe-allowlist'

// The same tag list the Storybook a11y gate (#50) reuses. Automated rules
// catch a minority of WCAG criteria; a pass here is not a conformance claim (#153).
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

// Set AXE_BASELINE=<path> to record violations as JSON and never fail.
// Used once in Phase 1 to measure the baseline before the gate goes live.
const BASELINE_PATH = process.env.AXE_BASELINE

export async function expectNoAxeViolations(page: Page, route: string) {
  const missingIssue = AXE_ALLOWLIST.filter((entry) => !/^#\d+$/.test(entry.issue))
  expect(
    missingIssue,
    'every axe allowlist entry must name an open issue like "#143"',
  ).toEqual([])

  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()

  const violations = results.violations
    .filter((v) => !AXE_ALLOWLIST.some((a) => a.rule === v.id && a.route === route))
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
    writeFileSync(`${BASELINE_PATH}.${encodeURIComponent(route)}.json`, JSON.stringify(violations, null, 2))
    return
  }

  expect(
    violations,
    `axe violations on ${route}:\n${violations
      .map((v) => `  ${v.rule} (${v.impact}, ${v.nodes} nodes): ${v.help}\n    e.g. ${v.sample}`)
      .join('\n')}`,
  ).toEqual([])
}
