import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const InitialsSm: Story = {
  args: { name: 'Bex Alice', size: 'sm' },
};

export const InitialsMd: Story = {
  args: { name: 'Bex Alice', size: 'md' },
};

export const InitialsLg: Story = {
  args: { name: 'Bex Alice', size: 'lg' },
};

export const SingleName: Story = {
  args: { name: 'Bex', size: 'md' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Avatar name="Bex Alice" size="sm" />
      <Avatar name="Bex Alice" size="md" />
      <Avatar name="Bex Alice" size="lg" />
    </div>
  ),
};
