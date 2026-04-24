import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mocks = resolve(__dirname, './mocks');

const config: StorybookConfig = {
  stories: [
    '../../../packages/design-system/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../apps/web/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    './stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    // Web components use automatic JSX runtime (no `import React`)
    viteConfig.esbuild = {
      ...viteConfig.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'react',
    };

    // Force single React copy — prevents context mismatch between
    // @portabletext/react and Storybook's own React instance
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.dedupe = [
      ...(viteConfig.resolve.dedupe || []),
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
    ];

    // Mock sanity.js and contentState.js for web component stories.
    // Checks both the bare import string (e.g. '../lib/sanity') AND the resolved
    // absolute path (e.g. './sanity' imported from within lib/ — useSanityDoc.js
    // uses this form and was previously escaping the mock, causing createClient
    // to be called without a projectId during Chromatic story extraction).
    viteConfig.plugins = viteConfig.plugins || [];
    viteConfig.plugins.push({
      name: 'storybook-mock-sanity',
      enforce: 'pre',
      resolveId(source, importer) {
        const isSanity = (s: string) =>
          s.endsWith('/lib/sanity') || s.endsWith('/lib/sanity.js');
        const isContentState = (s: string) =>
          s.endsWith('/lib/contentState') || s.endsWith('/lib/contentState.js');

        if (isSanity(source)) return resolve(mocks, 'sanity.js');
        if (isContentState(source)) return resolve(mocks, 'contentState.js');

        // Catch relative imports (e.g. './sanity' from lib/useSanityDoc.js)
        if (importer) {
          const abs = resolve(dirname(importer), source);
          if (isSanity(abs)) return resolve(mocks, 'sanity.js');
          if (isContentState(abs)) return resolve(mocks, 'contentState.js');
        }
        return null;
      },
    });

    return viteConfig;
  },
};

export default config;
