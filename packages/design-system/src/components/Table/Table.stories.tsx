import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableWrap } from './Table';

/**
 * ## Table
 *
 * Single DS table primitive with two tones:
 * - **accent** (default) — pink header, zebra rows on
 * - **subdued** — neutral header, zebra rows off, caption surface optional
 *
 * Accepts either `columns` + `rows` props (preferred) or raw `children` fallback.
 * Caption + thead pin sticky via `--st-table-sticky-offset` on the wrapper.
 */
const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
  args: { tone: 'accent' },
  argTypes: {
    tone: {
      control: { type: 'select' },
      options: ['accent', 'subdued'],
      description: '`accent`: pink header, zebra rows on. `subdued`: neutral header, zebra rows off.',
    },
    zebra: {
      control: 'boolean',
      description: 'Alternate row shading. Defaults to on for `accent`, off for `subdued`.',
    },
    density: { control: { type: 'select' }, options: ['comfortable', 'compact'] },
    layout:  { control: { type: 'select' }, options: ['auto', 'fixed'] },
    variant: { control: { type: 'select' }, options: ['default', 'responsive', 'wide'] },
    columns:   { table: { disable: true } },
    rows:      { table: { disable: true } },
    children:  { table: { disable: true } },
    className: { table: { disable: true } },
    style:     { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// ── Shared fixture ────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'component', label: 'Component' },
  { key: 'status',    label: 'Status',  width: 120 },
  { key: 'version',   label: 'Version', width: 100 },
];

const ROWS = [
  { component: 'Button',   status: 'Stable', version: '1.0.0' },
  { component: 'Card',     status: 'Stable', version: '1.2.0' },
  { component: 'Chip',     status: 'Stable', version: '1.1.0' },
  { component: 'Table',    status: 'New',    version: '2.0.0' },
  { component: 'Callout',  status: 'New',    version: '0.1.0' },
];

// ── Accent (default) ──────────────────────────────────────────────────────────

export const Accent: Story = {
  args: { tone: 'accent' },
  render: (args) => (
    <TableWrap>
      <Table columns={COLUMNS} rows={ROWS} {...args} />
    </TableWrap>
  ),
};

// ── Responsive (cell labels below 860px, ST-175) ──────────────────────────────

export const ResponsiveLabels: Story = {
  name: 'Responsive / Cell labels at 375px',
  args: { variant: 'responsive' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <TableWrap>
      <Table columns={COLUMNS} rows={ROWS} {...args} />
    </TableWrap>
  ),
};

// ── Subdued ───────────────────────────────────────────────────────────────────

export const Subdued: Story = {
  args: { tone: 'subdued', zebra: false },
  render: (args) => (
    <TableWrap caption="Component registry" captionMeta="5 components">
      <Table columns={COLUMNS} rows={ROWS} {...args} />
    </TableWrap>
  ),
};

// ── Children fallback (raw thead/tbody) ───────────────────────────────────────
// For callers that need fine-grained cell control.

export const ChildrenFallback: Story = {
  name: 'Children fallback (raw markup)',
  render: (args) => (
    <TableWrap>
      <Table {...args}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Button</td><td>Stable</td><td>1.0.0</td></tr>
          <tr><td>Card</td><td>Stable</td><td>1.2.0</td></tr>
          <tr><td>Chip</td><td>Stable</td><td>1.1.0</td></tr>
        </tbody>
      </Table>
    </TableWrap>
  ),
};

// ── Stress test: long content ─────────────────────────────────────────────────

export const StressTestLongContent: Story = {
  name: 'Stress Test / Long Content',
  render: (args) => (
    <TableWrap>
      <Table
        {...args}
        columns={[
          { key: 'field', label: 'Field', width: 120 },
          { key: 'value', label: 'Value' },
        ]}
        rows={[
          {
            field: 'Description',
            value: 'This is an extremely long piece of text designed to test overflow-wrap behavior within table cells. It includes long words like supercalifragilisticexpialidocious and URLs like https://sugartown.dev/design-system/components/table/responsive-variant-documentation to verify that the table handles word breaks correctly.',
          },
          { field: 'Notes', value: 'Short cell for contrast.' },
        ]}
      />
    </TableWrap>
  ),
};

// ── Stress test: many columns ─────────────────────────────────────────────────

export const StressTestManyColumns: Story = {
  name: 'Stress Test / Many Columns',
  render: (args) => (
    <TableWrap>
      <Table
        {...args}
        columns={Array.from({ length: 8 }, (_, i) => ({ key: `col${i}`, label: `Col ${i + 1}` }))}
        rows={Array.from({ length: 5 }, (_, row) =>
          Object.fromEntries(Array.from({ length: 8 }, (_, col) => [`col${col}`, `R${row + 1}C${col + 1}`]))
        )}
      />
    </TableWrap>
  ),
};
