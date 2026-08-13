import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import StatCard from '../../components/StatCard'
import { Callout, Grid, SectionLabel } from '@sugartown/design-system'
import styles from './PlatformHubPage.module.css'

/**
 * GovernanceDraftPage — /platform/governance-draft (SUG-256 Phase 3)
 *
 * Holds the AI-governance coverage tally while it is being re-measured. It moved
 * off `/platform/governance` on 2026-08-02 because three of its claims were
 * measurable as false or unbacked, and iterating on public claims about the
 * platform's own rigour costs credibility on every deploy.
 *
 * NOT INDEXED, and deliberately not linked from nav, the sitemap page, or the
 * governance doc index. Three independent mechanisms keep it out of search
 * (CTL-030) because the `robots` meta below is injected by JS and platform routes
 * are not prerendered (`apps/web/scripts/prerender-content.mjs`), so a non-JS
 * crawler would otherwise receive the SPA shell with no robots directive at all:
 *
 *   1. `X-Robots-Tag` response header — netlify.toml (load-bearing; needs no JS)
 *   2. `Disallow` — apps/web/public/robots.txt
 *   3. the `robots` meta below — covers Googlebot's rendered pass
 *
 * Do NOT add this route to `STATIC_ROUTES` in apps/web/scripts/build-sitemap.js.
 *
 * The tally array below is parsed by scripts/validate-governance-tally.js
 * (CTL-027), and the CTL-027 liveness probe mutates it in place. The parser
 * locates it by a plain indexOf on its declaration and reads to the first
 * closing bracket, so do NOT restate that declaration, or a label/value pair,
 * anywhere above it in this file: the parser would lock onto the prose instead
 * and silently drop the first tile. That happened once while writing this file
 * and the gate caught it.
 */

// ── AI governance coverage (SUG-198) ──────────────────────
// Data sourced verbatim from docs/ai/agentic-caucus/governance-coverage.md v1.3.
// Tally is as-configured, not as-measured. CTL-027 proves these four numbers
// agree with the layer tables they claim to count; it does NOT prove any status
// value is still true — that is CTL-028, which has no probe and cannot have one.
const COVERAGE_TALLY = [
  { label: 'Automated checks',    value: 18, body: '6 run at pre-commit; the rest in CI only.' },
  { label: 'Documented checks',   value: 5,  body: 'To be automated or kept human.' },
  { label: 'Vendor-owned checks', value: 2,  body: 'Owned by Sanity, GitHub, and Netlify.' },
  { label: 'Out-of-scope checks', value: 5,  body: 'No AI model is trained on this platform.' },
]

export default function GovernanceDraftPage() {
  usePlatformHero({
    title: 'Governance coverage (draft)',
    subtitle:
      'A working surface, not a published claim. The AI-governance coverage tally lives here while it is being re-measured against enforcement liveness. Nothing on this page has been verified end to end.',
  })
  return (
    <>
      {/* `robots` is only honoured inside the `seo` object — the top-level
          title/description shorthand ignores it, which renders no robots meta
          at all. Verified in-browser; do not flatten these props. */}
      <SeoHead
        seo={{
          title: 'Governance coverage (draft) — Platform',
          description: 'Working draft of the AI governance coverage tally for sugartown.io. Not indexed.',
          robots: { index: false, follow: false },
        }}
      />
      <div className={styles.hub}>

        <Callout variant="warn" title="NOT PUBLISHED">
          This page is a work in progress and is excluded from search indexes. The numbers
          below moved off <code>/platform/governance</code> on 2026-08-02 because three of
          the claims around them were measurable as false or unbacked. They stay here until
          the pipeline behind them is verified working. Tracked as SUG-256.
        </Callout>

        <section id="coverage-tally" className={styles.section}>
          <SectionLabel
            level="h3"
            number="§01"
            name="AI GOVERNANCE COVERAGE"
            title="Counted, not yet verified"
            kicker="30 components · counted 2026-08-02 by pnpm validate:governance-tally"
          />
          <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2} className={styles.statsSection}>
            {COVERAGE_TALLY.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} body={s.body} />
            ))}
          </Grid>
          <Callout variant="warn" title="WHAT THIS DOES NOT PROVE">
            <p>
              <code>pnpm validate:governance-tally</code> proves these four numbers agree with
              the layer tables in <code>governance-coverage.md</code> and with that doc&rsquo;s own
              tally block. It does not prove any component&rsquo;s status is still true.
            </p>
            <p>
              Three rows in the source doc carry an unresolved liveness caveat, and 15 of the 26
              controls in the register have no probe, so nothing proves they would fail against
              broken input. A component marked Strong whose control went inert still counts as
              Strong above.
            </p>
          </Callout>
        </section>

      </div>
    </>
  )
}
