import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import Link from './Link'

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    url:   { control: 'text' },
    openInNewTab: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Link>

export const Internal: Story = {
  args: { label: 'Articles', url: '/articles' },
}

export const External: Story = {
  args: { label: 'Sugartown.io', url: 'https://sugartown.io', openInNewTab: true },
}

export const NoUrl: Story = {
  name: 'No URL (span fallback)',
  args: { label: 'Plain text — no link', url: undefined },
}

export const DarkMode: Story = {
  args: { label: 'Articles', url: '/articles' },
  globals: { theme: 'dark-pink-moon' },
}
