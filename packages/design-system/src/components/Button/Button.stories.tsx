import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Three-variant button component from the Sugartown design system. ' +
          'Primary (pink/void), Secondary (lime/void), Tertiary (transparent/pink outline). ' +
          'All variants lift on hover with a brand-coloured glow shadow. ' +
          'Supports the **Pink Moon** theme via `data-theme="dark-pink-moon"` or `data-theme="light-pink-moon"` on a parent element, ' +
          'shifting to frosted-glass pill style with edge-light accents.',
      },
    },
  },
  argTypes: {
    // Options synced with schemas/objects/ctaButton.ts → style (SUG-47)
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual variant — determines fill colour and hover glow',
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

export const OnDarkBackground: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '2rem',
        background: '#0D1226',
        borderRadius: '12px',
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   PINK MOON THEME
   Wrap with data-theme="dark-pink-moon" to activate the
   frosted-glass overrides. The background below the
   buttons is representative — the glass needs a backdrop
   to read correctly.
   ══════════════════════════════════════════════════════ */

/** Shared wrapper that provides the Pink Moon context + a representative backdrop */
const PinkMoonFrame = ({ children }: { children: React.ReactNode }) => (
  <div
    data-theme="dark-pink-moon"
    style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '2.5rem',
      // Soft gradient backdrop so the frosted glass reads
      background:
        'linear-gradient(135deg, rgba(255,36,125,0.07) 0%, rgba(255,255,255,0) 55%), ' +
        'linear-gradient(220deg, rgba(209,255,29,0.06) 0%, rgba(255,255,255,0) 60%), ' +
        '#eef0f5',
      borderRadius: '16px',
    }}
  >
    {children}
  </div>
);

export const PinkMoonPrimary: Story = {
  name: 'Pink Moon / Primary',
  render: () => (
    <PinkMoonFrame>
      <Button variant="primary">Primary</Button>
      <Button variant="primary" disabled>Primary Disabled</Button>
    </PinkMoonFrame>
  ),
};

export const PinkMoonSecondary: Story = {
  name: 'Pink Moon / Secondary',
  render: () => (
    <PinkMoonFrame>
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
    </PinkMoonFrame>
  ),
};

export const PinkMoonTertiary: Story = {
  name: 'Pink Moon / Tertiary',
  render: () => (
    <PinkMoonFrame>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="tertiary" disabled>Tertiary Disabled</Button>
    </PinkMoonFrame>
  ),
};

export const PinkMoonAllVariants: Story = {
  name: 'Pink Moon / All Variants',
  render: () => (
    <PinkMoonFrame>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="primary" disabled>Primary Disabled</Button>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
      <Button variant="tertiary" disabled>Tertiary Disabled</Button>
    </PinkMoonFrame>
  ),
};

export const PinkMoonOnVoid: Story = {
  name: 'Pink Moon / On Void',
  render: () => (
    <div
      data-theme="dark-pink-moon"
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '2.5rem',
        background: '#0D1226',
        borderRadius: '16px',
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
};
