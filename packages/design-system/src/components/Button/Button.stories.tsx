import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Three-variant button component (SUG-116 · Baseline Rule / Ledger Tradition). ' +
          'Primary (pink fill, dark-pink bottom rule), Secondary (lime fill, lime-dark rule), Tertiary (neutral fill, neutral rule). ' +
          '3px bottom-edge rule grounds the stamp — aligns with the Ledger Tradition physical reference. ' +
          'Supports `size` prop (`sm` / `md` / `lg`) and `disabled` / `aria-disabled`. ' +
          'Hover: `translateY(-3px)` lift + shadow. ' +
          'Supports the **Pink Moon** theme via `data-theme="dark-pink-moon"` on a parent element.',
      },
    },
  },
  argTypes: {
    // Options synced with schemas/objects/ctaButton.ts → style (SUG-47)
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual variant — determines fill colour and baseline rule colour',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size modifier — sm / md (default) / lg',
    },
    disabled: { control: 'boolean', description: 'Disables interaction and dims the button' },
    children: { control: 'text', description: 'Button label text' },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ══════════════════════════════════════════════════════
   DEFAULT THEME
   ══════════════════════════════════════════════════════ */

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    variant: 'tertiary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const LongLabel: Story = {
  args: {
    children: 'This is a very long button label that tests layout overflow behaviour',
    variant: 'primary',
  },
};

// TODO: add loading prop to ButtonProps when a spinner/loading state is designed
export const Loading: Story = {
  args: {
    children: 'Loading…',
    variant: 'primary',
    disabled: true,
  },
};

export const AllVariants: Story = {
  name: 'All Variants — Baseline Rule',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="primary" disabled>Primary Disabled</Button>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
      <Button variant="tertiary" disabled>Tertiary Disabled</Button>
    </div>
  ),
};

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT — Chromatic composite (all variants in one screenshot)
// ═══════════════════════════════════════════════════════════════════

/**
 * Chromatic snapshot — variants, states, sizes, and long label.
 * Updated for SUG-116 Baseline Rule to include sm/md/lg size row.
 */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Variants</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>States</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Default</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Sizes</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Long label</h4>
        <Button variant="primary">Platform selection risk is real — here is what reduces it</Button>
      </div>
    </div>
  ),
};
