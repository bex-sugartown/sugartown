/**
 * Patterns/IconButtonAudit — SUG-174 Phase D
 *
 * Audit of all icon-only button implementations in the codebase.
 * Migrated items use the DS IconButton primitive.
 * Retained items are documented here with justification.
 */

import React from 'react'
import type { Meta } from '@storybook/react'
import { IconButton } from '@sugartown/design-system'
import { Sun, Moon, Menu, ExternalLink } from 'lucide-react'

const meta: Meta = {
  title: 'Patterns/IconButtonAudit',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## SUG-174 Rogue Icon Button Audit

All icon-only buttons found during the Phase D grep sweep, with migration verdicts.

### Migrated to DS IconButton

| File | Class / element | Shape | Migrated to |
|------|----------------|-------|-------------|
| \`components/ThemeToggle.jsx\` | \`.toggle\` bespoke | circle | \`<IconButton shape="circle">\` |
| \`components/Header.jsx\` | \`.hamburger\` inline SVG | square* | Lucide \`<Menu />\` icon; button class kept for display:none/flex responsive logic |

*Hamburger retains the \`.hamburger\` class for its \`display: none → flex\` media query toggle. The class only controls visibility, not the icon.

### Bespoke retention allowlist

| File | Class / element | Reason retained |
|------|----------------|-----------------|
| \`components/KnowledgeGraph/KnowledgeGraph.jsx\` | \`.zoomBtn\` (+, −, fullscreen) | Uses \`--st-kg-zoom-*\` semantic tokens scoped to the KG surface; non-standard 28px size; text chars not SVG icons |
| \`components/ImageLightbox.jsx\` | \`.closeButton\`, \`.navButton\` | Lightbox overlay context: white-on-dark chromatic treatment, \`border: none\`, overlay positioning. No token overlap with standard IconButton contract |
| \`components/PageSections.jsx\` | \`.carouselArrow\` (‹, ›) | Typography chars, not SVG icons. Carousel-specific sizing and positioning. |
| \`pages/SiteGraphPage.jsx\` | \`.fsClose\` (✕) | Full-page graph overlay — same overlay rationale as ImageLightbox |
        `,
      },
    },
    chromatic: { disableSnapshot: true },
  },
}

export default meta

export const Migrated = {
  name: 'Migrated — ThemeToggle + Hamburger',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <IconButton shape="circle" aria-label="Toggle theme">
          <Sun size={18} />
        </IconButton>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>ThemeToggle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <IconButton aria-label="Open menu">
          <Menu size={16} />
        </IconButton>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '10px', color: 'var(--st-color-text-muted)' }}>Hamburger icon</span>
      </div>
    </div>
  ),
}

export const RetainedAllowlist = {
  name: 'Retained (bespoke) — allowlist',
  render: () => (
    <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '12px', color: 'var(--st-color-text-muted)' }}>
      <p>The following are documented as bespoke retention. See story docs tab for justification.</p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '1rem' }}>
        <li>KnowledgeGraph .zoomBtn (+, −, fullscreen)</li>
        <li>ImageLightbox .closeButton, .navButton</li>
        <li>PageSections .carouselArrow (‹, ›)</li>
        <li>SiteGraphPage .fsClose (✕)</li>
      </ul>
    </div>
  ),
}
