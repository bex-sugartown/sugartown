import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * parseAppVersion — mirrors apps/web/vite.config.js. Reads the latest released
 * version from CHANGELOG.md so Footer (and any other component reading
 * __APP_VERSION__) renders in Storybook without a ReferenceError at runtime.
 */
function parseAppVersion(): string {
  try {
    const changelog = readFileSync(path.resolve(__dirname, '../../CHANGELOG.md'), 'utf-8');
    const match = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
    if (match) return match[1];
  } catch {}
  try {
    const pkg = JSON.parse(readFileSync(path.resolve(__dirname, '../web/package.json'), 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {}
  return '0.0.0';
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(parseAppVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  resolve: {
    alias: {
      // Stub Sanity client so web components that import urlFor()
      // render in Storybook without real Sanity credentials.
      [path.resolve(__dirname, '../../apps/web/src/lib/sanity.js')]:
        path.resolve(__dirname, '.storybook/mocks/sanity.js'),
      // Stub content state so DraftBadge and preview-aware components
      // work without VITE_SANITY_PREVIEW env var.
      [path.resolve(__dirname, '../../apps/web/src/lib/contentState.js')]:
        path.resolve(__dirname, '.storybook/mocks/contentState.js'),
    },
  },
});
