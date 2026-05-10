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
  preset: 'lighthouse:no-pwa',
  assertions: {
    'categories:performance':   ['warn', { minScore: 0.8 }],
    'categories:accessibility': ['warn', { minScore: 0.9 }],
    'categories:seo':           ['warn', { minScore: 0.9 }],
  },
}

module.exports = {
  ci: {
    collect: [
      // Mobile preset (Moto G4 emulation — Lighthouse default)
      {
        url: URLS,
        numberOfRuns: 3,
        settings: {
          emulatedFormFactor: 'mobile',
          chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        },
      },
      // Desktop preset
      {
        url: URLS,
        numberOfRuns: 3,
        settings: {
          emulatedFormFactor: 'desktop',
          chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        },
      },
    ],
    assert: ASSERT,
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
