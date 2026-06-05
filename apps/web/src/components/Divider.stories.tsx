import type { Meta, StoryObj } from '@storybook/react'
import { DividerBlock } from './portableTextComponents'

const meta: Meta<typeof DividerBlock> = {
  title: 'Patterns/Divider',
  component: DividerBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DividerBlock>

export const Default: Story = {
  args: { value: { style: 'default' } },
}

export const Subtle: Story = {
  args: { value: { style: 'subtle' } },
}

export const DarkMode: Story = {
  args: { value: { style: 'default' } },
  globals: { theme: 'dark-pink-moon' },
}
