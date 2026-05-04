import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Chip from './Chip';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter><Story /></MemoryRouter>
);

const meta: Meta<typeof Chip> = {
  title: 'Web/Chip',
  component: Chip,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'select' }, options: [undefined, 'status', 'tag'] },
    status: { control: { type: 'select' }, options: ['evergreen', 'validated', 'exploring', 'active', 'draft', 'deprecated', 'archived', 'operationalized'] },
    size: { control: { type: 'select' }, options: ['md', 'sm'] },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: { label: 'Design Systems' },
};

export const Interactive: Story = {
  name: 'Interactive (link)',
  args: { label: 'React', href: '/tags/react' },
};

export const StatusChip: Story = {
  name: 'Status variant — evergreen',
  args: { variant: 'status', status: 'evergreen', label: 'Evergreen' },
};

export const TagFeatured: Story = {
  name: 'Tag variant — featured',
  args: { variant: 'tag', featured: true, label: 'Featured' },
};

export const SmallSize: Story = {
  name: 'Small size',
  args: { label: 'Small', size: 'sm' },
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <Chip label="Default" />
      <Chip label="Link chip" href="/tags/sanity" />
      <Chip variant="status" status="evergreen" label="Evergreen" />
      <Chip variant="status" status="exploring" label="Exploring" />
      <Chip variant="status" status="deprecated" label="Deprecated" />
      <Chip variant="status" status="draft" label="Draft" />
      <Chip variant="tag" featured label="Featured tag" />
      <Chip label="Small" size="sm" />
    </div>
  ),
};
