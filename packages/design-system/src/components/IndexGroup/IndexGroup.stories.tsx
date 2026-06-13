import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IndexGroup } from './IndexGroup';
import { IndexCell } from '../IndexCell/IndexCell';

const ALL_LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const meta: Meta<typeof IndexGroup> = {
  title: 'Components/IndexGroup',
  component: IndexGroup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: {
      description: 'Accessible label for the group (role="group").',
      control: { type: 'text' },
      table: { defaultValue: { summary: 'Index navigation' } },
    },
    children: {
      description: 'IndexCell elements.',
      table: { disable: true },
    },
    className: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof IndexGroup>;

// ─── Full 27-letter strip ─────────────────────────────────────────────────────

export const FullStrip: Story = {
  render: () => (
    <IndexGroup label="Filter by letter">
      {ALL_LETTERS.map((l) => (
        <IndexCell key={l} state="active">{l}</IndexCell>
      ))}
    </IndexGroup>
  ),
};

// ─── Partial strip (some inactive) ───────────────────────────────────────────

export const PartialStrip: Story = {
  render: () => {
    const active = new Set(['A', 'B', 'D', 'E', 'M', 'S', 'T']);
    return (
      <IndexGroup label="Filter by letter">
        {ALL_LETTERS.map((l) => (
          <IndexCell key={l} state={active.has(l) ? 'active' : 'inactive'} as={active.has(l) ? 'button' : 'span'}>
            {l}
          </IndexCell>
        ))}
      </IndexGroup>
    );
  },
};

// ─── With selected ────────────────────────────────────────────────────────────

export const WithSelected: Story = {
  render: () => {
    const active = new Set(['A', 'B', 'C', 'D', 'E']);
    const selected = 'C';
    return (
      <IndexGroup label="Filter by letter">
        {ALL_LETTERS.map((l) => (
          <IndexCell
            key={l}
            state={!active.has(l) ? 'inactive' : l === selected ? 'selected' : 'active'}
            as={active.has(l) ? 'button' : 'span'}
          >
            {l}
          </IndexCell>
        ))}
      </IndexGroup>
    );
  },
};
