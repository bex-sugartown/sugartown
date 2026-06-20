import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Radio from './Radio'

const meta: Meta = {
  title: 'Components/Inputs/Radio',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component: 'Pink Moon radio button. Circular, focus-ring border + dot on checked. Group via shared `name` prop.',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <Radio label="Option A" name="demo" />,
}

export const Checked: Story = {
  render: () => <Radio label="Selected" name="checked-demo" defaultChecked />,
}

export const Disabled: Story = {
  render: () => <Radio label="Disabled" name="disabled-demo" disabled />,
}

export const Group: Story = {
  name: 'Radio group',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Radio label="Light" name="theme" defaultChecked />
      <Radio label="Dark" name="theme" />
      <Radio label="System" name="theme" />
    </div>
  ),
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Radio label="Unchecked" name="snap" />
      <Radio label="Checked" name="snap-b" defaultChecked />
      <Radio label="Disabled" name="snap-c" disabled />
    </div>
  ),
}
