import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const TextLine: Story = {
  args: { variant: 'text' },
};

export const Block: Story = {
  args: { variant: 'block' },
};

export const Circle: Story = {
  args: { variant: 'circle' },
};

export const CustomSize: Story = {
  args: { variant: 'block', width: '200px', height: '120px' },
};

export const ArticlePreview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
      <Skeleton variant="block" height="180px" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="85%" />
      <Skeleton variant="text" width="70%" />
    </div>
  ),
};
