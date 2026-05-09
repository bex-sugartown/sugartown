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
  { key: 'all', label: 'All' },
  {
    key: 'article', label: 'Articles',
    chipTokens: { bg: '--st-kg-chip-article-bg', fg: '--st-kg-chip-article-fg', border: '--st-kg-chip-article-border' },
    dotToken: '--st-kg-node-article',
  },
  {
    key: 'caseStudy', label: 'Case Studies',
    chipTokens: { bg: '--st-kg-chip-case-bg', fg: '--st-kg-chip-case-fg', border: '--st-kg-chip-case-border' },
    dotToken: '--st-kg-node-case',
  },
  {
    key: 'node', label: 'Nodes',
    chipTokens: { bg: '--st-kg-chip-node-bg', fg: '--st-kg-chip-node-fg', border: '--st-kg-chip-node-border' },
    dotToken: '--st-kg-node-node',
  },
]

function Controlled({ filters = GRAPH_FILTERS, defaultKey = 'all', count }: { filters?: typeof GRAPH_FILTERS, defaultKey?: string, count?: string }) {
  const [active, setActive] = useState(defaultKey)
  const liveCount = count ?? (active === 'all' ? '45 items visible' : `18 ${filters.find(f => f.key === active)?.label?.toLowerCase() ?? active} visible`)
  return <FilterStrip filters={filters} activeKey={active} onChange={setActive} count={liveCount} />
}

export const Default: Story = {
  render: () => <Controlled />,
  name: 'All active — default state',
}

export const ArticleActive: Story = {
  render: () => <Controlled defaultKey="article" />,
  name: 'Article chip active',
}

export const CaseStudyActive: Story = {
  render: () => <Controlled defaultKey="caseStudy" />,
  name: 'Case Study chip active',
}

export const NodeActive: Story = {
  render: () => <Controlled defaultKey="node" />,
  name: 'Node chip active — dark ledger pill',
}

export const NoChipTokens: Story = {
  render: () => (
    <Controlled
      filters={[
        { key: 'all',    label: 'All' },
        { key: 'open',   label: 'Open' },
        { key: 'closed', label: 'Closed' },
      ]}
      count="12 items visible"
    />
  ),
  name: 'No chip tokens — neutral active fallback',
}
