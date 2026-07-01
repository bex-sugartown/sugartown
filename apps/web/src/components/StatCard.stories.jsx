import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import StatCard from './StatCard'

/**
 * ## StatCard
 *
 * Metric tile for stat grids (Stat Card Section, CardBuilderSection tile
 * layout, dashboard summaries). Renders as a Link when `href` is set.
 *
 * `foot` is the last field and renders as a bottom-aligned footer
 * (border-top divider, pushed to the bottom of the card via flex),
 * matching the Card / ContentCard footer convention.
 */
function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Patterns/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withRouter],
  argTypes: {
    label:      { control: 'text', description: 'Eyebrow label above the value.' },
    labelColor: { control: { type: 'radio' }, options: ['ink', 'brand'], description: 'Label colorway.' },
    value:      { control: 'text', description: 'The headline stat.' },
    unit:       { control: 'text', description: 'Suffix rendered after value (e.g. "%", "×").' },
    sub:        { control: 'text', description: 'Secondary line under the value (e.g. a "was" comparison).' },
    body:       { control: 'text', description: 'Supporting sentence below sub.' },
    bodyClamp:  { control: 'boolean', description: 'Clamp body to a fixed number of lines when true.' },
    chip:       { control: 'text', description: 'Inline tag rendered after body.' },
    foot:       { control: 'text', description: 'Footer line — the last field. Bottom-aligned via flex, separated by a border-top, matching the Card / ContentCard footer.' },
    href:       { control: 'text', description: 'Renders the card as a Link (internal) or anchor (external).' },
    loading:    { control: 'boolean', description: 'Renders skeleton placeholders instead of label/value.' },
    titleSize:  { control: { type: 'select' }, options: ['display', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'], description: 'Font-size scale for the value.' },
  },
}

export const Default = {
  args: {
    label: 'Conversion rate',
    labelColor: 'ink',
    value: '4.7',
    unit: '×',
    sub: 'up from 1.6× last quarter',
    body: 'Average across three launch campaigns tracked over two quarters.',
    bodyClamp: true,
    chip: 'Verified',
    foot: 'Source: Q2 campaign analytics',
    href: '/case-studies/example',
    titleSize: '2xl',
  },
}
