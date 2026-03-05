import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    href: { control: 'text' },
    isActive: { control: 'boolean' },
    color: { control: { type: 'select' }, options: [undefined, 'pink', 'seafoam', 'lime', 'violet', 'amber'] },
    colorHex: { control: 'color' },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
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

/** All five named presets in a row */
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

// ─── On void background ───────────────────────────────────────────────────────

export const OnVoidBackground: Story = {
  render: () => (
    <div
      style={{
        background: '#0D1226',
        padding: '2rem',
        borderRadius: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <Chip label="Design Systems" href="#" />
      <Chip label="Engineering"    href="#" />
      <Chip label="Active"         onClick={() => {}} isActive />
      <Chip label="Color Aware"    href="#" colorHex="#7C3AED" />
    </div>
  ),
  parameters: { layout: 'padded' },
};
