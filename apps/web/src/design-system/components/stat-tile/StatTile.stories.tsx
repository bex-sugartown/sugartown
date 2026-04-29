import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StatTile from './StatTile';

/**
 * ## StatTile
 *
 * Labeled metric tile — Cormorant Garamond value headline, IBM Plex Mono label.
 * Optional horizontal breakdown bar with colored segments and optional legend.
 *
 * Used by TrustReportSection design-system-stats variant (SUG-87) and
 * KPI Dashboard Cards (SUG-19). Lives in the web adapter layer until SUG-19
 * API is stable.
 */
const meta: Meta<typeof StatTile> = {
  title: 'Primitives/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: { type: 'radio' }, options: ['md', 'sm'] },
    legend: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '280px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatTile>;

/** Plain metric — label + value, no bar. */
export const Default: Story = {
  args: {
    label: 'Design tokens',
    value: 615,
    size: 'md',
  },
};

/** With unit suffix. */
export const WithUnit: Story = {
  name: 'With unit',
  args: {
    label: 'Epics shipped',
    value: 75,
    unit: 'total',
    size: 'md',
  },
};

/** With breakdown bar, no legend. */
export const WithBar: Story = {
  name: 'With bar',
  args: {
    label: 'Token categories',
    value: 615,
    bar: {
      total: 615,
      segments: [
        { label: 'Color',  value: 208, color: 'var(--st-color-accent)' },
        { label: 'Font',   value: 25,  color: 'var(--st-color-seafoam)' },
        { label: 'Space',  value: 17,  color: 'var(--st-color-lime)' },
        { label: 'Shadow', value: 31,  color: 'var(--st-color-violet)' },
        { label: 'Other',  value: 334, color: 'var(--st-color-border-medium)' },
      ],
    },
  },
};

/** With breakdown bar and legend below. */
export const WithBarAndLegend: Story = {
  name: 'With bar + legend',
  args: {
    label: 'Token categories',
    value: 615,
    legend: true,
    bar: {
      total: 615,
      segments: [
        { label: 'Color',  value: 208, color: 'var(--st-color-accent)' },
        { label: 'Font',   value: 25,  color: 'var(--st-color-seafoam)' },
        { label: 'Space',  value: 17,  color: 'var(--st-color-lime)' },
        { label: 'Shadow', value: 31,  color: 'var(--st-color-violet)' },
        { label: 'Other',  value: 334, color: 'var(--st-color-border-medium)' },
      ],
    },
  },
};

/** Small size — compact for tight grid contexts. */
export const Small: Story = {
  args: {
    label: 'Components',
    value: 21,
    size: 'sm',
  },
};

/** Snapshot — 4-tile grid matching TrustReportSection layout. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', maxWidth: '560px' }}>
      <StatTile label="Design tokens"  value={615} />
      <StatTile label="Components"     value={21} />
      <StatTile label="Stories"        value={9} />
      <StatTile label="Commits"        value={828} />
    </div>
  ),
};
