import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Checkbox from './Checkbox'

const meta: Meta = {
  title: 'Components/Inputs/Checkbox',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component: 'Pink Moon checkbox. Matches FilterBar .optionCheckbox contract. Sharp corners, brand-primary fill on checked.',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <Checkbox label="Enable notifications" />,
}

export const Checked: Story = {
  render: () => <Checkbox label="Checked by default" defaultChecked />,
}

export const Disabled: Story = {
  render: () => <Checkbox label="Disabled unchecked" disabled />,
}

export const DisabledChecked: Story = {
  name: 'Disabled + checked',
  render: () => <Checkbox label="Disabled checked" disabled defaultChecked />,
}

export const Group: Story = {
  name: 'Checkbox group',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox label="Articles" defaultChecked />
      <Checkbox label="Case studies" />
      <Checkbox label="Knowledge graph nodes" />
    </div>
  ),
}

export const Dark: Story = {
  name: 'Dark theme',
  decorators: [
    (Story) => (
      <div data-theme="dark-pink-moon" style={{ padding: '1rem', background: 'var(--st-color-bg-base, #0d0d0d)' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Disabled" disabled />
    </div>
  ),
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox label="Default" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
}
