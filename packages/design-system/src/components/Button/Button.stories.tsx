import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
    <rect x="3" y="7" width="10" height="1.5" rx="0.75" />
    <rect x="5" y="11" width="6" height="1.5" rx="0.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="2,8 6,12 14,4" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Three-variant button (Pink Moon · Ledger Tradition — SUG-174). ' +
          'Primary (pink fill), Secondary (lime fill), Tertiary (ghost: signal color default, gray hover). ' +
          'Baseline Rule (3px bottom border + translateY lift from SUG-116) removed. ' +
          'Supports `icon` (left or right via `iconPosition`), `iconAfter` (always right), `size` (sm / md / lg), and `disabled`. ' +
          'Ghost tertiary: brand pink in light theme, lime in dark theme — via token cascade, no explicit dark-mode block.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size modifier — sm / md (default) / lg',
    },
    disabled: { control: 'boolean', description: 'Disables interaction and dims the button' },
    children: { control: 'text', description: 'Button label text' },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: '`icon` placement — left (default) or right',
    },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
    icon: { table: { disable: true } },
    iconAfter: { table: { disable: true } },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

/* ══════════════════════════════════════════════════════
   SINGLE-VARIANT STORIES
   ══════════════════════════════════════════════════════ */

export const Primary: Story = {
  args: { children: 'Primary Button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary Button', variant: 'secondary' },
};

export const Tertiary: Story = {
  args: { children: 'Tertiary Button', variant: 'tertiary' },
};

export const Disabled: Story = {
  args: { children: 'Disabled Button', disabled: true },
};

export const LongLabel: Story = {
  args: {
    children: 'Platform selection risk is real — here is what reduces it',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: { children: 'Loading…', variant: 'primary', disabled: true },
};

/* ══════════════════════════════════════════════════════
   ALL VARIANTS
   ══════════════════════════════════════════════════════ */

export const AllVariants: Story = {
  name: 'All Variants',
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

/* ══════════════════════════════════════════════════════
   ICON PROP STORIES
   ══════════════════════════════════════════════════════ */

export const IconLeft: Story = {
  name: 'Icon — left (default)',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" icon={<FilterIcon />}>Primary</Button>
      <Button variant="secondary" icon={<FilterIcon />}>Secondary</Button>
      <Button variant="tertiary" icon={<XIcon />}>Clear all</Button>
    </div>
  ),
};

export const IconRight: Story = {
  name: 'Icon — right (iconPosition)',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" icon={<CheckIcon />} iconPosition="right">Done</Button>
      <Button variant="secondary" icon={<FilterIcon />} iconPosition="right">Filter</Button>
      <Button variant="tertiary" icon={<XIcon />} iconPosition="right">Dismiss</Button>
    </div>
  ),
};

export const IconBothEnds: Story = {
  name: 'Icon — both ends (icon + iconAfter)',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" icon={<FilterIcon />} iconAfter={<CheckIcon />}>Filter &amp; Apply</Button>
      <Button variant="tertiary" icon={<XIcon />} iconAfter={<FilterIcon />}>Clear · Filter</Button>
    </div>
  ),
};

export const DrawerFooterPair: Story = {
  name: 'Drawer footer pair',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', width: '280px' }}>
      <Button variant="tertiary" size="sm" icon={<XIcon />} style={{ flex: 1 }}>Clear all</Button>
      <Button variant="primary" size="sm" iconAfter={<CheckIcon />} style={{ flex: 1 }}>Done</Button>
    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   CHROMATIC SNAPSHOTS
   ══════════════════════════════════════════════════════ */

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
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
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Icons</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" icon={<FilterIcon />}>Icon left</Button>
          <Button variant="primary" iconAfter={<CheckIcon />}>Icon right</Button>
          <Button variant="tertiary" icon={<XIcon />} iconAfter={<FilterIcon />}>Both ends</Button>
        </div>
      </div>
    </div>
  ),
};
