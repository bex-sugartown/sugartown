/**
 * CwvSnapshot — Storybook stories (SUG-100)
 * Stories use mock section data; stats.json is mocked via module-level override.
 */
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import CwvSnapshot from './CwvSnapshot'

const meta: Meta<typeof CwvSnapshot> = {
  title: 'Components/CwvSnapshot',
  component: CwvSnapshot,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof CwvSnapshot>

// ── With data unavailable (current default until pipeline runs) ───────────────
export const DataUnavailable: Story = {
  name: 'Data unavailable (stale pipeline)',
  args: {
    section: { defaultFormFactor: 'mobile' },
  },
}

// ── With data available (mock via args) ──────────────────────────────────────
// Note: CwvSnapshot reads directly from stats.json (baked at build time).
// In Storybook, the default stats.json has stale/unavailable data.
// To preview the populated state, run the stats pipeline first.
export const DefaultSection: Story = {
  name: 'Default section (reads live stats.json)',
  args: {
    section: { defaultFormFactor: 'mobile', cwvUrl: 'https://sugartown.io/' },
  },
}

export const DesktopDefault: Story = {
  name: 'Desktop form factor default',
  args: {
    section: { defaultFormFactor: 'desktop' },
  },
}
