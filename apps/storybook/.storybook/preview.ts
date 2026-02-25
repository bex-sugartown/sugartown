import type { Preview, Decorator } from '@storybook/react';
import { createElement } from 'react';

// Import design system styles
import '../../../packages/design-system/src/styles/tokens.css';
import '../../../packages/design-system/src/styles/globals.css';
// Pink Moon theme — loaded globally so stories can activate it via data-st-theme="pink-moon"
import '../../../packages/design-system/src/styles/theme.pink-moon.css';

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
  decorators: [withStoryLayout],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
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
  },
};

export default preview;
