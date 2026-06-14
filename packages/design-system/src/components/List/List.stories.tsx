import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { List } from './List'

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof List>

// A status dot is supplied by the caller via `leading` (colour is a content
// concern). In production the app adapter owns this; here we inline it.
const dot = (color: string) => (
  <span
    style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flex: '0 0 auto', background: color }}
  />
)

const STATUS_DOT: Record<string, string> = {
  validated: 'var(--st-color-maroon)',
  evergreen: 'var(--st-color-lime-700)',
  exploring: 'var(--st-color-amber)',
  deprecated: 'var(--st-color-softgrey-400)',
  operationalized: 'var(--st-color-border-medium)',
}

const ARTICLE_ROWS = [
  { tag: 'Engineering & DX', title: 'The Site That Built Itself', date: '28 Apr 2026', href: '#' },
  { tag: 'Design Systems', title: 'Tokens All the Way Down', date: '14 Apr 2026', href: '#' },
  { tag: 'Content Architecture', title: 'Structured Content for Agentic Search', date: '2 Apr 2026', href: '#' },
]

const NODE_ROWS = [
  { status: 'validated', title: 'Post-Mortems as System Upgrades', date: '2 May 2026' },
  { status: 'evergreen', title: 'The Agentic Caucus', date: '24 Apr 2026' },
  { status: 'exploring', title: 'The Seafoam That Should Have Been Lime', date: '11 Apr 2026' },
  { status: 'deprecated', title: 'A Pattern We Retired', date: '3 Mar 2026' },
].map((n) => ({
  tag: n.status,
  title: n.title,
  date: n.date,
  href: '#',
  leading: dot(STATUS_DOT[n.status]),
}))

/** Default register variant — Article rows (gutter tag = category, no dot). */
export const Register: Story = {
  args: { variant: 'register', items: ARTICLE_ROWS },
}

/** With a section head (title + count). */
export const WithHead: Story = {
  args: { variant: 'register', title: 'Articles', items: ARTICLE_ROWS },
}

/** Node rows — gutter tag = status, with a status dot supplied via `leading`. */
export const NodeRows: Story = {
  args: { variant: 'register', title: 'Knowledge Nodes', items: NODE_ROWS },
}

/** Empty collection. */
export const Empty: Story = {
  args: { variant: 'register', title: 'Articles', items: [] },
}

/** Long title + long gutter tag — truncation (tag) and wrapping (title) behaviour. */
export const LongContent: Story = {
  args: {
    variant: 'register',
    items: [
      {
        tag: 'Product & Platform Strategy',
        title:
          'A Very Long Article Title That Wraps Across Multiple Lines To Verify The Row Height And Date Alignment Hold Up',
        date: '28 Apr 2026',
        href: '#',
      },
      ...ARTICLE_ROWS,
    ],
  },
}

/** Narrow container — drop into a 360px column to exercise the @container
 *  query (vertical rules drop; row wraps to [tag … date] / title). */
export const NarrowColumn: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360, border: '1px dashed var(--st-color-border-medium)', padding: 16 }}>
      <List {...args} />
    </div>
  ),
  args: { variant: 'register', title: 'Related', items: NODE_ROWS },
}
