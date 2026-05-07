import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScoreRing } from './ScoreRing';

const meta: Meta<typeof ScoreRing> = {
  title: 'Components/ScoreRing',
  component: ScoreRing,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    score:       { control: { type: 'range', min: 0, max: 100 } },
    size:        { control: { type: 'range', min: 48, max: 160, step: 8 } },
    strokeWidth: { control: { type: 'range', min: 3, max: 12 } },
    category:    { control: { type: 'select' }, options: [undefined, 'good', 'warn', 'poor'] },
    label:       { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ScoreRing>;

export const Good: Story = {
  args: { score: 96, label: 'Performance' },
};

export const Warn: Story = {
  args: { score: 67, label: 'Performance' },
};

export const Poor: Story = {
  args: { score: 34, label: 'Performance' },
};

export const BoundaryEdge: Story = {
  name: 'Boundary — 90 (good/warn edge)',
  args: { score: 90, label: 'Accessibility' },
};

export const AllThree: Story = {
  name: 'All three categories',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <ScoreRing score={96} label="Performance" />
      <ScoreRing score={67} label="SEO" />
      <ScoreRing score={34} label="Best Practices" />
    </div>
  ),
};

export const LargeSize: Story = {
  args: { score: 91, label: 'Performance', size: 120, strokeWidth: 8 },
};

export const NoLabel: Story = {
  args: { score: 78 },
};
