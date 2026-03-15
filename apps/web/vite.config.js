import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
