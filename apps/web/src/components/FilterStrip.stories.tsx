import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import FilterStrip from './FilterStrip'

const meta: Meta<typeof FilterStrip> = {
  title: 'Components/FilterStrip',
  component: FilterStrip,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof FilterStrip>

const GRAPH_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'article',   label: 'Articles',     colorToken: '--st-kg-node-article' },
  { key: 'caseStudy', label: 'Case Studies', colorToken: '--st-kg-node-case' },
  { key: 'node',      label: 'Nodes',        colorToken: '--st-kg-node-node' },
]

function Controlled({ filters = GRAPH_FILTERS, defaultKey = 'all' }) {
  const [active, setActive] = useState(defaultKey)
  return <FilterStrip filters={filters} activeKey={active} onChange={setActive} />
}

export const Default: Story = {
  render: () => <Controlled />,
  name: 'Default — All active',
}

export const ArticleActive: Story = {
  render: () => <Controlled defaultKey="article" />,
  name: 'Articles active',
}

export const CaseStudyActive: Story = {
  render: () => <Controlled defaultKey="caseStudy" />,
  name: 'Case Studies active',
}

export const NodeActive: Story = {
  render: () => <Controlled defaultKey="node" />,
  name: 'Nodes active',
}

export const NoColorTokens: Story = {
  render: () => (
    <Controlled
      filters={[
        { key: 'all',    label: 'All' },
        { key: 'open',   label: 'Open' },
        { key: 'closed', label: 'Closed' },
      ]}
    />
  ),
  name: 'No color tokens — neutral active',
}
