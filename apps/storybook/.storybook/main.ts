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
    ];

    // Mock sanity.js and contentState.js for web component stories
    viteConfig.plugins = viteConfig.plugins || [];
    viteConfig.plugins.push({
      name: 'storybook-mock-sanity',
      enforce: 'pre',
      resolveId(source) {
        if (source.endsWith('/lib/sanity') || source.endsWith('/lib/sanity.js')) {
          return resolve(mocks, 'sanity.js');
        }
        if (source.endsWith('/lib/contentState') || source.endsWith('/lib/contentState.js')) {
          return resolve(mocks, 'contentState.js');
        }
        return null;
      },
    });

    return viteConfig;
  },
};

export default config;
