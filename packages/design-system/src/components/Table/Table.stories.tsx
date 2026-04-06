import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableWrap } from './Table';

/**
 * ## Table
 *
 * Semantic `<table>` component with three variants:
 * - **default** — base styles with pink accent header + automatic zebra striping
 * - **responsive** — mobile card layout at ≤860 px (rows become stacked cards)
 * - **wide** — `table-layout: fixed` with column width tokens (`st-col--*`)
 *
 * Canonical CSS: `artifacts/style 260118.css` §02 + §ST TABLE
 *
 * @see {@link https://sugartown.dev/design-system | Sugartown Design System}
 */
const meta: Meta<typeof Table> = {
  title: 'Primitives/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'responsive', 'wide'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Status</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Button</td>
          <td>Stable</td>
          <td>1.0.0</td>
        </tr>
        <tr>
          <td>Card</td>
          <td>Stable</td>
          <td>1.2.0</td>
        </tr>
        <tr>
          <td>Chip</td>
          <td>Stable</td>
          <td>1.1.0</td>
        </tr>
        <tr>
          <td>Table</td>
          <td>New</td>
          <td>0.1.0</td>
        </tr>
        <tr>
          <td>Callout</td>
          <td>New</td>
          <td>0.1.0</td>
        </tr>
      </tbody>
    </Table>
  ),
};

// ── Responsive (mobile card layout) ──────────────────────────────────────────
// Resize the viewport to ≤860 px to see rows become stacked cards.

export const Responsive: Story = {
  render: () => (
    <TableWrap>
      <Table variant="responsive">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Becky Alice Head</td>
            <td>Design Engineer</td>
            <td>Active</td>
            <td>Jan 2023</td>
          </tr>
          <tr>
            <td>Claude</td>
            <td>AI Collaborator</td>
            <td>Active</td>
            <td>Mar 2024</td>
          </tr>
          <tr>
            <td>Legacy WordPress</td>
            <td>CMS (deprecated)</td>
            <td>Migrated</td>
            <td>2018</td>
          </tr>
        </tbody>
      </Table>
    </TableWrap>
  ),
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
};

// ── Wide (fixed layout with column tokens) ───────────────────────────────────

export const Wide: Story = {
  render: () => (
    <TableWrap>
      <Table variant="wide">
        <colgroup>
          <col className="st-col--sm" />
          <col className="st-col--flex-md" />
          <col className="st-col--xs" />
          <col className="st-col--flex-lg" />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Score</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>001</td>
            <td>Token-Driven Design Systems</td>
            <td>98</td>
            <td>Extracted three-tier token architecture from live WordPress theme.</td>
          </tr>
          <tr>
            <td>002</td>
            <td>Variable Fonts in Production</td>
            <td>87</td>
            <td>Subsetting strategies cut font load time by 60%.</td>
          </tr>
          <tr>
            <td>003</td>
            <td>The Great iCloud Divorce</td>
            <td>92</td>
            <td>How we learned to stop worrying and love structured content.</td>
          </tr>
        </tbody>
      </Table>
    </TableWrap>
  ),
};

// ── With Thumbnails ──────────────────────────────────────────────────────────

export const WithThumbnails: Story = {
  render: () => (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="st-table__thumb">
              <img
                src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=100&h=100&fit=crop&crop=top"
                alt="Placeholder thumbnail"
              />
            </td>
            <td>Design System Architecture</td>
            <td>Case Study</td>
          </tr>
          <tr>
            <td className="st-table__thumb">
              <img
                src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=100&h=100&fit=crop&crop=center"
                alt="Placeholder thumbnail"
              />
            </td>
            <td>Typography at Scale</td>
            <td>Article</td>
          </tr>
          <tr>
            <td className="st-table__thumb">
              <img
                src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=100&h=100&fit=crop&crop=bottom"
                alt="Placeholder thumbnail"
              />
            </td>
            <td>Atomic Design Methodology</td>
            <td>Node</td>
          </tr>
        </tbody>
      </Table>
    </TableWrap>
  ),
};

// ── Stress Test: Long Content ────────────────────────────────────────────────

export const StressTestLongContent: Story = {
  name: 'Stress Test / Long Content',
  render: () => (
    <Table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Description</td>
          <td>
            This is an extremely long piece of text that is designed to test
            overflow-wrap behavior within table cells. It includes long words like
            supercalifragilisticexpialidocious and URLs like
            https://sugartown.dev/design-system/components/table/responsive-variant-documentation
            to verify that the table handles word breaks correctly without breaking the layout
            or causing horizontal overflow on the parent container.
          </td>
        </tr>
        <tr>
          <td>Notes</td>
          <td>Short cell for contrast.</td>
        </tr>
      </tbody>
    </Table>
  ),
};

// ── Stress Test: Single Column ───────────────────────────────────────────────

export const StressTestSingleColumn: Story = {
  name: 'Stress Test / Single Column',
  render: () => (
    <Table>
      <thead>
        <tr>
          <th>Item</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Button</td></tr>
        <tr><td>Card</td></tr>
        <tr><td>Chip</td></tr>
        <tr><td>FilterBar</td></tr>
        <tr><td>Table</td></tr>
      </tbody>
    </Table>
  ),
};

// ── Stress Test: Many Columns ────────────────────────────────────────────────

export const StressTestManyColumns: Story = {
  name: 'Stress Test / Many Columns',
  render: () => (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            {Array.from({ length: 12 }, (_, i) => (
              <th key={i}>Col {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: 12 }, (_, col) => (
                <td key={col}>R{row + 1}C{col + 1}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  ),
};
