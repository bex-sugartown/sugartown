import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LaneHeader } from './LaneHeader';

const meta: Meta<typeof LaneHeader> = {
  title: 'Components/LaneHeader',
  component: LaneHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    count: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof LaneHeader>;

export const Default: Story = {
  args: { label: 'In progress', count: 3 },
};

export const Backlog: Story = {
  args: { label: 'Backlog', count: 12 },
};

export const NoCount: Story = {
  args: { label: 'In progress' },
};

/** Scroll to see the pinned state with lead bar and PINNED badge */
export const ScrollToPinned: Story = {
  render: (args) => (
    <div style={{ height: '200vh', position: 'relative' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
        ↓ Scroll down to see pinned state
      </p>
      <LaneHeader {...args} />
      <div style={{ paddingTop: '24px' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: '12px' }}>
            Row {i + 1}
          </div>
        ))}
      </div>
    </div>
  ),
  args: { label: 'In progress', count: 3 },
  parameters: { layout: 'fullscreen' },
};
