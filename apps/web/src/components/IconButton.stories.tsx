/**
 * IconButton — icon-only action button (SUG-174).
 *
 * Two shapes:
 *   square — 4px radius (default). Matches SegmentedControl `.iconBtn` token contract.
 *   circle — full radius. ThemeToggle is the canonical live instance.
 *
 * Hover / active: brand-pink border + icon.
 * Rest: `--st-index-cell-inactive-color` border, `--st-color-text-muted` icon.
 * Always requires `aria-label` — no visible text.
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sun, Moon, ExternalLink, Globe, ChevronDown, X } from 'lucide-react'
import IconButton from '../design-system/components/icon-button/IconButton'
import ThemeToggle from './ThemeToggle'

/* ── Custom (non-Lucide) SVGs sourced from ArchivePage.jsx ── */
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
  </svg>
)

const KnowledgeGraphIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <line x1="8" y1="8" x2="2.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="13.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="2.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="2.5" y1="3.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35"/>
    <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
    <circle cx="2.5" cy="3.5" r="1.5" fill="currentColor"/>
    <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor"/>
    <circle cx="2.5" cy="12.5" r="1.5" fill="currentColor"/>
    <circle cx="13.5" cy="12.5" r="1.5" fill="currentColor"/>
  </svg>
)

const FilterTriggerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="20" y2="12" />
    <line x1="12" y1="18" x2="20" y2="18" />
  </svg>
)

/* ── Meta ─────────────────────────────────────────────────────────────────── */

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    shape: {
      description: 'Button shape.',
      control: { type: 'inline-radio' },
      options: ['square', 'circle'],
      table: {
        type: { summary: "'square' | 'circle'" },
        defaultValue: { summary: 'square' },
      },
    },
    disabled: {
      description: 'Disables the button and dims it to 45% opacity.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    'aria-label': {
      description: 'Required. Describes the action — the button has no visible text.',
      control: 'text',
    },
    children: { table: { disable: true } },
    onClick:   { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    shape: 'square',
    disabled: false,
    'aria-label': 'Action',
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

/* ── Shapes ───────────────────────────────────────────────────────────────── */

export const Square: Story = {
  name: 'Square (default)',
  args: { shape: 'square', 'aria-label': 'External link' },
  render: (args) => <IconButton {...args}><ExternalLink size={16} aria-hidden="true" /></IconButton>,
}

export const Circle: Story = {
  args: { shape: 'circle', 'aria-label': 'Toggle theme' },
  render: (args) => <IconButton {...args}><Sun size={18} aria-hidden="true" /></IconButton>,
}

/* ── States ───────────────────────────────────────────────────────────────── */

export const Disabled: Story = {
  args: { shape: 'square', disabled: true, 'aria-label': 'Disabled action' },
  render: (args) => <IconButton {...args}><X size={16} aria-hidden="true" /></IconButton>,
}

/* ── Use cases ────────────────────────────────────────────────────────────── */

export const ArchiveLayoutToggle: Story = {
  name: 'Archive layout toggle (non-Lucide)',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <IconButton aria-label="Grid view"><GridIcon /></IconButton>
        <IconButton aria-label="List view"><ListIcon /></IconButton>
        <IconButton aria-label="Knowledge graph view"><KnowledgeGraphIcon /></IconButton>
        <IconButton aria-label="Filters"><FilterTriggerIcon /></IconButton>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['Grid view', 'List view', 'Knowledge graph view', 'Filters'] as const).map((label) => (
          <span key={label} style={{ width: '32px', textAlign: 'center', fontFamily: 'var(--st-font-family-mono)', fontSize: '9px', color: 'var(--st-color-text-muted)' }}>
            {label.split(' ')[0].toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  ),
}

export const ThemeToggleStory: Story = {
  name: 'ThemeToggle (live)',
  parameters: { controls: { disable: true } },
  render: () => <ThemeToggle />,
}

export const AllStates: Story = {
  name: 'All states',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton aria-label="Square rest"><ExternalLink size={16} aria-hidden="true" /></IconButton>
      <IconButton shape="circle" aria-label="Circle rest"><Sun size={18} aria-hidden="true" /></IconButton>
      <IconButton aria-label="Disabled" disabled><X size={16} aria-hidden="true" /></IconButton>
    </div>
  ),
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { controls: { disable: true }, chromatic: { disableSnapshot: false } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <div>
        <div style={{ marginBottom: '6px', fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: '#888' }}>Shapes</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton aria-label="Square"><ExternalLink size={16} /></IconButton>
          <IconButton shape="circle" aria-label="Circle"><Sun size={18} /></IconButton>
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '6px', fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: '#888' }}>Disabled</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton aria-label="Disabled square" disabled><X size={16} /></IconButton>
          <IconButton shape="circle" aria-label="Disabled circle" disabled><Moon size={18} /></IconButton>
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '6px', fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: '#888' }}>Non-Lucide</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <IconButton aria-label="Grid"><GridIcon /></IconButton>
          <IconButton aria-label="List"><ListIcon /></IconButton>
          <IconButton aria-label="Knowledge graph"><KnowledgeGraphIcon /></IconButton>
          <IconButton aria-label="Filter"><FilterTriggerIcon /></IconButton>
        </div>
      </div>
    </div>
  ),
}
