module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/base', '@sugartown/eslint-config/boundaries'],
  env: {
    node: true,
  },
  // ESLint resolves overrides[].files in boundaries.js relative to THIS file's directory, not
  // repo root — so its repo-root-relative globs never match when `pnpm lint` runs `eslint .`
  // from here (confirmed empirically; a repo-wide bug, out of scope for this package to fix).
  // Redeclared locally so this package's own boundaries are actually enforced, not just documented.
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/apps/**'],
                message: 'Packages cannot import from apps. This violates architectural boundaries.',
              },
              {
                group: ['**/packages/design-system/**', '@sugartown/design-system'],
                message:
                  'packages/mcp-server reads the design system as data, not as a dependency. No import from packages/design-system allowed.',
              },
            ],
          },
        ],
      },
    },
  ],
}
