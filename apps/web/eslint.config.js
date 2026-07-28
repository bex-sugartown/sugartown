import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Architectural boundary rules, from the same source the v8 packages consume.
// apps/web has NEVER had these wired in — not a regression, a gap: boundaries.js
// was a legacy eslintrc `overrides` block, which flat config cannot consume at
// all, so Rule 3 ("apps/web cannot import apps/studio") was unenforceable here
// independent of the glob bug that killed the other three. SUG-254.
//
// The `.js` extension is load-bearing. @sugartown/eslint-config has no `exports`
// map — adding one breaks v8's extension-search for the three legacy consumers —
// and Node's ESM resolver does not extension-search.
import boundariesFor from '@sugartown/eslint-config/boundaries-for.js'

export default defineConfig([
  globalIgnores([
    'dist',
    'src/components/Header.jsx',
    'src/components/Footer.jsx',
  ]),

  // Browser + React source files
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // useSanityDoc sets loading state synchronously at the top of useEffect
      // before the async fetch — this is intentional and safe.
      'react-hooks/set-state-in-effect': 'off',
      ...boundariesFor('apps/web').rules,
    },
  },

  // Node.js scripts (validate-urls.js, validate-filters.js)
  {
    files: ['scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
