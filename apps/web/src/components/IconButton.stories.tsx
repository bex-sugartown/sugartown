/**
 * IconButton stories
 *
 * Uses the DS primitive: apps/web/src/design-system/components/icon-button/IconButton.jsx
 *
 * Two shapes:
 *   square — 4px radius (default). Matches SegmentedControl .iconBtn token contract.
 *   circle — full radius. ThemeToggle canonical instance.
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sun, Moon, ExternalLink, Globe, ChevronDown, X } from 'lucide-react'
import IconButton from '../design-system/components/icon-button/IconButton'
import ThemeToggle from './ThemeToggle'

const meta: Meta = {
  title: 'Components/IconButton',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component:
          'Icon-only action button (SUG-174). Two shapes: `square` (4px radius, default) and `circle` (full radius). ' +
          'Token contract: `--st-color-border-subtle` border, `--st-color-text-muted` icon, hover to `border-medium` + `text-default`. ' +
          'Shared with SegmentedControl `.iconBtn`. Always requires `aria-label`.',
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Square: Story = {
  name: 'Square (default)',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton aria-label="External link">
        <ExternalLink size={16} aria-hidden="true" />
      </IconButton>
      <IconButton aria-label="Globe">
        <Globe size={16} aria-hidden="true" />
      </IconButton>
      <IconButton aria-label="Collapse">
        <ChevronDown size={16} aria-hidden="true" />
      </IconButton>
      <IconButton aria-label="Dismiss">
        <X size={16} aria-hidden="true" />
      </IconButton>
    </div>
  ),
}

export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton shape="circle" aria-label="Sun">
        <Sun size={18} aria-hidden="true" />
      </IconButton>
      <IconButton shape="circle" aria-label="Moon">
        <Moon size={18} aria-hidden="true" />
      </IconButton>
    </div>
  ),
}

export const Shapes: Story = {
  name: 'Both shapes',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <IconButton aria-label="External link">
          <ExternalLink size={16} aria-hidden="true" />
        </IconButton>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>
          square
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <IconButton shape="circle" aria-label="Toggle theme">
          <Sun size={18} aria-hidden="true" />
        </IconButton>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>
          circle
        </span>
      </div>
    </div>
  ),
}

export const ThemeToggleStory: Story = {
  name: 'ThemeToggle (live)',
  render: () => <ThemeToggle />,
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <IconButton aria-label="Disabled square" disabled>
        <ExternalLink size={16} aria-hidden="true" />
      </IconButton>
      <IconButton shape="circle" aria-label="Disabled circle" disabled>
        <Sun size={18} aria-hidden="true" />
      </IconButton>
    </div>
  ),
}

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Square (default)</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton aria-label="External link"><ExternalLink size={16} /></IconButton>
          <IconButton aria-label="Globe"><Globe size={16} /></IconButton>
          <IconButton aria-label="Dismiss"><X size={16} /></IconButton>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Circle</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton shape="circle" aria-label="Sun"><Sun size={18} /></IconButton>
          <IconButton shape="circle" aria-label="Moon"><Moon size={18} /></IconButton>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Disabled</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton aria-label="Disabled" disabled><X size={16} /></IconButton>
        </div>
      </div>
    </div>
  ),
}
