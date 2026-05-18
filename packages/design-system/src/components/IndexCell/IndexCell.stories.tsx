import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IndexCell } from './IndexCell';

const meta: Meta<typeof IndexCell> = {
  title: 'Components/IndexCell',
  component: IndexCell,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: ['default', 'active', 'selected', 'inactive'],
    },
    as: {
      control: { type: 'select' },
      options: ['button', 'a', 'span'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof IndexCell>;

// ─── States ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { state: 'default', children: 'A' },
};

export const Active: Story = {
  args: { state: 'active', children: 'B' },
};

export const Selected: Story = {
  args: { state: 'selected', children: 'C' },
};

export const Inactive: Story = {
  args: { state: 'inactive', children: 'D', as: 'span' },
};

// ─── As anchor ────────────────────────────────────────────────────────────────

export const AsAnchor: Story = {
  args: { state: 'active', as: 'a', href: '#', children: 'E' },
};

// ─── All states side by side ──────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      <IndexCell state="default">A</IndexCell>
      <IndexCell state="active">B</IndexCell>
      <IndexCell state="selected">C</IndexCell>
      <IndexCell state="inactive" as="span">D</IndexCell>
    </div>
  ),
};
