import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// #50 (SUG-161 Phase 2): every story runs in a real Chromium once per shipped theme,
// and axe violations fail the run (parameters.a11y.test in .storybook/preview.ts).
// The theme reaches preview.ts through `provide` and .storybook/vitest.setup.ts.
const THEMES = ['light-pink-moon', 'dark-pink-moon'];

export default defineConfig({
  test: {
    projects: THEMES.map((theme) => ({
      extends: true,
      plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
      test: {
        name: `storybook:${theme}`,
        provide: { a11yTheme: theme },
        setupFiles: [path.join(dirname, '.storybook/vitest.setup.ts')],
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{ browser: 'chromium' }],
        },
      },
    })),
  },
});
