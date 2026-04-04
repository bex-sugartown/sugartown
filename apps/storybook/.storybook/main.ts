import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../../../packages/design-system/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../apps/web/src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
