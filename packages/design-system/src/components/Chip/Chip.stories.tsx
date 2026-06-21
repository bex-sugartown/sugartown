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
    label:    { control: 'text' },
    href:     { control: 'text' },
    size:     { control: { type: 'select' }, options: ['sm', 'md'] },
    variant:  {
      control: { type: 'select' },
      options: ['tag', 'badge'],
      description: '`tag` — neutral gray chassis, no dot, no active state. Use for taxonomy labels. `badge` — uppercase bold chassis with optional dot. Use for status labels, project tags, and abbreviations.',
      table: { order: 1 },
    },
    featured: { control: 'boolean', description: 'Pink rubric — first-child taxonomy highlight. Only applied when `variant="tag"`.' },
    isActive: {
      control: 'boolean',
      description: 'Active / selected state — solid accent fill, white label. Only applies to default chips (no `variant`). When `color` is set the fill reflects that color.',
    },
    color:    { control: { type: 'select' }, options: [null, 'pink', 'seafoam', 'lime', 'violet', 'amber', 'grey'] },
    status:   { table: { disable: true } },
    children: { table: { disable: true } },
    colorHex: { table: { disable: true } },
    dotColor: { table: { disable: true } },
    onClick:  { table: { disable: true } },
    className:{ table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// ─── Tag variant ──────────────────────────────────────────────────────────────

/** Tag chip — neutral chassis, no dot, no active state. Use for taxonomy labels. */
export const Tag: Story = {
  args: { label: 'Design Systems', variant: 'tag' },
};

// ─── Badge variant ────────────────────────────────────────────────────────────

/** Badge — label-only, uppercase bold chassis. No dot. */
export const Badge: Story = {
  args: { label: 'In Review', variant: 'badge' },
};

/** Badge with color dot — named color presets drive dot color. */
export const BadgeWithDot: Story = {
  name: 'Badge — Color Dot',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <Chip label="Seafoam"  variant="badge" color="seafoam" />
      <Chip label="Violet"   variant="badge" color="violet" />
      <Chip label="Lime"     variant="badge" color="lime" />
      <Chip label="Amber"    variant="badge" color="amber" />
      <Chip label="Grey"     variant="badge" color="grey" />
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
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Rule-dot — badge</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Evergreen"   variant="badge" status="evergreen" />
          <Chip label="Validated"   variant="badge" status="validated" />
          <Chip label="Exploring"   variant="badge" status="exploring" />
          <Chip label="Active"      variant="badge" status="active" />
          <Chip label="Draft"       variant="badge" status="draft" />
          <Chip label="Deprecated"  variant="badge" status="deprecated" />
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

