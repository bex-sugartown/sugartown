import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { spawnSync } from 'child_process'
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

/**
 * statsPlugin — SUG-67
 *
 * Runs collect-stats.js on buildStart to generate src/generated/stats.json.
 * In dev mode, watches CHANGELOG.md and tokens.css for HMR re-generation.
 */
function statsPlugin() {
  const outputPath = resolve(__dirname, 'src/generated/stats.json')
  const watchTargets = [
    resolve(__dirname, '../../CHANGELOG.md'),
    resolve(__dirname, 'src/design-system/styles/tokens.css'),
    resolve(__dirname, '../../docs/shipped'),
  ]

  function generate() {
    // Run as a child process — keeps Node-only collector code out of the
    // client bundle entirely; Vite never tries to resolve the dynamic
    // imports inside collect-stats.js.
    mkdirSync(resolve(__dirname, 'src/generated'), { recursive: true })
    const result = spawnSync('node', ['scripts/collect-stats.js'], {
      cwd: __dirname,
      stdio: 'inherit',
    })
    if (result.status !== 0) {
      console.error('[stats] collect-stats.js exited with status', result.status)
      // Write minimal fallback so stats.js import doesn't hard-fail the build
      const fallback = { generatedAt: new Date().toISOString(), _error: 'collector failed' }
      writeFileSync(outputPath, JSON.stringify(fallback, null, 2))
    }
  }

  return {
    name: 'sugartown:stats',
    buildStart() {
      generate()
    },
    configureServer(server) {
      for (const t of watchTargets) server.watcher.add(t)
      server.watcher.on('change', (file) => {
        if (watchTargets.some(t => file.startsWith(t))) {
          generate()
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentStateSafety(), statsPlugin()],
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
