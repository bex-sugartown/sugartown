import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from './DescriptionList';
import { Chip } from '../Chip/Chip';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Status', value: 'Published' },
      { label: 'Author', value: 'Bex' },
      { label: 'Date', value: '4 June 2026' },
      { label: 'Reading time', value: '5 min' },
    ],
    columns: 1,
  },
};

/** Ledger with chip values — status badge, tag chip rows, chip + text reference rows. */
export const Ledger: Story = {
  render: () => (
    <DescriptionList
      columns={2}
      ledger
      items={[
        {
          label: 'Status',
          value: <Chip variant="badge" status="evergreen" label="Evergreen" />,
        },
        {
          label: 'Related Terms',
          value: (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <Chip variant="tag" label="knowledge graph" />
              <Chip variant="tag" label="counterfactual" />
            </div>
          ),
        },
        {
          label: 'Used In',
          value: (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Chip variant="tag" size="sm" label="Page" />
              <span>About</span>
            </div>
          ),
        },
        {
          label: 'Related Content',
          value: (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Chip variant="tag" size="sm" label="Node" />
              <span>Visualizing the Knowledge Graph</span>
            </div>
          ),
        },
        {
          label: 'Sources',
          value: 'Merriam-Webster, "node"; Oxford English Dictionary, "node, n."',
        },
      ]}
    />
  ),
};
