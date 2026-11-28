import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof Controlled> = {
  title: 'Components/SegmentedControl',
  component: Controlled,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    'aria-label': { control: 'text', description: 'Accessible name for the group' },
    defaultValue: { control: 'text', description: 'Which option starts selected (the option `value`)' },
    variant: { table: { disable: true } },
    options: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Controlled>;

// ── Controlled wrapper ────────────────────────────────────────────────────────
function Controlled(props: Omit<React.ComponentProps<typeof SegmentedControl>, 'value' | 'onChange'> & { defaultValue?: string }) {
  const [value, setValue] = useState(props.defaultValue ?? props.options[0]?.value ?? '');
  return <SegmentedControl {...props} value={value} onChange={setValue} />;
}

// ── Pill variant (text labels) — CWV mobile/desktop toggle ───────────────────
export const PillMobileDesktop: Story = {
  name: 'Pill — Mobile / Desktop',
  args: { 'aria-label': 'Form factor', defaultValue: 'mobile' },
  render: (args) => (
    <Controlled
      {...args}
      variant="pill"
      options={[
        { label: 'Mobile', value: 'mobile' },
        { label: 'Desktop', value: 'desktop' },
      ]}
    />
  ),
};

// #50 Phase 1: click selects, arrow keys move selection and wrap, roving tabindex follows it.
export const PillThreeOptions: Story = {
  name: 'Pill — Three options',
  args: { 'aria-label': 'Time range', defaultValue: '28d' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Time range' });
    const d7 = within(group).getByRole('radio', { name: '7d' });
    const d28 = within(group).getByRole('radio', { name: '28d' });
    const d90 = within(group).getByRole('radio', { name: '90d' });

    await expect(d28).toHaveAttribute('aria-checked', 'true');
    await expect(d28).toHaveAttribute('tabindex', '0');
    await expect(d7).toHaveAttribute('tabindex', '-1');

    await userEvent.click(d90);
    await expect(d90).toHaveAttribute('aria-checked', 'true');
    await expect(d28).toHaveAttribute('aria-checked', 'false');

    // ArrowRight wraps from the last option to the first.
    d90.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(d7).toHaveAttribute('aria-checked', 'true');
    // ArrowLeft wraps back.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(d90).toHaveAttribute('aria-checked', 'true');
  },
  render: (args) => (
    <Controlled
      {...args}
      variant="pill"
      options={[
        { label: '7d', value: '7d' },
        { label: '28d', value: '28d' },
        { label: '90d', value: '90d' },
      ]}
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

export const IconGridList: Story = {
  name: 'Icon — Grid / List',
  args: { 'aria-label': 'Layout', defaultValue: 'grid' },
  render: (args) => (
    <Controlled
      {...args}
      variant="icon"
      options={[
        { icon: <GridIcon />, value: 'grid', ariaLabel: 'Grid view' },
        { icon: <ListIcon />, value: 'list', ariaLabel: 'List view' },
      ]}
    />
  ),
};

export const IconThreeOptions: Story = {
  name: 'Icon — Grid / List / Graph',
  args: { 'aria-label': 'View', defaultValue: 'grid' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: 'View' });
    const grid = within(group).getByRole('radio', { name: 'Grid view' });
    const graph = within(group).getByRole('radio', { name: 'Graph view' });

    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(graph);
    await expect(graph).toHaveAttribute('aria-checked', 'true');
    await expect(grid).toHaveAttribute('aria-checked', 'false');
  },
  render: (args) => (
    <Controlled
      {...args}
      variant="icon"
      options={[
        { icon: <GridIcon />, value: 'grid', ariaLabel: 'Grid view' },
        { icon: <ListIcon />, value: 'list', ariaLabel: 'List view' },
        { icon: <GraphIcon />, value: 'graph', ariaLabel: 'Graph view' },
      ]}
    />
  ),
};

// ── Pill with a sort direction (ST-275) ───────────────────────────────────────
// The active option shows an arrow and its accessible name carries the direction. Choosing the
// active option again calls onChange with the same value, and the parent flips the direction.
function SortDemo({ start }: { start: { value: string; dir: 'asc' | 'desc' } }) {
  const [state, setState] = useState(start);
  return (
    <SegmentedControl
      variant="pill"
      aria-label="Sort by"
      value={state.value}
      activeDirection={state.dir}
      onChange={(v) =>
        setState((s) => (s.value === v ? { value: v, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { value: v, dir: v === 'title' ? 'asc' : 'desc' }))
      }
      options={[
        { label: 'Published', value: 'published' },
        { label: 'Updated', value: 'updated' },
        { label: 'Alphabetical', value: 'title' },
      ]}
    />
  );
}

export const PillSortDirection: Story = {
  name: 'Pill — Sort direction',
  parameters: { layout: 'padded', chromatic: { disableSnapshot: false } },
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <SortDemo start={{ value: 'published', dir: 'desc' }} />
      <SortDemo start={{ value: 'title', dir: 'asc' }} />
      {/* 293px is the width the group gets on a 375px phone: all three chips must fit */}
      <div style={{ width: 293 }}>
        <SortDemo start={{ value: 'title', dir: 'desc' }} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getAllByRole('radiogroup', { name: 'Sort by' })[0];
    const published = within(group).getByRole('radio', { name: 'Published, descending' });
    await expect(published).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(published);
    await expect(within(group).getByRole('radio', { name: 'Published, ascending' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(within(group).getByRole('radio', { name: 'Alphabetical' }));
    await expect(within(group).getByRole('radio', { name: 'Alphabetical, ascending' })).toBeInTheDocument();
  },
};
