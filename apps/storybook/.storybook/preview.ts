import type { Preview, Decorator } from '@storybook/react-vite';
import { createElement } from 'react';

// Import design system styles
import '../../../packages/design-system/src/styles/tokens.css';
import '../../../packages/design-system/src/styles/globals.css';
import '../../../packages/design-system/src/styles/utilities.css';
import '../../../packages/design-system/src/styles/theme.light.css';
import '../../../packages/design-system/src/styles/theme.pink-moon.css';
import '../../../packages/design-system/src/styles/theme.shop.css';

// Override Storybook's hardcoded-white Docs canvas boxes to respect data-theme
import './docs-overrides.css';

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
  const theme = (context.globals.theme as string) ?? 'light-pink-moon'
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
      defaultValue: 'light-pink-moon',
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
  },
};

export default preview;
