import type { Preview, Decorator } from '@storybook/react-vite';
import { createElement } from 'react';

// Import design system styles
import '../../../packages/design-system/src/styles/tokens.css';
import '../../../packages/design-system/src/styles/globals.css';
import '../../../packages/design-system/src/styles/utilities.css';
import '../../../packages/design-system/src/styles/theme.pink-moon.css';
import '../../../packages/design-system/src/styles/theme.shop.css';

// Package component CSS (SUG-224 Phase 4) — required for any story that renders
// a component consumed via the built @sugartown/design-system package output
// rather than package source. Stories under packages/design-system/src/**
// import component .tsx files directly, so Vite processes their own
// .module.css normally and this import is a no-op for them. But apps/web's
// design-system barrel (apps/web/src/design-system/index.js) now re-exports
// many components from the built package, and any apps/web story that
// composes those (Patterns/*, page-level stories) needs this bundle — its
// classnames are hashed by the package's own esbuild build, not Vite's.
// Same fix as apps/web/src/main.jsx; see that file's comment for the full
// reasoning. Harmless duplication for the tokens/theme/globals/utilities
// rules already imported above from source — same values, different hash.
import '@sugartown/design-system/styles.css';

// Override Storybook's hardcoded-white Docs canvas boxes to respect data-theme
import './docs-overrides.css';

// The axe tags the page-level gate checks; one shared list (#50).
import { AXE_TAGS } from '../../../tests/smoke/helpers/axe-tags';

// The a11y gate (#50) runs every story once per theme: .storybook/vitest.setup.ts sets
// this global per Vitest project. Unset in normal Storybook and Chromatic runs.
const DEFAULT_THEME: string =
  (globalThis as { __STORYBOOK_A11Y_THEME__?: string }).__STORYBOOK_A11Y_THEME__ ?? 'light-pink-moon'

/** Canvas background colour for each theme token. */
const THEME_BG: Record<string, string> = {
  'dark-pink-moon':             '#0D1226',
  'light-pink-moon':            '#ffffff',
  'light-pink-moon light-shop': '#ffffff',
}

/**
 * Theme decorator — reads the toolbar global, stamps data-theme on <html>,
 * and imperatively sets document.body background so the Docs page canvas
 * always matches the selected theme (no separate backgrounds toolbar needed).
 */
const withTheme: Decorator = (StoryFn, context) => {
  const theme = (context.globals.theme as string) ?? DEFAULT_THEME
  document.documentElement.setAttribute('data-theme', theme)
  document.body.style.backgroundColor = THEME_BG[theme] ?? '#0D1226'
  return createElement(StoryFn)
}

// Global layout wrapper — constrains component stories to a readable width.
// Skipped for fullscreen stories (Pages/, Regions/, full-width patterns) so
// they render at true viewport width, matching the site's own containers.
const withStoryLayout: Decorator = (StoryFn, context) => {
  if (context.parameters.layout === 'fullscreen') return createElement(StoryFn)
  return createElement('div', {
    style: {
      maxWidth: '960px',
      margin: '2rem auto',
      padding: '1rem',
    },
  }, createElement(StoryFn))
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for all components',
      defaultValue: DEFAULT_THEME,
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light-pink-moon',            title: 'Pink Moon Light (default)' },
          { value: 'dark-pink-moon',             title: 'Pink Moon Dark' },
          { value: 'light-pink-moon light-shop', title: 'Shop Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme, withStoryLayout],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Foundations', 'Components', 'Patterns', 'Regions', 'Pages', '*', 'Docs', ['Welcome', 'Introduction', 'Story Template', 'Component Contracts', 'Contributing'], 'Legacy'],
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (≤520px)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (≤768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (≤1024px)',
          styles: { width: '1024px', height: '768px' },
          type: 'desktop',
        },
        wide: {
          name: 'Wide (1280px)',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    // Disable the built-in backgrounds addon overlay.
    // Canvas background is owned entirely by the withTheme decorator
    // (document.body.style.backgroundColor), so it always tracks the
    // theme toolbar selection. The addon overlay would otherwise sit on top
    // and show a hardcoded white regardless of the chosen theme.
    backgrounds: { disable: true },
    // #50: axe violations fail the Vitest run (pnpm --filter storybook test:a11y) and CI.
    // A stories file can set a11y.test to 'todo' for a known failure; each names its issue.
    a11y: {
      test: 'error',
      options: { runOnly: AXE_TAGS },
    },
  },
};

export default preview;
