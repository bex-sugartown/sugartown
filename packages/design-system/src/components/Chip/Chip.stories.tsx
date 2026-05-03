import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    href: { control: 'text' },
    isActive: { control: 'boolean' },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    onClick: { table: { disable: true } },
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
      {/* Sizes */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Sizes</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <Chip label="Small" href="#" size="sm" variant="tag" />
          <Chip label="Medium (default)" href="#" size="md" variant="tag" />
        </div>
      </div>
      {/* Rule-dot system */}
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
    </div>
  ),
};
