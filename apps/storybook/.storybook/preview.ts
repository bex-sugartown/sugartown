import type { Preview } from '@storybook/react';

// Import design system styles
import '../../../packages/design-system/src/styles/tokens.css';
import '../../../packages/design-system/src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
