/**
 * lighthouserc.js — Lighthouse CI configuration (SUG-67)
 *
 * Audits key pages for CWV and quality scores.
 * Run: pnpm exec lhci autorun
 *
 * Results land in .lighthouseci/ and are read by scripts/stats/perf.js.
 * The scheduled CI workflow (/.github/workflows/stats.yml) runs this daily.
 */

const ORIGIN = process.env.LHCI_ORIGIN || 'https://sugartown.io'

module.exports = {
  ci: {
    collect: {
      // Audit these URLs on every run
      url: [
        `${ORIGIN}/`,
        `${ORIGIN}/articles`,
        `${ORIGIN}/case-studies`,
        `${ORIGIN}/knowledge-graph`,
        `${ORIGIN}/platform`,
        `${ORIGIN}/about`,
        // Representative detail pages (slugs must exist in production)
        `${ORIGIN}/articles/test-preview-post`,
        `${ORIGIN}/nodes/test-node`,
      ],
      numberOfRuns: 3,
      settings: {
        // Desktop emulation for consistency with Netlify deploy previews
        preset: 'desktop',
        // Skip plugins and extensions that can skew scores
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      // Soft assertions — warn on regressions, don't fail the CI run
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance':   ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:seo':           ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Store results locally for perf.js to read
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
