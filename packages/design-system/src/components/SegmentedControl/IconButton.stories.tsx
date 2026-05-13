import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/IconButton',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Controlled(props: Omit<React.ComponentProps<typeof SegmentedControl>, 'value' | 'onChange'> & { defaultValue?: string }) {
  const [value, setValue] = useState(props.defaultValue ?? props.options[0]?.value ?? '');
  return <SegmentedControl {...props} value={value} onChange={setValue} />;
}

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
  </svg>
);

const GraphIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2.5" fill="currentColor" />
    <circle cx="2.5" cy="4" r="1.5" fill="currentColor" />
    <circle cx="13.5" cy="4" r="1.5" fill="currentColor" />
    <circle cx="2.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="13.5" cy="12" r="1.5" fill="currentColor" />
    <line x1="8" y1="5.5" x2="2.5" y2="5.5" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="5.5" x2="13.5" y2="5.5" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10.5" x2="2.5" y2="10.5" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10.5" x2="13.5" y2="10.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const GridList: Story = {
  name: 'Grid / List',
  render: () => (
    <Controlled
      variant="icon"
      aria-label="Layout"
      options={[
        { icon: <GridIcon />, value: 'grid', ariaLabel: 'Grid view' },
        { icon: <ListIcon />, value: 'list', ariaLabel: 'List view' },
      ]}
      defaultValue="grid"
    />
  ),
};

export const ThreeOptions: Story = {
  name: 'Three options',
  render: () => (
    <Controlled
      variant="icon"
      aria-label="View"
      options={[
        { icon: <GridIcon />, value: 'grid', ariaLabel: 'Grid view' },
        { icon: <ListIcon />, value: 'list', ariaLabel: 'List view' },
        { icon: <GraphIcon />, value: 'graph', ariaLabel: 'Graph view' },
      ]}
      defaultValue="grid"
    />
  ),
};
