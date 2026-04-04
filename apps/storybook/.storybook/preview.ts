import type { Preview, Decorator } from '@storybook/react-vite';
import { createElement } from 'react';

// Import design system styles
import '../../../packages/design-system/src/styles/tokens.css';
import '../../../packages/design-system/src/styles/globals.css';
import '../../../packages/design-system/src/styles/theme.light.css';
import '../../../packages/design-system/src/styles/theme.pink-moon.css';

// Override Storybook's hardcoded-white Docs canvas boxes to respect data-theme
import './docs-overrides.css';

/** Canvas background colour for each theme token. */
const THEME_BG: Record<string, string> = {
  'dark':            '#0D1226',
  'light':           '#ffffff',
  'dark-pink-moon':  '#0D1226',
  'light-pink-moon': '#ffffff',
}

/**
 * Theme decorator — reads the toolbar global, stamps data-theme on <html>,
 * and imperatively sets document.body background so the Docs page canvas
 * always matches the selected theme (no separate backgrounds toolbar needed).
 */
const withTheme: Decorator = (StoryFn, context) => {
  const theme = (context.globals.theme as string) ?? 'dark'
  document.documentElement.setAttribute('data-theme', theme)
  document.body.style.backgroundColor = THEME_BG[theme] ?? '#0D1226'
  return createElement(StoryFn)
}

// Global layout wrapper — constrains every story to a readable width
const withStoryLayout: Decorator = (StoryFn) =>
  createElement('div', {
    style: {
      maxWidth: '960px',
      margin: '2rem auto',
      padding: '1rem',
    },
  }, createElement(StoryFn));

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for all components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark',            title: 'Dark (default)' },
          { value: 'light',           title: 'Light' },
          { value: 'dark-pink-moon',  title: 'Dark Pink Moon' },
          { value: 'light-pink-moon', title: 'Light Pink Moon' },
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
        order: ['Foundations', 'Components', '*'],
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
