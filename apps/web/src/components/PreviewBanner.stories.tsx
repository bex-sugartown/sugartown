import type { Meta, StoryObj } from '@storybook/react';
import PreviewBanner from './PreviewBanner';

const meta: Meta<typeof PreviewBanner> = {
  title: 'Patterns/PreviewBanner',
  component: PreviewBanner,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PreviewBanner>;

/** Default preview mode banner — sticky bar with warning icon and Studio link. */
export const Default: Story = {};
