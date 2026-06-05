import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Swatch } from './Swatch';

const PRIORITY = {
  high:   { color: 'var(--st-pri-high)',  label: 'High' },
  medium: { color: 'var(--st-pri-med)',   label: 'Medium' },
  low:    { color: 'var(--st-pri-low)',   label: 'Low' },
  none:   { color: null,                  label: 'No priority' },
}

const meta: Meta<typeof Swatch> = {
  title: 'Components/Swatch',
  component: Swatch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    color: { control: 'text' },
    label: { control: 'text' },
    size:  { control: { type: 'number', min: 4, max: 24 } },
  },
};

export default meta;
type Story = StoryObj<typeof Swatch>;

export const High:   Story = { args: PRIORITY.high };
export const Medium: Story = { args: PRIORITY.medium };
export const Low:    Story = { args: PRIORITY.low };
export const None:   Story = { args: PRIORITY.none };

export const AllPriorityLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      {Object.values(PRIORITY).map((p) => (
        <Swatch key={p.label} color={p.color} label={p.label} />
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      {[6, 8, 10, 14].map((size) => (
        <Swatch key={size} color={PRIORITY.high.color} label={`${size}px`} size={size} />
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      {Object.values(PRIORITY).map((p) => (
        <Swatch key={p.label} color={p.color} label={p.label} />
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
  globals: { theme: 'dark-pink-moon' },
};

export const InTable: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '12px' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px 12px', borderBottom: '1px solid #ddd' }}>Epic</th>
          <th style={{ textAlign: 'left', padding: '6px 12px', borderBottom: '1px solid #ddd' }}>Priority</th>
        </tr>
      </thead>
      <tbody>
        {(['SUG-118', 'SUG-117', 'SUG-116', 'SUG-115'] as const).map((id, i) => {
          const p = Object.values(PRIORITY)[i]
          return (
            <tr key={id}>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>{id}</td>
              <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>
                <Swatch color={p.color} label={p.label} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  ),
  parameters: { layout: 'padded' },
};
