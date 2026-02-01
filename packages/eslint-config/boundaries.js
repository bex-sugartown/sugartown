/**
 * Architectural Boundary Enforcement Rules
 * 
 * These rules enforce import boundaries across the monorepo:
 * 1. Packages CANNOT import from apps
 * 2. apps/web CANNOT import from apps/studio
 * 3. packages/design-system CANNOT import Sanity/CMS code
 */

module.exports = {
  overrides: [
    {
      // Rule 1: Packages cannot import from apps
      files: ['packages/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/apps/**'],
                message: 'Packages cannot import from apps. This violates architectural boundaries.',
              },
            ],
          },
        ],
      },
    },
    {
      // Rule 2: design-system must be CMS-agnostic
      files: ['packages/design-system/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/apps/studio/**', 'sanity', '@sanity/**', 'groq'],
                message: 'design-system must remain CMS-agnostic. No Sanity or CMS imports allowed.',
              },
            ],
          },
        ],
      },
    },
    {
      // Rule 3: apps/web cannot import from apps/studio
      files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/apps/studio/**'],
                message: 'apps/web cannot import from apps/studio. Use packages/content adapter instead.',
              },
            ],
          },
        ],
      },
    },
  ],
};
