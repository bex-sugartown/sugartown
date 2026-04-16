import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * parseAppVersion — reads the latest released version from CHANGELOG.md.
 * Matches the first ## [x.y.z] heading (skips [Unreleased]).
 * Falls back to package.json version if CHANGELOG has no parseable heading.
 */
function parseAppVersion() {
  try {
    const changelog = readFileSync(resolve(__dirname, '../../CHANGELOG.md'), 'utf-8')
    const match = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)
    if (match) return match[1]
  } catch {}
  try {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
    return pkg.version || '0.0.0'
  } catch {}
  return '0.0.0'
}

/**
 * contentStateSafety — Vite plugin that prevents preview mode from shipping
 * to production builds. VITE_SANITY_PREVIEW=true is only allowed in dev.
 *
 * EPIC-0176 · Content State Governance
 */
function contentStateSafety() {
  return {
    name: 'sugartown:content-state-safety',
    config(_, { mode }) {
      if (mode === 'production' && process.env.VITE_SANITY_PREVIEW === 'true') {
        throw new Error(
          '\n\n🚫  BUILD BLOCKED: VITE_SANITY_PREVIEW=true is set in a production build.\n' +
            '    Preview mode must not ship to production — draft content would be visible.\n' +
            '    Remove VITE_SANITY_PREVIEW from your environment or .env file before building.\n' +
            '    See docs/content-state-policy.md for details.\n',
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentStateSafety()],
  define: {
    __APP_VERSION__: JSON.stringify(parseAppVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  // Required for SPA client-side routing: serve index.html for all 404 paths
  // so React Router can handle the route on the client side.
  server: {
    historyApiFallback: true,
  },
  preview: {
    // Same for `vite preview`
    historyApiFallback: true,
  },
})
