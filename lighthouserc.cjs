/**
 * lighthouserc.cjs — Lighthouse CI configuration (SUG-67, extended SUG-100, fixed SUG-106)
 *
 * Audits key pages for CWV and quality scores — both mobile and desktop presets.
 *
 * Results land in .lighthouseci/ and are read by scripts/stats/perf.js.
 * The scheduled CI workflow (/.github/workflows/stats.yml) runs this daily.
 *
 * perf.js detects form factor from configSettings.emulatedFormFactor in each
 * result file, so both presets can write to the same .lighthouseci/ directory.
 *
 * LHCI v0.15 note: omit startServerCommand entirely for external URLs.
 * An empty string triggers staticDistDir auto-detection and fails in CI.
 */

const ORIGIN = process.env.LHCI_ORIGIN || 'https://sugartown.io'

const URLS = [
  `${ORIGIN}/`,
  `${ORIGIN}/articles`,
  `${ORIGIN}/case-studies`,
  `${ORIGIN}/knowledge-graph`,
  `${ORIGIN}/platform`,
  `${ORIGIN}/about`,
  // Representative detail pages (slugs must exist in production)
  `${ORIGIN}/articles/test-preview-post`,
  `${ORIGIN}/nodes/test-node`,
]

const ASSERT = {
  // ST-159: no preset. 'lighthouse:no-pwa' turns every individual audit into an error
  // (14 failed on /about on 2026-10-12, mostly performance), which an assert step that
  // fails the run cannot tolerate. Only the three category scores are asserted.
  assertions: {
    'categories:performance':   ['warn', { minScore: 0.8 }],
    // ST-159: error, not warn. Baseline 2026-10-12: min 90 across 24 samples (/about is
    // the margin), so 0.9 is the current floor and a drop fails the stats run.
    'categories:accessibility': ['error', { minScore: 0.9 }],
    'categories:seo':           ['warn', { minScore: 0.9 }],
  },
}

// collect is a flat object (not array) — lhci collect reads ci.collect.url directly.
// Form factor is passed as a CLI override (--settings.emulatedFormFactor=mobile|desktop)
// so the workflow runs lhci collect twice: once per preset.
module.exports = {
  ci: {
    collect: {
      url: URLS,
      numberOfRuns: 2,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: ASSERT,
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
