import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
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
