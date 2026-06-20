import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Switch from './Switch'

const meta: Meta = {
  title: 'Components/Inputs/Switch',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component: 'Pink Moon toggle switch. Sharp track (34×18px), square knob. Layout: label left, switch right. Optional mono hint line.',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <Switch label="Dark mode" />,
}

export const On: Story = {
  render: () => <Switch label="Notifications" defaultChecked />,
}

export const WithHint: Story = {
  name: 'With hint',
  render: () => <Switch label="Auto-save" hint="Saves every 30 seconds" />,
}

export const Disabled: Story = {
  render: () => <Switch label="Disabled off" disabled />,
}

export const DisabledOn: Story = {
  name: 'Disabled + on',
  render: () => <Switch label="Disabled on" disabled defaultChecked />,
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '280px' }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="With hint" hint="Saves every 30s" defaultChecked />
      <Switch label="Disabled" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
}
