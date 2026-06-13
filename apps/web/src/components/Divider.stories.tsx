import type { Meta, StoryObj } from '@storybook/react'
import { DividerBlock } from './portableTextComponents'

const meta: Meta<typeof DividerBlock> = {
  title: 'Components/Divider',
  component: DividerBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: {
      control: 'select',
      options: ['default', 'subtle'],
      mapping: {
        default: { style: 'default' },
        subtle:  { style: 'subtle' },
      },
      description: "Styles: `'default'` (standard pink-tinted rule) or `'subtle'` (reduced opacity).",
    },
  },
}

export default meta
type Story = StoryObj<typeof DividerBlock>

export const Default: Story = {
  args: { value: { style: 'default' } },
}

export const Subtle: Story = {
  args: { value: { style: 'subtle' } },
}

