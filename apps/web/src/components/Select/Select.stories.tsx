import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Select from './Select'

const meta: Meta = {
  title: 'Components/Inputs/Select',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component: 'Native select with custom chevron. Pink Moon: sharp corners, mono font. Focus: `--st-color-focus` ring.',
      },
    },
  },
}
export default meta
type Story = StoryObj

const options = ['Option A', 'Option B', 'Option C', 'Longer option D']

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select aria-label="Choose option">
        {options.map(o => <option key={o}>{o}</option>)}
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: '280px' }}>
      <Select aria-label="Disabled select" disabled>
        {options.map(o => <option key={o}>{o}</option>)}
      </Select>
    </div>
  ),
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '280px' }}>
      <Select aria-label="Default"><option>Option A</option><option>Option B</option></Select>
      <Select aria-label="Disabled" disabled><option>Disabled</option></Select>
    </div>
  ),
}
