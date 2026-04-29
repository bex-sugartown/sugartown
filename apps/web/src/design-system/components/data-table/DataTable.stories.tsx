import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DataTable, { KindBadge } from './DataTable';

/**
 * ## DataTable
 *
 * Props-driven wrapper over the DS Table + TableWrap primitives.
 * Adds a column config API and a `trust` variant that overrides header
 * color tokens: subdued surface-strong bg, WCAG AA text (not pink accent).
 *
 * Used by TrustReportSection recent-releases variant (SUG-87).
 * KindBadge sub-component is exported for use in column `render` functions.
 */
const meta: Meta<typeof DataTable> = {
  title: 'Primitives/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'radio' }, options: ['default', 'trust'] },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const releaseColumns = [
  { key: 'version',    label: 'Version',     width: '110px' },
  { key: 'date',       label: 'Date',         width: '110px' },
  { key: 'kind',       label: 'Kind',         width: '80px',
    render: (val: string) => <KindBadge kind={val?.toLowerCase()} /> },
  { key: 'descriptor', label: 'Description' },
];

const releaseRows = [
  { version: '0.23.0', date: '2026-04-27', kind: 'minor', descriptor: 'Trust data pipeline, Ledger Tradition design system structural pass, dynamic Knowledge Graph.' },
  { version: '0.22.0', date: '2026-04-22', kind: 'minor', descriptor: 'Pink Moon design system implementation, Ledger Tradition font stack, page layout.' },
  { version: '0.21.0', date: '2026-04-06', kind: 'minor', descriptor: 'Storybook v10 upgrade, Accordion component, full story coverage.' },
  { version: '0.20.0', date: '2026-04-01', kind: 'minor', descriptor: 'Responsive mobile nav, image treatments, gallery, detail hero refinement.' },
  { version: '0.19.0', date: '2026-03-19', kind: 'minor', descriptor: 'Preview UI, PortableText polish, contact form, card convergence.' },
];

/** Default variant — pink accent header (standard Table styling). */
export const Default: Story = {
  args: {
    variant: 'default',
    columns: releaseColumns,
    rows: releaseRows,
    caption: 'Recent releases',
  },
};

/** Trust variant — subdued header bg (surface-strong), WCAG AA text. */
export const Trust: Story = {
  args: {
    variant: 'trust',
    columns: releaseColumns,
    rows: releaseRows,
    caption: 'Recent releases',
  },
};

/** KindBadge sub-component — all three states. */
export const Badges: Story = {
  name: 'KindBadge (sub-component)',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem' }}>
      <KindBadge kind="minor" />
      <KindBadge kind="patch" />
      <KindBadge kind="major" />
    </div>
  ),
};

/** Mobile scroll — narrow viewport to verify horizontal scroll container. */
export const MobileScroll: Story = {
  name: 'Mobile scroll',
  args: {
    variant: 'trust',
    columns: releaseColumns,
    rows: releaseRows,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    chromatic: { viewports: [375] },
  },
};

/** Snapshot — trust variant for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  args: {
    variant: 'trust',
    columns: releaseColumns,
    rows: releaseRows,
    caption: 'Recent releases — trust variant',
  },
};
