import type { Meta, StoryObj } from '@storybook/react'
import KnowledgeGraph from './KnowledgeGraph'

const meta: Meta<typeof KnowledgeGraph> = {
  title: 'Components/KnowledgeGraph',
  component: KnowledgeGraph,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof KnowledgeGraph>

const COLOR_TOKENS = {
  article:   '--st-kg-node-article',
  caseStudy: '--st-kg-node-case',
  node:      '--st-kg-node-node',
}

// Static fixture — representative cross-type graph with hub + item nodes
const FIXTURE_GRAPH = {
  generatedAt: '2026-05-09T00:00:00.000Z',
  nodes: [
    { id: 'project:design-system', type: 'project', label: 'Design System', href: '/projects/design-system', size: 'large' },
    { id: 'category:accessibility', type: 'category', label: 'Accessibility', href: '/categories/accessibility', size: 'medium' },
    { id: 'item:article:color-tokens', _id: 'art-001', type: 'item', docType: 'article', slug: 'color-tokens', label: 'Color Tokens Explained', href: '/articles/color-tokens', size: 'small', tags: [] },
    { id: 'item:caseStudy:figma-handoff', _id: 'cs-001', type: 'item', docType: 'caseStudy', slug: 'figma-handoff', label: 'Figma Handoff Process', href: '/case-studies/figma-handoff', size: 'small', tags: [] },
    { id: 'item:node:aria-live', _id: 'nd-001', type: 'item', docType: 'node', slug: 'aria-live', label: 'ARIA Live Regions', href: '/nodes/aria-live', size: 'small', tags: [] },
  ],
  edges: [
    { source: 'item:article:color-tokens', target: 'project:design-system', kind: 'membership' },
    { source: 'item:caseStudy:figma-handoff', target: 'project:design-system', kind: 'membership' },
    { source: 'item:node:aria-live', target: 'category:accessibility', kind: 'membership' },
    { source: 'item:article:color-tokens', target: 'item:node:aria-live', kind: 'sharedTag', weight: 2 },
  ],
}

const FIXTURE_FILTERED = {
  ...FIXTURE_GRAPH,
  nodes: [
    { id: 'project:design-system', type: 'project', label: 'Design System', href: '/projects/design-system', size: 'large' },
    { id: 'item:article:color-tokens', _id: 'art-001', type: 'item', docType: 'article', slug: 'color-tokens', label: 'Color Tokens Explained', href: '/articles/color-tokens', size: 'small', tags: [{ slug: 'css', label: 'CSS' }] },
    { id: 'tag:css', type: 'tag', label: 'CSS', href: '/tags/css', size: 'small' },
  ],
  edges: [
    { source: 'item:article:color-tokens', target: 'project:design-system', kind: 'membership' },
    { source: 'item:article:color-tokens', target: 'tag:css', kind: 'tag-membership' },
  ],
}

export const Default: Story = {
  args: { graphData: FIXTURE_GRAPH, colorTokens: COLOR_TOKENS, showLegend: true },
  name: 'All types — cross-type graph',
}

export const WithTagNodes: Story = {
  args: { graphData: FIXTURE_FILTERED, colorTokens: COLOR_TOKENS, showLegend: true },
  name: 'Filtered view — with tag nodes',
}

export const NoLegend: Story = {
  args: { graphData: FIXTURE_GRAPH, colorTokens: COLOR_TOKENS, showLegend: false },
  name: 'No legend',
}
