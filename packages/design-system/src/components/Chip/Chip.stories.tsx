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

// ─── Color-aware ──────────────────────────────────────────────────────────────

/** Colour-aware chip using a project/category color via colorHex prop */
export const ColorAwareProject: Story = {
  args: { label: 'Brand Strategy', href: '#', colorHex: '#7C3AED' },
};

export const ColorAwareCategory: Story = {
  args: { label: 'Design Systems', href: '#', colorHex: '#0891B2' },
};

/** Tag chip — no colorHex, renders in default grey neutral */
export const TagNeutral: Story = {
  args: { label: 'accessibility', href: '#', colorHex: '#9CA3AF' },
};

// ─── All variants — taxonomy chip row ─────────────────────────────────────────

export const TaxonomyChipRow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '600px' }}>
      {/* Projects */}
      <Chip label="Brand Strategy"    href="#" colorHex="#7C3AED" />
      <Chip label="Web Platform"      href="#" colorHex="#0891B2" />
      {/* Categories */}
      <Chip label="Design Systems"    href="#" colorHex="#D97706" />
      <Chip label="Engineering"       href="#" colorHex="#059669" />
      {/* Tags — neutral grey */}
      <Chip label="accessibility"     href="#" colorHex="#9CA3AF" />
      <Chip label="performance"       href="#" colorHex="#9CA3AF" />
      <Chip label="typography"        href="#" colorHex="#9CA3AF" />
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
