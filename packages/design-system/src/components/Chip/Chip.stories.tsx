import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
// @ts-ignore — @sb-helpers alias is resolved by Storybook's viteFinal; not in tsconfig
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
      description: 'Rule-dot variant. `tag` = neutral mono box. `status` = semantic dot (dot colour driven by `status` prop; dot hidden when `status` is null).',
      table: { order: 1 },
    },
    status:    { control: { type: 'select' }, table: { order: 2 } },
    featured:  { control: 'boolean' },
    isActive:  {
      control: 'boolean',
      description: 'Active / selected state — solid accent fill, white label. Has no effect when `color` or `colorHex` is set; the accent fill reflects the `color` value instead.',
    },
    color:     { control: { type: 'select' } },
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

/** Status chip — evergreen (solid/stable content, no planned revision) */
export const StatusEvergreen: Story = {
  args: { label: 'Evergreen', variant: 'status', status: 'evergreen' },
};

/** Status chip — validated (evidence-backed, peer reviewed) */
export const StatusValidated: Story = {
  args: { label: 'Validated', variant: 'status', status: 'validated' },
};

/** Status chip — exploring (hypothesis, early signal) */
export const StatusExploring: Story = {
  args: { label: 'Exploring', variant: 'status', status: 'exploring' },
};

/** Status chip — active (in use / in-progress work) */
export const StatusActive: Story = {
  args: { label: 'Active', variant: 'status', status: 'active' },
};

/** Status chip — draft (not yet published or in review) */
export const StatusDraft: Story = {
  args: { label: 'Draft', variant: 'status', status: 'draft' },
};

/** Status chip — deprecated (superseded or retired) */
export const StatusDeprecated: Story = {
  args: { label: 'Deprecated', variant: 'status', status: 'deprecated' },
};

/** Status chip with color override — color prop drives dot when variant="status" */
export const StatusColorOverride: Story = {
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

/** Project chip with inline hex dot — Pink Moon project */
export const ProjectPinkMoon: Story = {
  args: { label: 'Pink Moon', dotColor: '#ff247d' },
};

/** Project chip — Mini-repo */
export const ProjectMiniRepo: Story = {
  args: { label: 'Mini-repo', dotColor: '#2bd4aa' },
};

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

