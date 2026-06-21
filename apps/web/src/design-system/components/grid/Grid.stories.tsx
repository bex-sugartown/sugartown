/**
 * ## Grid — responsive tile/card grid with two spacing modes.
 *
 * `spacing="lg"` → 32px open gap (`--st-space-card-gap` / `space.6`)
 * `spacing="0"` → 1px bg-through-gap hairline (`--st-space-0` / `space.0`)
 *
 * ```
 * Parent background shows through gap as hairline dividers.
 * Children must have an explicit background to cover it.
 * ```
 *
 * `columns` → integer (e.g. 2). Fixed column count via `--grid-columns`.
 *
 * ```
 * Without this prop, auto-fit collapses intrinsically.
 * ```
 *
 * `tabletColumns` → integer. Overrides column count at tablet width (≤900px)
 *
 * ```
 * before mobile (≤600px) collapse to 1 col.
 * Use tabletColumns={2} to get a 2×2 layout from columns={4}.
 * ```
 *
 * `accentTop` → adds a 2px rule on the grid's top edge.
 * `accentColor` → `"brand"` (default, pink) | `"ink"` (dark neutral).
 *
 * ```
 * Only applies when accentTop is true.
 * ```
 *
 * SUG-96 | responsive collapse: SUG-104 | accentColor + tabletColumns: SUG-120
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
    columns:      { control: 'number', description: 'Fixed column count. Omit for auto-fit.' },
    tabletColumns:{ control: 'number', description: 'Column count at tablet width (≤900px).' },
    // Story-layer accent control — maps to accentTop + accentColor props
    accentPreset: {
      name: 'accentTop',
      control: { type: 'select' },
      options: ['none', 'brand', 'ink'] as AccentPreset[],
      description: 'Top-edge 2px rule. `brand` = pink, `ink` = dark neutral. Maps to `accentTop` + `accentColor` props.',
      table: { category: 'Accent' },
    },
    // Hide real props — managed via accentPreset above
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

function tiles(n: number) {
  return ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, Math.min(Math.max(n, 1), 6)).map(l => (
    <Tile key={l} label={`Card ${l}`} />
  ));
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>columns=3 — collapses at 600px</p>
        <Grid spacing="lg" columns={3}>
          <Tile label="Card A" /><Tile label="Card B" /><Tile label="Card C" />
        </Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>columns=4, tabletColumns=2 — 4→2→1</p>
        <Grid spacing="lg" columns={4} tabletColumns={2}>
          <Tile label="Card A" /><Tile label="Card B" /><Tile label="Card C" /><Tile label="Card D" />
        </Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>no columns — auto-fit collapses intrinsically</p>
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
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.5rem' }}>spacing="lg" — open gap</p>
        <Grid spacing="lg" columns={3}><Tile label="A" /><Tile label="B" /><Tile label="C" /></Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.5rem' }}>spacing="0" — hairline</p>
        <Grid spacing="0" columns={3}><Tile label="A" /><Tile label="B" /><Tile label="C" /></Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.5rem' }}>accentTop brand (2px pink)</p>
        <Grid spacing="0" columns={3} accentTop accentColor="brand"><Tile label="A" /><Tile label="B" /><Tile label="C" /></Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.5rem' }}>accentTop ink (2px dark)</p>
        <Grid spacing="0" columns={3} accentTop accentColor="ink"><Tile label="A" /><Tile label="B" /><Tile label="C" /></Grid>
      </div>
    </div>
  ),
};
