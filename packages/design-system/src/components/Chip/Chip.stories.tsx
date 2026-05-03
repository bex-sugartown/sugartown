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
    color: {
      control: { type: 'select' },
      options: ['pink', 'seafoam', 'lime', 'violet', 'amber', 'grey'],
      description: 'Named colour preset. Overridden by colorHex if both set.',
    },
    colorHex: { control: 'color', description: 'Custom hex colour — overrides named preset' },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
    'aria-label': { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// ─── Render modes ─────────────────────────────────────────────────────────────

/** Default pink chip — static span (no href, no onClick) */
export const StaticSpan: Story = {
  args: { label: 'Design Systems' },
};

/** Link chip — renders as <a> */
export const AsLink: Story = {
  args: { label: 'Knowledge Graph', href: '/knowledge-graph' },
};

/** Button chip — renders as <button>, toggleable */
export const AsButton: Story = {
  args: { label: 'Toggle me', onClick: () => {} },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { label: 'Category', href: '#' },
};

export const Active: Story = {
  args: { label: 'Active Filter', onClick: () => {}, isActive: true },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Small: Story = {
  args: { label: 'sm chip', href: '#', size: 'sm' },
};

export const Medium: Story = {
  args: { label: 'md chip', href: '#', size: 'md' },
};

// ─── Named color presets ──────────────────────────────────────────────────────

/** Pink — Sugartown brand pink (default when no color prop set) */
export const PresetPink: Story = {
  args: { label: 'Design Systems', href: '#', color: 'pink' },
};

/** Seafoam — tools & platforms accent */
export const PresetSeafoam: Story = {
  args: { label: 'TypeScript', href: '#', color: 'seafoam' },
};

/** Lime — evergreen / validated content */
export const PresetLime: Story = {
  args: { label: 'Evergreen', color: 'lime' },
};

/** Violet — project / strategic accent */
export const PresetViolet: Story = {
  args: { label: 'Brand Strategy', href: '#', color: 'violet' },
};

/** Amber — status / warning accent */
export const PresetAmber: Story = {
  args: { label: 'In Progress', color: 'amber' },
};

/** Grey — neutral fallback (no taxonomy color assigned) */
export const PresetGrey: Story = {
  args: { label: 'Uncategorised', href: '#', color: 'grey' },
};

/** All six named presets in a row */
export const AllPresets: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <Chip label="Pink (default)" color="pink" href="#" />
      <Chip label="Seafoam"        color="seafoam" href="#" />
      <Chip label="Lime"           color="lime" href="#" />
      <Chip label="Violet"         color="violet" href="#" />
      <Chip label="Amber"          color="amber" href="#" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

// ─── Color-aware (custom hex override) ────────────────────────────────────────

/** Colour-aware chip using a project/category color via colorHex prop */
export const ColorAwareProject: Story = {
  args: { label: 'Brand Strategy', href: '#', colorHex: '#7C3AED' },
};

export const ColorAwareCategory: Story = {
  args: { label: 'Design Systems', href: '#', colorHex: '#0891B2' },
};

/** colorHex overrides named preset — inline style wins over class */
export const ColorHexOverridesPreset: Story = {
  args: { label: 'Custom Override', href: '#', color: 'pink', colorHex: '#059669' },
};

// ─── All variants — taxonomy chip row ─────────────────────────────────────────

export const TaxonomyChipRow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '600px' }}>
      {/* Projects — violet preset or custom colorHex from project.colorHex */}
      <Chip label="Brand Strategy"    href="#" color="violet" />
      <Chip label="Web Platform"      href="#" colorHex="#0891B2" />
      {/* Categories — custom colorHex from category.colorHex */}
      <Chip label="Design Systems"    href="#" colorHex="#D97706" />
      <Chip label="Engineering"       href="#" colorHex="#059669" />
      {/* Tags — default pink (brand accent) */}
      <Chip label="accessibility"     href="#" />
      <Chip label="performance"       href="#" />
      <Chip label="typography"        href="#" />
      {/* Tools — seafoam preset */}
      <Chip label="TypeScript"        href="#" color="seafoam" />
      <Chip label="React"             href="#" color="seafoam" />
    </div>
  ),
  parameters: { layout: 'padded' },
};

// ─── Filter chips (button mode) ───────────────────────────────────────────────

/** A row of filter chips demonstrating button mode with active state */
export const FilterChipRow: Story = {
  render: () => {
    const [active, setActive] = React.useState<string[]>(['design-systems']);
    const options = [
      { id: 'design-systems', label: 'Design Systems' },
      { id: 'engineering',    label: 'Engineering' },
      { id: 'strategy',       label: 'Strategy' },
      { id: 'accessibility',  label: 'Accessibility' },
    ];
    const toggle = (id: string) =>
      setActive((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {options.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            onClick={() => toggle(opt.id)}
            isActive={active.includes(opt.id)}
          />
        ))}
      </div>
    );
  },
  parameters: { layout: 'padded' },
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

/**
 * Chromatic snapshot — all sizes, presets, and modes composed into a
 * single screenshot for VRT baseline.
 */
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
          <Chip label="Small" href="#" size="sm" />
          <Chip label="Medium (default)" href="#" size="md" />
        </div>
      </div>
      {/* Named presets */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Named Presets</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Pink" color="pink" href="#" />
          <Chip label="Seafoam" color="seafoam" href="#" />
          <Chip label="Lime" color="lime" href="#" />
          <Chip label="Violet" color="violet" href="#" />
          <Chip label="Amber" color="amber" href="#" />
          <Chip label="Grey" color="grey" href="#" />
        </div>
      </div>
      {/* Render modes */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Render Modes</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Static span" />
          <Chip label="Link" href="#" />
          <Chip label="Button" onClick={() => {}} />
          <Chip label="Active button" onClick={() => {}} isActive />
        </div>
      </div>
      {/* Color-aware */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Color-aware (custom hex)</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Brand Strategy" href="#" colorHex="#7C3AED" />
          <Chip label="Engineering" href="#" colorHex="#059669" />
          <Chip label="Design Systems" href="#" colorHex="#D97706" />
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
