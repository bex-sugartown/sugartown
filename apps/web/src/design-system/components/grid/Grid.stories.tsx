/**
 * ## Grid
 *
 * Responsive tile/card grid with two spacing modes.
 *
 * - `spacing="lg"` — 32px open gap (--st-space-card-gap, space.6)
 * - `spacing="0"` — 1px bg-through-gap hairline (--st-space-0, space.0)
 *
 * `accentTop` adds a 2px brand-color rule on the top edge.
 * Children in `spacing="0"` mode must have an explicit background (bg-through-gap pattern).
 *
 * SUG-96
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Grid from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    spacing:   { control: { type: 'radio' }, options: ['lg', '0'] },
    columns:   { control: 'number' },
    accentTop: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const PlaceholderTile = ({ label }: { label: string }) => (
  <div style={{
    background: 'var(--st-color-bg-surface, #fff)',
    padding: '20px',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color: '#888',
  }}>
    {label}
  </div>
);

/** Open gap — 32px between cards (space.6 / --st-space-card-gap). */
export const SpacingLg: Story = {
  name: 'spacing="lg" — open gap',
  args: { spacing: 'lg', columns: 3 },
  render: (args) => (
    <Grid {...args}>
      <PlaceholderTile label="Card A" />
      <PlaceholderTile label="Card B" />
      <PlaceholderTile label="Card C" />
    </Grid>
  ),
};

/** Hairline — 1px bg-through-gap dividers (space.0). */
export const SpacingZero: Story = {
  name: 'spacing="0" — hairline',
  args: { spacing: '0', columns: 3 },
  render: (args) => (
    <Grid {...args}>
      <PlaceholderTile label="Tile A" />
      <PlaceholderTile label="Tile B" />
      <PlaceholderTile label="Tile C" />
    </Grid>
  ),
};

/** Hairline with accentTop — 2px brand rule on top edge. */
export const SpacingZeroAccent: Story = {
  name: 'spacing="0" + accentTop',
  args: { spacing: '0', columns: 4, accentTop: true },
  render: (args) => (
    <Grid {...args}>
      <PlaceholderTile label="Metric A" />
      <PlaceholderTile label="Metric B" />
      <PlaceholderTile label="Metric C" />
      <PlaceholderTile label="Metric D" />
    </Grid>
  ),
};

/** Snapshot — both spacing modes. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>spacing="lg"</p>
        <Grid spacing="lg" columns={3}>
          <PlaceholderTile label="Card A" /><PlaceholderTile label="Card B" /><PlaceholderTile label="Card C" />
        </Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>spacing="0" + accentTop</p>
        <Grid spacing="0" columns={4} accentTop>
          <PlaceholderTile label="Tile A" /><PlaceholderTile label="Tile B" /><PlaceholderTile label="Tile C" /><PlaceholderTile label="Tile D" />
        </Grid>
      </div>
    </div>
  ),
};
