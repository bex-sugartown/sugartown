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

const BEX_IMAGE = 'https://cdn.sanity.io/images/poalmzla/production/07c66211aa101f34172c5cea9ab02f2b34ee6fba-1024x1536.png';

export const WithImage: Story = {
  args: { src: BEX_IMAGE, name: 'Bex Alice' },
};

export const Initials: Story = {
  args: { name: 'Bex Alice' },
};

export const SingleName: Story = {
  args: { name: 'Bex' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar src={BEX_IMAGE} name="Bex Alice" size="sm" />
        <Avatar src={BEX_IMAGE} name="Bex Alice" size="md" />
        <Avatar src={BEX_IMAGE} name="Bex Alice" size="lg" />
        <Avatar src={BEX_IMAGE} name="Bex Alice" size="xl" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar name="Bex Alice" size="sm" />
        <Avatar name="Bex Alice" size="md" />
        <Avatar name="Bex Alice" size="lg" />
        <Avatar name="Bex Alice" size="xl" />
      </div>
    </div>
  ),
};
