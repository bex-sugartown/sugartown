import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RoadmapTable from './RoadmapTable';

/**
 * ## RoadmapTable
 *
 * Sticky-thead epics table for a single roadmap lane.
 * Composes `<Table tone="subdued">` — no raw `<table>` element.
 * Caption + thead pin together via `--st-table-sticky-offset` on the wrapper.
 */
const meta: Meta<typeof RoadmapTable> = {
  title: 'Components/Table/RoadmapTable',
  component: RoadmapTable,
  tags: ['autodocs'],
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RoadmapTable>;

// ── Fixture data ──────────────────────────────────────────────────────────────

const IN_PROGRESS = [
  {
    identifier: 'SUG-119',
    title: 'Table audit — converge to st-table',
    status: 'In Progress',
    priority: 'High',
    url: 'https://linear.app/sugartown/issue/SUG-119',
    projects: [{ name: 'Design System', colorHex: '#ff4dac' }],
  },
  {
    identifier: 'SUG-103',
    title: 'Component registry publication',
    status: 'In Progress',
    priority: 'Medium',
    url: 'https://linear.app/sugartown/issue/SUG-103',
    projects: [{ name: 'Platform', colorHex: '#7c6af5' }],
  },
];

const BACKLOG = [
  {
    identifier: 'SUG-120',
    title: 'Dark mode audit — full token pass',
    status: 'Backlog',
    priority: 'Medium',
    url: null,
    projects: [{ name: 'Design System', colorHex: '#ff4dac' }],
  },
  {
    identifier: 'SUG-121',
    title: 'Responsive table mobile layout',
    status: 'Backlog',
    priority: 'Low',
    url: null,
    projects: [],
  },
  {
    identifier: 'SUG-122',
    title: 'No priority epic — edge case',
    status: 'Backlog',
    priority: 'No priority',
    url: null,
    projects: [
      { name: 'Design System', colorHex: '#ff4dac' },
      { name: 'Platform', colorHex: '#7c6af5' },
    ],
  },
];

// ── In Progress lane ──────────────────────────────────────────────────────────

export const InProgress: Story = {
  render: () => (
    <RoadmapTable lane={{ label: 'In progress' }} rows={IN_PROGRESS} />
  ),
};

// ── Backlog lane ──────────────────────────────────────────────────────────────

export const Backlog: Story = {
  render: () => (
    <RoadmapTable lane={{ label: 'Backlog' }} rows={BACKLOG} />
  ),
};

// ── Both lanes (governance page layout) ──────────────────────────────────────

export const BothLanes: Story = {
  name: 'Both lanes (governance layout)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <RoadmapTable lane={{ label: 'In progress' }} rows={IN_PROGRESS} />
      <RoadmapTable lane={{ label: 'Backlog' }} rows={BACKLOG} />
    </div>
  ),
};

// ── Empty lane ────────────────────────────────────────────────────────────────

export const EmptyLane: Story = {
  name: 'Empty lane (edge case)',
  render: () => (
    <RoadmapTable lane={{ label: 'In progress' }} rows={[]} />
  ),
};

// ── Single epic ───────────────────────────────────────────────────────────────

export const SingleEpic: Story = {
  name: 'Single epic (caption singular)',
  render: () => (
    <RoadmapTable lane={{ label: 'In progress' }} rows={[IN_PROGRESS[0]]} />
  ),
};

// ── Dark mode ─────────────────────────────────────────────────────────────────

export const DarkMode: Story = {
  name: 'Dark mode (subdued tone)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <RoadmapTable lane={{ label: 'In progress' }} rows={IN_PROGRESS} />
      <RoadmapTable lane={{ label: 'Backlog' }} rows={BACKLOG} />
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark-pink-moon',
  },
};
