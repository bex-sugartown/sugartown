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
 * ### Responsive behaviour
 *
 * Without `columns`: `auto-fit` — columns collapse intrinsically when the container
 * is too narrow for `minmax(200px, 1fr)`. No media query needed.
 *
 * With `columns` (fixed count, e.g. `columns={2}`): a `@media (max-width: 600px)` rule
 * in Grid.module.css forces `grid-template-columns: 1fr`, collapsing all fixed-column
 * grids to a single column at mobile. This is the canonical mobile collapse — do NOT
 * add per-consumer breakpoints to override it.
 *
 * SUG-96 | responsive collapse: SUG-104
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Grid from './Grid';
import Tile from '../tile/Tile';
import Card from '../card/Card';
import Callout from '../callout/Callout';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    spacing:     { control: { type: 'radio' }, options: ['lg', '0'] },
    columns:     { control: 'number' },
    accentTop:   { control: 'boolean' },
    accentColor: { control: { type: 'radio' }, options: ['brand', 'ink'] },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
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

/**
 * Responsive collapse — resize the canvas below 600px to see fixed-column grids
 * collapse to a single column. Auto-fit (no `columns` prop) collapses intrinsically
 * at whatever width the minmax floor dictates.
 */
export const Responsive: Story = {
  name: 'Responsive collapse (resize below 600px)',
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>columns=2 — collapses at 600px</p>
        <Grid spacing="lg" columns={2}>
          <PlaceholderTile label="Card A" />
          <PlaceholderTile label="Card B" />
          <PlaceholderTile label="Card C" />
          <PlaceholderTile label="Card D" />
        </Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>no columns (auto-fit) — collapses intrinsically</p>
        <Grid spacing="lg">
          <PlaceholderTile label="Card A" />
          <PlaceholderTile label="Card B" />
          <PlaceholderTile label="Card C" />
          <PlaceholderTile label="Card D" />
        </Grid>
      </div>
    </div>
  ),
};

/** Snapshot — both spacing modes, both accent colours. */
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
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>spacing="0" + accentTop accentColor="brand"</p>
        <Grid spacing="0" columns={4} accentTop accentColor="brand">
          <PlaceholderTile label="Tile A" /><PlaceholderTile label="Tile B" /><PlaceholderTile label="Tile C" /><PlaceholderTile label="Tile D" />
        </Grid>
      </div>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>spacing="0" + accentTop accentColor="ink"</p>
        <Grid spacing="0" columns={3} accentTop accentColor="ink">
          <PlaceholderTile label="Tile A" /><PlaceholderTile label="Tile B" /><PlaceholderTile label="Tile C" />
        </Grid>
      </div>
    </div>
  ),
};

// ── Composition stories ───────────────────────────────────────────────────────
// Real DS components as children. Minimal content — the point is the
// composition pattern (what goes inside Grid and in what configuration).
// Rich data fixtures live in /dev/grid and PageSections.stories.tsx.

/** 3-col hairline + Tile — the canonical stat strip pattern. */
export const ThreeColTile: Story = {
  name: '3-col Grid + Tile',
  render: () => (
    <Grid spacing="0" accentTop accentColor="ink" columns={3}>
      <Tile label="Time on site"     value="38"  unit="%" sub="up from baseline"  titleSize="display" labelColor="ink" />
      <Tile label="Editorial uplift" value="2.4" unit="×"                         titleSize="display" labelColor="ink" />
      <Tile label="Filter match"     value="91"  unit="%" sub="within 2 filters"  titleSize="display" labelColor="ink" />
    </Grid>
  ),
};

/** 4-col hairline + Tile artifact mode — foot slot + href link. */
export const FourColTile: Story = {
  name: '4-col Grid + Tile',
  render: () => (
    <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2}>
      <Tile label="Brief"       value="IA Brief"          foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
      <Tile label="Conventions" value="CLAUDE.md"         foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
      <Tile label="Ethics"      value="AI Ethics"         foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
      <Tile label="Prompt"      value="Release Assistant" foot="Prompt →"   href="#" titleSize="2xl" labelColor="ink" />
    </Grid>
  ),
};

/** 3-col open gap + Card — content grid pattern. */
export const ThreeColCard: Story = {
  name: '3-col Grid + Card',
  render: () => (
    <Grid spacing="lg" columns={3}>
      <Card title="Design System" eyebrow="Platform" excerpt="Token pipeline, component registry, and Storybook coverage." />
      <Card title="Content Lake"  eyebrow="CMS"      excerpt="Sanity v5 schema, GROQ projections, and live preview." />
      <Card title="Monorepo"      eyebrow="Tooling"  excerpt="pnpm workspaces, Turbo, and shared packages." />
    </Grid>
  ),
};

/** 1-col open gap + Callout — stacked content block pattern. */
export const OneColCallout: Story = {
  name: '1-col Grid + Callout',
  render: () => (
    <Grid spacing="lg" columns={1}>
      <Callout title="Default" variant="default">Use Grid as the outer container when callouts stack with other section types.</Callout>
      <Callout title="Info"    variant="info">Info variant — pink accent.</Callout>
      <Callout title="Tip"     variant="tip">Tip variant — violet accent.</Callout>
    </Grid>
  ),
};

/** Snapshot — composition patterns for Chromatic VRT. */
export const SnapshotComposition: Story = {
  name: 'Snapshot — Composition (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '900px' }}>
      <Grid spacing="0" accentTop accentColor="ink" columns={3}>
        <Tile label="Time on site"     value="38"  unit="%" titleSize="display" labelColor="ink" />
        <Tile label="Editorial uplift" value="2.4" unit="×" titleSize="display" labelColor="ink" />
        <Tile label="Filter match"     value="91"  unit="%" titleSize="display" labelColor="ink" />
      </Grid>
      <Grid spacing="0" accentTop accentColor="ink" columns={4} tabletColumns={2}>
        <Tile label="Brief"       value="IA Brief"          foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
        <Tile label="Conventions" value="CLAUDE.md"         foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
        <Tile label="Ethics"      value="AI Ethics"         foot="Markdown →" href="#" titleSize="2xl" labelColor="ink" />
        <Tile label="Prompt"      value="Release Assistant" foot="Prompt →"   href="#" titleSize="2xl" labelColor="ink" />
      </Grid>
      <Grid spacing="lg" columns={3}>
        <Card title="Design System" eyebrow="Platform" excerpt="Token pipeline, component registry, and Storybook coverage." />
        <Card title="Content Lake"  eyebrow="CMS"      excerpt="Sanity v5 schema, GROQ projections, and live preview." />
        <Card title="Monorepo"      eyebrow="Tooling"  excerpt="pnpm workspaces, Turbo, and shared packages." />
      </Grid>
    </div>
  ),
};
