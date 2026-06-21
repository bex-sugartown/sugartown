import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Check, X, ExternalLink, Plus } from 'lucide-react';
import { Button } from './Button';

const ICON_SIZE = 14;

const ICON_MAP: Record<string, React.ReactNode> = {
  none:          undefined,
  ArrowRight:    <ArrowRight size={ICON_SIZE} aria-hidden />,
  Check:         <Check size={ICON_SIZE} aria-hidden />,
  X:             <X size={ICON_SIZE} aria-hidden />,
  ExternalLink:  <ExternalLink size={ICON_SIZE} aria-hidden />,
  Plus:          <Plus size={ICON_SIZE} aria-hidden />,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Three-variant button (Pink Moon · Ledger Tradition — SUG-174). ' +
          'Primary (pink fill), Secondary (lime fill), Tertiary (ghost: signal colour default, grey hover). ' +
          'Supports `iconBefore` and `iconAfter` for start/end icon slots, `size` (sm / md / lg), and `disabled`. ' +
          'Ghost tertiary: brand pink in light theme, lime in dark theme — via token cascade.',
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
    children: { control: 'text', description: 'Button label text', table: { type: { summary: 'ReactNode' } } },
    iconBefore: {
      control: { type: 'select' },
      options: ICON_OPTIONS,
      mapping: ICON_MAP,
      description: 'Icon at the start (left) of the label',
    },
    iconAfter: {
      control: { type: 'select' },
      options: ICON_OPTIONS,
      mapping: ICON_MAP,
      description: 'Icon at the end (right) of the label',
    },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Primary Button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary Button', variant: 'secondary' },
};

export const Tertiary: Story = {
  args: { children: 'Tertiary Button', variant: 'tertiary' },
};

// Chromatic VRT — all variant × state combinations in one snapshot
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>Variants</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>Disabled</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="tertiary" disabled>Tertiary</Button>
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>Sizes</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>Icons</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" iconBefore={<ArrowRight size={ICON_SIZE} aria-hidden />}>Start</Button>
          <Button variant="primary" iconAfter={<ArrowRight size={ICON_SIZE} aria-hidden />}>End</Button>
          <Button variant="primary" iconBefore={<Plus size={ICON_SIZE} aria-hidden />} iconAfter={<ArrowRight size={ICON_SIZE} aria-hidden />}>Both</Button>
          <Button variant="tertiary" iconBefore={<X size={ICON_SIZE} aria-hidden />}>Clear</Button>
          <Button variant="secondary" iconAfter={<ExternalLink size={ICON_SIZE} aria-hidden />}>Open</Button>
        </div>
      </div>
    </div>
  ),
};
