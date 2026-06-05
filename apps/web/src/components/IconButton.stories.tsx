/**
 * ## IconButton
 *
 * An icon-only button. Follows the same token contract as SegmentedControl's
 * icon variant (.iconBtn): 32px, --st-color-border-subtle, --st-color-text-muted.
 * Circular buttons use --st-radius-full; standalone square buttons use --st-radius-xs.
 *
 * All icons are from Lucide React (lucide-react). See Foundations/Icons for the
 * full icon inventory and attribution.
 *
 * ThemeToggle is the canonical live instance — a circular icon button persisted
 * in the Header.
 */

import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sun, Moon, ChevronDown, Globe, ExternalLink } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

// ── Bare icon button helper (for pattern demos — not a shipped component) ──
const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  padding: '0',
  border: '1px solid var(--st-color-border-subtle)',
  borderRadius: 'var(--st-radius-xs)',
  background: 'transparent',
  color: 'var(--st-color-text-muted)',
  cursor: 'pointer',
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Components/IconButton',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
  },
}

export default meta

// ── Stories ───────────────────────────────────────────────────────────────────

/** ThemeToggle — circular icon button persisted in the Header. Sun/Moon from Lucide. */
export const ThemeToggleStory = {
  name: 'ThemeToggle',
  render: () => <ThemeToggle />,
}

/** Square icon button pattern — matches SegmentedControl .iconBtn token contract. */
export const Square = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button style={iconBtnStyle} aria-label="External link">
        <ExternalLink size={16} aria-hidden="true" />
      </button>
      <button style={iconBtnStyle} aria-label="Globe">
        <Globe size={16} aria-hidden="true" />
      </button>
      <button style={iconBtnStyle} aria-label="Collapse">
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </div>
  ),
}

/** Both shapes side by side — circular (theme toggle) and square (action/nav). */
export const Shapes = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <ThemeToggle />
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>
          circular
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <button style={iconBtnStyle} aria-label="External link">
          <ExternalLink size={16} aria-hidden="true" />
        </button>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>
          square
        </span>
      </div>
    </div>
  ),
}

/** Token reference — border, color, size tokens shared with SegmentedControl icon variant. */
export const TokenContract = {
  name: 'Token contract',
  render: () => (
    <table style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '12px', borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--st-color-border-subtle)', textAlign: 'left' }}>
          <th style={{ padding: '6px 12px 6px 0', color: 'var(--st-color-text-muted)' }}>Property</th>
          <th style={{ padding: '6px 12px', color: 'var(--st-color-text-muted)' }}>Token</th>
          <th style={{ padding: '6px 0', color: 'var(--st-color-text-muted)' }}>Shared with</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['size', '32 × 32px', 'SegmentedControl .iconBtn'],
          ['color (rest)', '--st-color-text-muted', 'SegmentedControl .iconBtn'],
          ['border (rest)', '--st-color-border-subtle', 'SegmentedControl .iconBtn'],
          ['color (hover)', '--st-color-text-default', 'SegmentedControl .iconBtn:hover'],
          ['border (hover)', '--st-color-border-medium', 'SegmentedControl .iconBtn:hover'],
          ['focus ring', '--st-color-brand-primary 2px offset', 'All interactive DS elements'],
          ['radius (circular)', '--st-radius-full', 'ThemeToggle only'],
          ['radius (square)', '--st-radius-xs', 'SegmentedControl .iconBtn'],
        ].map(([prop, token, shared]) => (
          <tr key={prop} style={{ borderBottom: '1px solid var(--st-color-border-subtle)' }}>
            <td style={{ padding: '6px 12px 6px 0', color: 'var(--st-color-text-secondary)' }}>{prop}</td>
            <td style={{ padding: '6px 12px', color: 'var(--st-color-accent)' }}>{token}</td>
            <td style={{ padding: '6px 0', color: 'var(--st-color-text-muted)' }}>{shared}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
