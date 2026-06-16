import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
// @ts-expect-error — @sb-helpers alias is resolved by Storybook's viteFinal; not in tsconfig
import { ChipGuidelinesPage } from '@sb-helpers/ChipDocs';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label:     { control: 'text' },
    href:      { control: 'text' },
    size:      { control: { type: 'select' }, options: ['sm', 'md'] },
    variant:   {
      control: { type: 'select' },
      options: ['tag', 'status'],
      description: '`tag` = neutral gray chassis, no dot, no active state. `status` = uppercase bold badge chassis (planned rename: `"badge"`). When `variant="status"`: dot shown if `color` has a value; no dot if `color` is null.',
      table: { order: 1 },
    },
    status:    { table: { disable: true } },
    featured:  { control: 'boolean' },
    isActive:  {
      control: 'boolean',
      description: 'Active / selected state — solid accent fill, white label. Only applies to default chips (no `variant`). When `color` is set the fill reflects that color.',
    },
    color:     { control: { type: 'select' }, options: [null, 'pink', 'seafoam', 'lime', 'violet', 'amber', 'grey'] },
    // Hidden — internal / advanced props not needed in the controls panel
    children:  { table: { disable: true } },
    colorHex:  { table: { disable: true } },
    dotColor:  { table: { disable: true } },
    onClick:   { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Small: Story = {
  args: { label: 'sm chip', href: '#', size: 'sm', variant: 'tag' },
};

export const Medium: Story = {
  args: { label: 'md chip (default)', href: '#', size: 'md', variant: 'tag' },
};

// ─── Rule-dot system (SUG-88) ─────────────────────────────────────────────────

/** Tag chip — neutral mono box, canonical evidence/taxonomy chip */
export const TagNeutral: Story = {
  args: { label: 'performance', variant: 'tag' },
};

/** Tag chip featured — pink rubric on the first taxonomy chip in a set */
export const TagFeatured: Story = {
  args: { label: 'Design Systems', variant: 'tag', featured: true },
};

/** Badge (no dot) — variant="status" with no color or status prop */
export const BadgeNoDot: Story = {
  name: 'Badge — No Dot',
  args: { label: 'In Review', variant: 'status' },
};

/** Abbreviation badge (SUG-162) — neutral md badge inside a heading,
 *  uppercase, static span (no href), explicit gap from the heading text */
export const AbbreviationBadge: Story = {
  name: 'Badge — Abbreviation (in heading)',
  render: () => (
    <h1 style={{ margin: 0 }}>
      Headless CMS{' '}
      <Chip label="CMS" variant="status" aria-label="Abbreviation: CMS" />
    </h1>
  ),
  parameters: { layout: 'padded' },
};

/** Badge with color dot — color prop drives dot color */
export const StatusColorOverride: Story = {
  name: 'Badge — Color Dot',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <Chip label="Seafoam"  variant="status" color="seafoam" />
      <Chip label="Violet"   variant="status" color="violet" />
      <Chip label="Lime"     variant="status" color="lime" />
      <Chip label="Amber"    variant="status" color="amber" />
      <Chip label="Overrides Evergreen" variant="status" status="evergreen" color="violet" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

/** All six status dot states in a row */
export const AllStatusStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <Chip label="Evergreen"   variant="status" status="evergreen" />
      <Chip label="Validated"   variant="status" status="validated" />
      <Chip label="Exploring"   variant="status" status="exploring" />
      <Chip label="Active"      variant="status" status="active" />
      <Chip label="Draft"       variant="status" status="draft" />
      <Chip label="Deprecated"  variant="status" status="deprecated" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

// ─── dotColor mode — project chips (SUG-118) ─────────────────────────────────

/** All project dotColor variants */
export const AllProjectColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <Chip label="Pink Moon"     dotColor="#ff247d" />
      <Chip label="Mini-repo"     dotColor="#2bd4aa" />
      <Chip label="Sugartown CMS" dotColor="#b8e000" />
      <Chip label="Design System" dotColor="#7C3AED" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT — Chromatic composite (all variants in one screenshot)
// ═══════════════════════════════════════════════════════════════════

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Sizes</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <Chip label="Small" href="#" size="sm" variant="tag" />
          <Chip label="Medium (default)" href="#" size="md" variant="tag" />
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Rule-dot — tag</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Design Systems" variant="tag" featured />
          <Chip label="performance" variant="tag" />
          <Chip label="accessibility" variant="tag" />
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Rule-dot — status</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Evergreen"   variant="status" status="evergreen" />
          <Chip label="Validated"   variant="status" status="validated" />
          <Chip label="Exploring"   variant="status" status="exploring" />
          <Chip label="Active"      variant="status" status="active" />
          <Chip label="Draft"       variant="status" status="draft" />
          <Chip label="Deprecated"  variant="status" status="deprecated" />
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>dotColor — project chips</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Pink Moon"     dotColor="#ff247d" />
          <Chip label="Mini-repo"     dotColor="#2bd4aa" />
          <Chip label="Sugartown CMS" dotColor="#b8e000" />
          <Chip label="Design System" dotColor="#7C3AED" />
        </div>
      </div>
    </div>
  ),
};

// ─── Guidelines ───────────────────────────────────────────────────────────────

export const Guidelines: Story = {
  name: 'Guidelines',
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
  render: () => <ChipGuidelinesPage />,
};

