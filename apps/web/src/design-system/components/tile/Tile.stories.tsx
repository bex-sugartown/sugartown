/**
 * ## Tile
 *
 * Labeled surface for metric display (replaces StatTile) and content preview
 * (replaces TickerCard). Renders as Link/a when href is provided.
 *
 * Two primary use cases:
 * - **Metric**: titleSize="display", labelColor="ink", value + unit + chip
 * - **Content preview**: titleSize="lg", labelColor="brand", meta footer
 *
 * SUG-96
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Tile from './Tile';

const meta: Meta<typeof Tile> = {
  title: 'Primitives/Tile',
  component: Tile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    labelColor: { control: { type: 'radio' }, options: ['ink', 'brand'] },
    titleSize:  { control: { type: 'select' }, options: ['display', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'] },
    size:       { control: { type: 'radio' }, options: ['md', 'sm'] },
    loading:    { control: 'boolean' },
    legend:     { control: 'boolean' },
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
type Story = StoryObj<typeof Tile>;

// ─── Metric mode ──────────────────────────────────────────────────────────────

/** Metric tile — display titleSize (3rem), neutral label, value + unit. */
export const MetricDefault: Story = {
  name: 'Metric / Default',
  args: {
    label: 'Retention',
    value: '94',
    unit: '%',
    sub: 'up from 71%',
    chip: 'Measured',
    titleSize: 'display',
    labelColor: 'ink',
  },
};

/** Metric — 2xl titleSize for denser grids (4+ tiles). */
export const MetricDense: Story = {
  name: 'Metric / Dense (2xl)',
  args: {
    label: 'Time to insight',
    value: '3',
    unit: 'days',
    sub: 'down from 3 weeks',
    titleSize: '2xl',
    labelColor: 'ink',
  },
};

/** Metric — sm size, compact variant. */
export const MetricSmall: Story = {
  name: 'Metric / Small',
  args: {
    label: 'Components',
    value: '21',
    size: 'sm',
    titleSize: 'display',
    labelColor: 'ink',
  },
};

/** Metric with breakdown bar and legend. */
export const MetricWithBar: Story = {
  name: 'Metric / With bar',
  args: {
    label: 'Token categories',
    value: '615',
    legend: true,
    titleSize: 'display',
    labelColor: 'ink',
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

// ─── Content preview mode ─────────────────────────────────────────────────────

/** Content preview tile — lg titleSize (1.125rem), brand label, meta footer. */
export const ContentPreview: Story = {
  name: 'Content Preview',
  args: {
    label: 'Article',
    title: 'The token graph holds what the component cannot',
    meta: 'Design Systems · 12 Apr 2026',
    titleSize: 'lg',
    labelColor: 'brand',
    href: '/articles/token-graph',
  },
};

/** Content preview — loading skeleton state. */
export const ContentPreviewLoading: Story = {
  name: 'Content Preview / Loading',
  args: {
    label: 'Node',
    titleSize: 'lg',
    labelColor: 'brand',
    loading: true,
  },
};

// ─── Snapshot ────────────────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  decorators: [],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '720px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.65rem', fontFamily: 'monospace', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Metric grid (4 tiles)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e1e3e6', border: '1px solid #e1e3e6' }}>
          <Tile label="Retention"      value="94"  unit="%" sub="up from 71%"    chip="Measured"  titleSize="display" labelColor="ink" />
          <Tile label="Time to insight" value="3"  unit="d" sub="down from 3wk"                   titleSize="display" labelColor="ink" />
          <Tile label="Taxonomy docs"  value="2.4" unit="k"                      chip="Measured"  titleSize="display" labelColor="ink" />
          <Tile label="Team adoption"  value="6"   unit="/8" sub="teams onboarded"               titleSize="display" labelColor="ink" />
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.65rem', fontFamily: 'monospace', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Content preview grid (3 tiles)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#e1e3e6', border: '1px solid #e1e3e6' }}>
          <Tile label="Release" title="v0.23.8" meta="2026-04-29 · SUG-94"          titleSize="lg" labelColor="brand" href="#" />
          <Tile label="Article" title="The token graph holds what the component cannot" meta="Design Systems · 12 Apr 2026" titleSize="lg" labelColor="brand" href="#" />
          <Tile label="Node"    title="Design tokens are just variables until you audit them" meta="AI-assisted · 18 Mar 2026" titleSize="lg" labelColor="brand" loading />
        </div>
      </div>
    </div>
  ),
};
