/**
 * Grid — responsive tile/card grid. Two spacing modes, optional accent rule.
 * SUG-96 | SUG-104 | SUG-120
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Grid from './Grid';

type AccentPreset = 'none' | 'brand' | 'ink';

const meta: Meta<typeof Grid> = {
  title: 'Foundations/Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    spacing: 'lg',
    columns: 3,
  },
  argTypes: {
    spacing:      { control: { type: 'radio' }, options: ['lg', '0'] },
    columns:      { control: { type: 'select' }, options: [1, 2, 3, 4], description: 'Fixed column count. Omit for auto-fit.' },
    accentPreset: {
      name: 'accentTop',
      control: { type: 'select' },
      options: ['none', 'brand', 'ink'] as AccentPreset[],
      description: 'Top-edge 2px rule. `brand` = pink, `ink` = dark neutral.',
      table: { category: 'Accent' },
    },
    tabletColumns:{ table: { disable: true } },
    accentTop:    { table: { disable: true } },
    accentColor:  { table: { disable: true } },
    className:    { table: { disable: true } },
    children:     { table: { disable: true } },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export default meta;

type StoryArgs = React.ComponentProps<typeof Grid> & { accentPreset?: AccentPreset };
type Story = StoryObj<StoryArgs>;

// ─── Tile placeholder ─────────────────────────────────────────────────────────

const Tile = ({ label }: { label: string }) => (
  <div style={{
    background: 'var(--st-color-bg-surface-strong)',
    border: '1px solid var(--st-color-neutral-200)',
    padding: '2rem 1.25rem',
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.7rem',
    color: 'var(--st-color-text-muted)',
    textAlign: 'center' as const,
  }}>
    {label}
  </div>
);

const LABELS = ['A', 'B', 'C', 'D'];
function tiles(n: number) {
  return LABELS.slice(0, Math.min(Math.max(n, 1), 4)).map(l => (
    <Tile key={l} label={`Card ${l}`} />
  ));
}

const RowLabel = ({ text }: { text: string }) => (
  <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>
    {text}
  </p>
);

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { accentPreset: 'none' },
  render: ({ accentPreset = 'none', columns = 3, ...args }) => (
    <Grid
      {...args}
      columns={columns}
      accentTop={accentPreset !== 'none'}
      accentColor={accentPreset === 'none' ? 'brand' : accentPreset}
    >
      {tiles(Number(columns))}
    </Grid>
  ),
};

// ─── Responsive ───────────────────────────────────────────────────────────────

export const Responsive: Story = {
  name: 'Responsive',
  parameters: { chromatic: { disableSnapshot: true }, controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <RowLabel text="columns=4 → 2 cols at tablet → 1 col at mobile" />
        <Grid spacing="lg" columns={4}>
          <Tile label="Card A" /><Tile label="Card B" /><Tile label="Card C" /><Tile label="Card D" />
        </Grid>
      </div>
      <div>
        <RowLabel text="columns=3 → 2 cols at tablet → 1 col at mobile" />
        <Grid spacing="lg" columns={3}>
          <Tile label="Card A" /><Tile label="Card B" /><Tile label="Card C" />
        </Grid>
      </div>
      <div>
        <RowLabel text="columns=2 → stays 2 cols at tablet → 1 col at mobile" />
        <Grid spacing="lg" columns={2}>
          <Tile label="Card A" /><Tile label="Card B" />
        </Grid>
      </div>
      <div>
        <RowLabel text="no columns (auto-fit) — collapses intrinsically" />
        <Grid spacing="lg">
          <Tile label="Card A" /><Tile label="Card B" /><Tile label="Card C" /><Tile label="Card D" />
        </Grid>
      </div>
    </div>
  ),
};

// ─── Snapshot (Chromatic) ─────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded', controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <RowLabel text='spacing="lg" — 4 col' />
        <Grid spacing="lg" columns={4}><Tile label="A" /><Tile label="B" /><Tile label="C" /><Tile label="D" /></Grid>
      </div>
      <div>
        <RowLabel text='spacing="0" — hairline' />
        <Grid spacing="0" columns={4}><Tile label="A" /><Tile label="B" /><Tile label="C" /><Tile label="D" /></Grid>
      </div>
      <div>
        <RowLabel text="accentTop brand — 2px pink" />
        <Grid spacing="0" columns={4} accentTop accentColor="brand"><Tile label="A" /><Tile label="B" /><Tile label="C" /><Tile label="D" /></Grid>
      </div>
      <div>
        <RowLabel text="accentTop ink — 2px dark" />
        <Grid spacing="0" columns={4} accentTop accentColor="ink"><Tile label="A" /><Tile label="B" /><Tile label="C" /><Tile label="D" /></Grid>
      </div>
    </div>
  ),
};
