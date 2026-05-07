import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

// ── Controlled wrapper ────────────────────────────────────────────────────────
function Controlled(props: Omit<React.ComponentProps<typeof SegmentedControl>, 'value' | 'onChange'> & { defaultValue?: string }) {
  const [value, setValue] = useState(props.defaultValue ?? props.options[0]?.value ?? '');
  return <SegmentedControl {...props} value={value} onChange={setValue} />;
}

// ── Pill variant (text labels) — CWV mobile/desktop toggle ───────────────────
export const PillMobileDesktop: Story = {
  name: 'Pill — Mobile / Desktop',
  render: () => (
    <Controlled
      variant="pill"
      aria-label="Form factor"
      options={[
        { label: 'Mobile', value: 'mobile' },
        { label: 'Desktop', value: 'desktop' },
      ]}
      defaultValue="mobile"
    />
  ),
};

export const PillThreeOptions: Story = {
  name: 'Pill — Three options',
  render: () => (
    <Controlled
      variant="pill"
      aria-label="Time range"
      options={[
        { label: '7d', value: '7d' },
        { label: '28d', value: '28d' },
        { label: '90d', value: '90d' },
      ]}
      defaultValue="28d"
    />
  ),
};

// ── Icon variant — archive grid/list/graph toggle ────────────────────────────
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

export const IconGridList: Story = {
  name: 'Icon — Grid / List',
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
