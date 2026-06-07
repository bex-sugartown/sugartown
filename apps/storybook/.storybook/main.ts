import type { StorybookConfig } from '@storybook/react-vite';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mocks = resolve(__dirname, './mocks');

// Resolve React 19 package roots from apps/web so Storybook uses the same
// React instance as the web components, not its own React 18 copy.
const webRequire = createRequire(resolve(__dirname, '../../../apps/web/package.json'));

// addon-docs preset uses import.meta.resolve() which returns a file:// URL in ESM.
// Vite rejects file:// specifiers as import sources in generated MDX modules.
// Resolve once here so the viteFinal plugin can redirect without needing file:// URLs.
const sbRequire = createRequire(import.meta.url);
const mdxReactShimPath = sbRequire.resolve('@storybook/addon-docs/mdx-react-shim');
const reactRoot      = dirname(webRequire.resolve('react/package.json'));
const reactDomRoot   = dirname(webRequire.resolve('react-dom/package.json'));
const reactRouterRoot = dirname(webRequire.resolve('react-router-dom/package.json'));

const config: StorybookConfig = {
  stories: [
    '../../../packages/design-system/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../apps/web/src/design-system/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../apps/web/src/components/**/*.stories.@(js|jsx|ts|tsx)',
    './stories/**/*.stories.@(js|jsx|ts|tsx)',
    // MDX docs pages live in ./stories/ (within Storybook's Vite root) so the
    // MDX transform plugin can access them. Files in apps/web/ are outside the
    // root and served via @fs/ — the MDX plugin does not apply there.
    './stories/**/*.mdx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    // Web components use automatic JSX runtime (no `import React`).
    // include scoped to JS/TS only — MDX files are handled by the addon-docs
    // MDX plugin before esbuild runs; applying the JSX transform to .mdx causes
    // esbuild to fail on MDX-specific syntax.
    viteConfig.esbuild = {
      ...viteConfig.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'react',
      include: /\.[jt]sx?$/,
    };

    // Force single React copy — prevents context mismatch between
    // @portabletext/react and Storybook's own React instance.
    // Both dedupe (hints) and alias (hard pins) are needed: dedupe alone
    // fails on cold builds because Vite may still resolve multiple copies
    // from different workspace packages before deduplication kicks in.
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.dedupe = [
      ...(viteConfig.resolve.dedupe || []),
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
    ];
    viteConfig.resolve.alias = {
      ...((viteConfig.resolve.alias as Record<string, string>) || {}),
      'react': reactRoot,
      'react-dom': reactDomRoot,
      'react-router-dom': reactRouterRoot,
    };

    // Redirect file:// mdx-react-shim imports produced by addon-docs preset.
    viteConfig.plugins.push({
      name: 'storybook-fix-mdx-provider',
      enforce: 'pre' as const,
      resolveId(id: string) {
        if (id.includes('mdx-react-shim')) return mdxReactShimPath;
        return null;
      },
    });

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
        const isStats = (s: string) =>
          s.endsWith('/generated/stats.json');

        if (isSanity(source)) return resolve(mocks, 'sanity.js');
        if (isContentState(source)) return resolve(mocks, 'contentState.js');
        if (isStats(source)) return resolve(mocks, 'stats.json');

        // Catch relative imports (e.g. './sanity' from lib/useSanityDoc.js)
        if (importer) {
          const abs = resolve(dirname(importer), source);
          if (isSanity(abs)) return resolve(mocks, 'sanity.js');
          if (isContentState(abs)) return resolve(mocks, 'contentState.js');
          if (isStats(abs)) return resolve(mocks, 'stats.json');
        }
        return null;
      },
    });

    // Fix BUILD_DATE to a stable value in Storybook so Footer stories don't
    // produce a Chromatic diff on every build (the real value changes daily).
    viteConfig.define = {
      ...viteConfig.define,
      __BUILD_DATE__: JSON.stringify('2026-01-01'),
    };

    return viteConfig;
  },
};

export default config;
