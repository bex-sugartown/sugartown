/**
 * ## Icons
 *
 * Sugartown uses two icon libraries:
 *
 * **Lucide React** (`lucide-react`) — UI icons (actions, navigation, status).
 * MIT license. https://lucide.dev
 *
 * **Simple Icons** (`@icons-pack/react-simple-icons`) — Brand / platform logos.
 * CC0 1.0 Universal license. https://simpleicons.org
 *
 * Icons marked **★ deployed** are currently imported in production code.
 * All others are available from the installed package but unused.
 */

import React from 'react'
import type { Meta } from '@storybook/react'

// ── Lucide deployed ──────────────────────────────────────────────────────────
import {
  Sun, Moon, ChevronDown,
  Globe, Mail, Rss, ExternalLink,
  Bot, MessageSquare, Sparkles, Shuffle,
  // sample of available-but-unused icons for context
  ArrowRight, Check, X, Search,
  LayoutGrid, List, Settings, Info,
  AlertCircle, Eye, EyeOff, Lock,
  Plus, Minus, Edit2, Trash2,
} from 'lucide-react'

// ── Simple Icons deployed ────────────────────────────────────────────────────
import {
  SiGithub, SiX, SiInstagram, SiYoutube,
  SiFacebook, SiDribbble, SiBehance,
  SiBluesky, SiMastodon,
} from '@icons-pack/react-simple-icons'

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Foundations/Icons',
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
  },
}

export default meta

// ── Shared styles ─────────────────────────────────────────────────────────────

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
  gap: '1px',
  background: 'var(--st-color-border-wrap)',
  border: '1px solid var(--st-color-border-wrap)',
  marginTop: '16px',
}

const cell = (deployed: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '16px 8px 12px',
  background: 'var(--st-color-bg-canvas)',
  color: 'var(--st-color-text-secondary)',
  position: 'relative',
})

const label: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '10px',
  color: 'var(--st-color-text-muted)',
  textAlign: 'center',
  lineHeight: 1.3,
  wordBreak: 'break-all',
}

const badge: React.CSSProperties = {
  position: 'absolute',
  top: '4px',
  right: '4px',
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '8px',
  fontWeight: 600,
  color: 'var(--st-color-accent)',
  letterSpacing: '0.04em',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--st-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginTop: '32px',
  marginBottom: '0',
}

const attr: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '11px',
  color: 'var(--st-color-text-muted)',
  marginTop: '4px',
}

function IconCell({ icon: Icon, name, deployed }: { icon: React.ElementType, name: string, deployed?: boolean }) {
  return (
    <div style={cell(!!deployed)}>
      {deployed && <span style={badge}>★</span>}
      <Icon size={20} aria-hidden="true" />
      <span style={label}>{name}</span>
    </div>
  )
}

// ── Lucide story ──────────────────────────────────────────────────────────────

export const Lucide = {
  name: 'Lucide React',
  render: () => (
    <div>
      <p style={attr}>
        MIT · <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--st-color-accent)' }}>lucide.dev</a>
        {' '}· <code style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '11px' }}>lucide-react</code>
        {' '}· <strong style={{ color: 'var(--st-color-accent)' }}>★ deployed</strong> = currently imported in production
      </p>

      <p style={sectionLabel}>UI / navigation</p>
      <div style={grid}>
        <IconCell icon={Sun} name="Sun" deployed />
        <IconCell icon={Moon} name="Moon" deployed />
        <IconCell icon={ChevronDown} name="ChevronDown" deployed />
        <IconCell icon={Globe} name="Globe" deployed />
        <IconCell icon={Mail} name="Mail" deployed />
        <IconCell icon={Rss} name="Rss" deployed />
        <IconCell icon={ExternalLink} name="ExternalLink" deployed />
        <IconCell icon={ArrowRight} name="ArrowRight" />
        <IconCell icon={Search} name="Search" />
        <IconCell icon={LayoutGrid} name="LayoutGrid" />
        <IconCell icon={List} name="List" />
        <IconCell icon={Settings} name="Settings" />
        <IconCell icon={Check} name="Check" />
        <IconCell icon={X} name="X" />
        <IconCell icon={Plus} name="Plus" />
        <IconCell icon={Minus} name="Minus" />
        <IconCell icon={Edit2} name="Edit2" />
        <IconCell icon={Trash2} name="Trash2" />
        <IconCell icon={Eye} name="Eye" />
        <IconCell icon={EyeOff} name="EyeOff" />
        <IconCell icon={Lock} name="Lock" />
        <IconCell icon={Info} name="Info" />
        <IconCell icon={AlertCircle} name="AlertCircle" />
      </div>

      <p style={sectionLabel}>AI / knowledge graph</p>
      <div style={grid}>
        <IconCell icon={Bot} name="Bot" deployed />
        <IconCell icon={MessageSquare} name="MessageSquare" deployed />
        <IconCell icon={Sparkles} name="Sparkles" deployed />
        <IconCell icon={Shuffle} name="Shuffle" deployed />
      </div>
    </div>
  ),
}

// ── Simple Icons story ────────────────────────────────────────────────────────

export const SimpleIconsBrands = {
  name: 'Simple Icons (brand)',
  render: () => (
    <div>
      <p style={attr}>
        CC0 1.0 · <a href="https://simpleicons.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--st-color-accent)' }}>simpleicons.org</a>
        {' '}· <code style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '11px' }}>@icons-pack/react-simple-icons</code>
        {' '}· all shown below are <strong style={{ color: 'var(--st-color-accent)' }}>★ deployed</strong> in SocialLink / PersonProfilePage
      </p>

      <p style={sectionLabel}>Social / platform</p>
      <div style={grid}>
        <IconCell icon={SiGithub} name="SiGithub" deployed />
        <IconCell icon={SiX} name="SiX" deployed />
        <IconCell icon={SiBluesky} name="SiBluesky" deployed />
        <IconCell icon={SiMastodon} name="SiMastodon" deployed />
        <IconCell icon={SiInstagram} name="SiInstagram" deployed />
        <IconCell icon={SiYoutube} name="SiYoutube" deployed />
        <IconCell icon={SiFacebook} name="SiFacebook" deployed />
        <IconCell icon={SiDribbble} name="SiDribbble" deployed />
        <IconCell icon={SiBehance} name="SiBehance" deployed />
      </div>
    </div>
  ),
}

// ── Combined story ────────────────────────────────────────────────────────────

export const AllIcons = {
  name: 'All (combined)',
  render: () => (
    <div>
      {Lucide.render()}
      {SimpleIconsBrands.render()}
    </div>
  ),
}
