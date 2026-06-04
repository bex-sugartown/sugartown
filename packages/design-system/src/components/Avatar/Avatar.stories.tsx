import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=176&h=176&fit=crop&auto=format';

export const WithImageXl: Story = {
  args: { src: SAMPLE_IMAGE, name: 'Bex Alice', size: 'xl' },
};

export const WithImageLg: Story = {
  args: { src: SAMPLE_IMAGE, name: 'Bex Alice', size: 'lg' },
};

export const WithImageMd: Story = {
  args: { src: SAMPLE_IMAGE, name: 'Bex Alice', size: 'md' },
};

export const WithImageSm: Story = {
  args: { src: SAMPLE_IMAGE, name: 'Bex Alice', size: 'sm' },
};

export const InitialsXl: Story = {
  args: { name: 'Bex Alice', size: 'xl' },
};

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
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar src={SAMPLE_IMAGE} name="Bex Alice" size="sm" />
      <Avatar src={SAMPLE_IMAGE} name="Bex Alice" size="md" />
      <Avatar src={SAMPLE_IMAGE} name="Bex Alice" size="lg" />
      <Avatar src={SAMPLE_IMAGE} name="Bex Alice" size="xl" />
    </div>
  ),
};

export const AllSizesInitials: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar name="Bex Alice" size="sm" />
      <Avatar name="Bex Alice" size="md" />
      <Avatar name="Bex Alice" size="lg" />
      <Avatar name="Bex Alice" size="xl" />
    </div>
  ),
};
