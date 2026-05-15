import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PriorityChip } from './PriorityChip';

const meta: Meta<typeof PriorityChip> = {
  title: 'Components/PriorityChip',
  component: PriorityChip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    level: { control: { type: 'select' }, options: ['high', 'medium', 'low', 'none'] },
  },
};

export default meta;
type Story = StoryObj<typeof PriorityChip>;

export const High: Story = { args: { level: 'high' } };
export const Medium: Story = { args: { level: 'medium' } };
export const Low: Story = { args: { level: 'low' } };
export const None: Story = { args: { level: 'none' } };

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
      <PriorityChip level="high" />
      <PriorityChip level="medium" />
      <PriorityChip level="low" />
      <PriorityChip level="none" />
    </div>
  ),
  parameters: { layout: 'padded' },
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
        {(['SUG-118', 'SUG-117', 'SUG-116', 'SUG-115'] as const).map((id, i) => (
          <tr key={id}>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>{id}</td>
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>
              <PriorityChip level={(['high', 'medium', 'low', 'none'] as const)[i]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  parameters: { layout: 'padded' },
};
