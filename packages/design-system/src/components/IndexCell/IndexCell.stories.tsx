import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IndexCell } from './IndexCell';

/**
 * IndexCell — a single square cell for index / filter strips (A–Z letter filters,
 * pagination, schema group toggles). Composed by `IndexGroup`.
 *
 * Three states (matching the canonical web rendering):
 * - **active** — has content; clickable. Hover → pink border + pink text.
 * - **selected** — currently chosen; solid pink fill, white text. Hover → maroon.
 * - **inactive** — no content; muted border/text, non-interactive (render `as="span"`).
 *
 * Hover is a CSS `:hover` state on `active`/`selected` — not a prop. Hover over the
 * interactive cells below to see the transition.
 */
const meta: Meta<typeof IndexCell> = {
  title: 'Components/IndexCell',
  component: IndexCell,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    state: {
      description: 'Visual + interactive state',
      control: { type: 'inline-radio' },
      options: ['active', 'selected', 'inactive'],
      table: { type: { summary: "'active' | 'selected' | 'inactive'" }, defaultValue: { summary: 'active' } },
    },
    as: {
      description: 'Rendered element. Use `span` for inactive cells.',
      control: { type: 'inline-radio' },
      options: ['button', 'a', 'span'],
      table: { type: { summary: "'button' | 'a' | 'span'" }, defaultValue: { summary: 'button' } },
    },
    href: {
      description: 'Destination when `as="a"`.',
      control: { type: 'text' },
    },
    children: {
      description: 'Cell label (single character or short string).',
      control: { type: 'text' },
    },
    // Pass-through props — kept out of the Controls table to keep the API focused.
    onClick: { table: { disable: true } },
    'aria-pressed': { table: { disable: true } },
    'aria-label': { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: { state: 'active', children: 'A' },
};

export default meta;
type Story = StoryObj<typeof IndexCell>;

// ─── States ───────────────────────────────────────────────────────────────────

export const Active: Story = {
  args: { state: 'active', children: 'B' },
};

export const Selected: Story = {
  args: { state: 'selected', children: 'C' },
};

export const Inactive: Story = {
  args: { state: 'inactive', as: 'span', children: 'D' },
};

// ─── As anchor ────────────────────────────────────────────────────────────────

export const AsAnchor: Story = {
  args: { state: 'active', as: 'a', href: '#', children: 'E' },
};

// ─── All states side by side ──────────────────────────────────────────────────

export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--st-index-cell-gap, 2px)' }}>
      <IndexCell state="active">A</IndexCell>
      <IndexCell state="selected">B</IndexCell>
      <IndexCell state="inactive" as="span">C</IndexCell>
    </div>
  ),
};
