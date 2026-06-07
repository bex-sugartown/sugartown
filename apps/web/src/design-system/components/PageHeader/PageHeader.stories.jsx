/**
 * PageHeader — Patterns/PageHeader
 *
 * Full-width identity band at the top of archive, entity, and taxonomy pages.
 * Lives in Page's header slot, above the main content container.
 *
 * Page-type coverage:
 * | Archive            | breadcrumb, title, count, description, italic            |
 * | Person folio       | breadcrumb, media, title, description, tint, italic      |
 * | Entity folio       | breadcrumb, media, title, description, tint              |
 * | Taxonomy detail    | breadcrumb, title, count, description                    |
 * | Any                | + actions                                                |
 *
 * H1 italic rule (Typography Conventions story):
 *   italic=true  — archive masteheads, person folios
 *   italic=false — entity folios (project, tool), taxonomy detail pages
 *
 * SUG-157
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import Avatar from '../avatar/Avatar'
import {
  DocSection,
  OverviewItem,
  NotItem,
  DoItem,
  DontItem,
  A11yItem,
  TokenGroup,
  TokenRow,
  RelatedCard,
  ChangelogEntry,
  ChangelogItem,
} from '../../../../../../apps/storybook/.storybook/helpers/docs'

// ─── Shared decorator ────────────────────────────────────────────────────────

function withRouter(StoryFn) {
  return React.createElement(MemoryRouter, null, React.createElement(StoryFn))
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export default {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-width identity band at the top of archive, entity, and taxonomy pages. Accepts MetadataCard as a slot — see Patterns/MetadataCard for that pattern.',
      },
    },
  },
}

// ─── Archive ─────────────────────────────────────────────────────────────────

/** Archive page — breadcrumb + title + count + description. No media, tint, or metadata. */
export const ArchiveArticles = {
  name: 'Archive — Articles',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Articles' }]} />}
      title="Articles"
      count={24}
      description="Writing on design engineering, content strategy, and the systems that hold them together."
      italic
    />
  ),
}

/** Multi-type library archive — no breadcrumb, title + count only. */
export const ArchiveLibrary = {
  name: 'Archive — Library',
  render: () => (
    <PageHeader
      title="Library"
      count={87}
      description="All content across articles, knowledge nodes, and case studies in one view."
      italic
    />
  ),
}

// ─── Entity / Folio ───────────────────────────────────────────────────────────

/**
 * Person Folio — italic per H1 rule (person folios = italic).
 * breadcrumb + Avatar + title + description + tint.
 */
export const EntityPersonFolio = {
  name: 'Entity — Person Folio',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
      media={<Avatar name="Bex Walton" size="xl" />}
      title="Bex Walton"
      description="Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller."
      tint="var(--st-color-seafoam-300)"
      italic
    />
  ),
}

/** Tool Folio — roman per H1 rule (entity folios = roman). */
export const EntityToolFolio = {
  name: 'Entity — Tool Folio',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Tools', href: '/tools' }]} />}
      media={<Avatar name="Figma" size="xl" />}
      title="Figma"
      description="Collaborative interface design tool used for component design, prototyping, and design token management."
      tint="var(--st-color-midnight-300)"
    />
  ),
}

// ─── Taxonomy ─────────────────────────────────────────────────────────────────

/** Tag detail — roman per H1 rule (taxonomy detail pages = roman). */
export const TaxonomyTagDetail = {
  name: 'Taxonomy — Tag Detail',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Tags', href: '/tags' }]} />}
      title="Design Systems"
      count={12}
      description="Articles, nodes, and case studies tagged with Design Systems."
    />
  ),
}

// ─── With actions ─────────────────────────────────────────────────────────────

/** Shows the actions slot — edit/admin controls rendered top-right. */
export const WithActions = {
  name: 'With Actions',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Articles', href: '/articles' }]} />}
      title="Articles"
      count={24}
      description="Writing on design engineering, content strategy, and the systems that hold them together."
      actions={
        <button
          style={{
            fontFamily: 'var(--st-font-family-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--st-color-border-default)',
            color: 'var(--st-color-text-muted)',
            cursor: 'pointer',
          }}
        >
          Edit in Studio
        </button>
      }
    />
  ),
}

// ─── Snapshot (Chromatic) ─────────────────────────────────────────────────────

// ─── Guidelines (14-section docs story) ──────────────────────────────────────

const s = {
  page:   { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 4rem' },
  h1:     { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' },
  lead:   { color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' },
  prose:  { fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--st-color-neutral-600)', margin: '0 0 1rem' },
  code:   { background: 'var(--st-color-bg-surface-strong)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85em', fontFamily: 'var(--st-font-family-mono)' },
  pre:    { background: 'var(--st-color-neutral-900, #111)', color: '#e8e8e8', padding: '1rem', borderRadius: '4px', fontSize: '0.78rem', fontFamily: 'var(--st-font-family-mono)', whiteSpace: 'pre-wrap', margin: '0 0 1.5rem', overflowX: 'auto', lineHeight: 1.6 },
  table:  { width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' },
  th:     { textAlign: 'left', padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-border-default)', fontWeight: 600, background: 'var(--st-color-bg-surface)' },
  td:     { padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-neutral-100)', verticalAlign: 'top' },
  tdMono: { padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-neutral-100)', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.8rem' },
  ddGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '1.5rem' },
  ddCol:  { border: '1px solid var(--st-color-neutral-200)' },
  ddHd:   { padding: '9px 14px', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid var(--st-color-neutral-200)' },
  ddDoHd: { color: 'var(--st-color-seafoam-700)', background: 'color-mix(in srgb, var(--st-color-seafoam) 5%, white)', borderLeft: '3px solid var(--st-color-seafoam)' },
  ddDntHd:{ color: 'var(--st-color-pink-700)', background: 'color-mix(in srgb, var(--st-color-pink) 4%, white)', borderLeft: '3px solid var(--st-color-pink)' },
}

function PageHeaderGuidelinesPage() {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>PageHeader</h1>
      <p style={s.lead}>Full-width identity band at the top of archive, entity, and taxonomy pages.</p>

      {/* 01 — Overview */}
      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          PageHeader renders the top identity band across three surface types: archive masteheads,
          entity detail folios (person / tool / project), and taxonomy detail pages. Every page on the
          site that has a dedicated header uses this component — it is the single source of truth for
          page-level identity layout.
        </p>
        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 8, marginTop: 20 }}>What it does</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <OverviewItem>Renders an H1 with optional italic style, optional count badge, and optional description.</OverviewItem>
          <OverviewItem>Accepts a <code style={s.code}>media</code> slot for Avatar or logo images — used by entity folios, absent on archives and taxonomy pages.</OverviewItem>
          <OverviewItem>Accepts a <code style={s.code}>breadcrumb</code> slot and an <code style={s.code}>actions</code> slot (e.g. "Edit in Studio") rendered in a top row above the identity block.</OverviewItem>
          <OverviewItem>Applies a tint wash via <code style={s.code}>color-mix</code> when a <code style={s.code}>tint</code> prop is provided — used by entity folios to echo the entity's brand colour.</OverviewItem>
          <OverviewItem>Accepts a <code style={s.code}>metadataCard</code> slot rendered below the identity block — used by entity detail pages.</OverviewItem>
        </ul>
        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 8, marginTop: 20 }}>What it is not</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <NotItem>A navigation component — it renders no nav links or tabs.</NotItem>
          <NotItem>A hero section — it carries no body content, images, or CTAs beyond the identity block.</NotItem>
          <NotItem>A page layout wrapper — it sits above the main content container and does not own page-level spacing.</NotItem>
        </ul>
      </DocSection>

      {/* 06 — Usage Guidelines */}
      <DocSection n="06" title="Usage Guidelines" priority="must">
        <p style={s.prose}>Three surface types share one shell. They differ only in which props are provided.</p>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Surface type</th>
              <th style={s.th}>Props to set</th>
              <th style={s.th}>Props to omit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>Archive masthead</td>
              <td style={s.td}><code style={s.code}>breadcrumb</code>, <code style={s.code}>title</code>, <code style={s.code}>count</code>, <code style={s.code}>description</code>, <code style={s.code}>italic</code></td>
              <td style={s.td}><code style={s.code}>media</code>, <code style={s.code}>tint</code>, <code style={s.code}>metadataCard</code></td>
            </tr>
            <tr>
              <td style={s.td}>Person folio</td>
              <td style={s.td}><code style={s.code}>breadcrumb</code>, <code style={s.code}>media</code> (Avatar), <code style={s.code}>title</code>, <code style={s.code}>description</code>, <code style={s.code}>tint</code>, <code style={s.code}>italic</code></td>
              <td style={s.td}><code style={s.code}>count</code></td>
            </tr>
            <tr>
              <td style={s.td}>Tool / Project folio</td>
              <td style={s.td}><code style={s.code}>breadcrumb</code>, <code style={s.code}>media</code> (Avatar / logo), <code style={s.code}>title</code>, <code style={s.code}>description</code>, <code style={s.code}>tint</code></td>
              <td style={s.td}><code style={s.code}>count</code>, <code style={s.code}>italic</code></td>
            </tr>
            <tr>
              <td style={s.td}>Taxonomy detail</td>
              <td style={s.td}><code style={s.code}>breadcrumb</code>, <code style={s.code}>title</code>, <code style={s.code}>count</code>, <code style={s.code}>description</code></td>
              <td style={s.td}><code style={s.code}>media</code>, <code style={s.code}>tint</code>, <code style={s.code}>italic</code>, <code style={s.code}>metadataCard</code></td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 12, marginTop: 24 }}>H1 italic rule</h3>
        <p style={s.prose}>
          Person folios and archive masteheads use italic Cormorant Garamond (<code style={s.code}>italic=true</code>).
          All other surface types (tool folio, project folio, taxonomy detail) use roman. This distinction is
          typographic personality — italic signals a living person's name; roman signals a tool, concept, or collection.
        </p>
        <div style={s.ddGrid}>
          <div style={s.ddCol}>
            <div style={{ ...s.ddHd, ...s.ddDoHd }}>Do — pass <code>italic</code></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <DoItem>Archive masteheads (Articles, Case Studies, Knowledge Graph, Tags, People…)</DoItem>
              <DoItem>Person folio pages (<code style={s.code}>/people/:slug</code>)</DoItem>
            </ul>
          </div>
          <div style={s.ddCol}>
            <div style={{ ...s.ddHd, ...s.ddDntHd }}>Don't — omit <code>italic</code></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <DontItem>Tool folio pages — roman only</DontItem>
              <DontItem>Project folio pages — roman only</DontItem>
              <DontItem>Taxonomy tag / category / project detail — roman only</DontItem>
            </ul>
          </div>
        </div>

        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 12, marginTop: 24 }}>Tint prop</h3>
        <p style={s.prose}>
          Pass any CSS color value — token reference (<code style={s.code}>var(--st-color-seafoam-300)</code>) or hex.
          The component mixes it at 10% over the surface background via <code style={s.code}>color-mix()</code>.
          Keep tint values light (300-level tokens or equivalent) so the wash reads as a hint, not a filled swatch.
          Never pass a full-saturation or dark color as the tint — the mix will produce an unexpectedly heavy wash.
        </p>

        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 12, marginTop: 24 }}>metadataCard slot</h3>
        <p style={s.prose}>
          Pass a <code style={s.code}>{'<MetadataCard />'}</code> node. The slot renders it below the identity block
          with <code style={s.code}>margin-top: var(--st-space-5)</code>. Do not wrap MetadataCard in any additional
          container — the slot div provides the only spacing.
        </p>
      </DocSection>

      {/* 07 — Accessibility */}
      <DocSection n="07" title="Accessibility" priority="must">
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <A11yItem label="H1 is the page title">
            The <code style={s.code}>title</code> prop renders as an <code style={s.code}>{'<h1>'}</code>.
            Every page using PageHeader must have exactly one PageHeader — two would produce duplicate H1s.
          </A11yItem>
          <A11yItem label="count is labelled">
            The count badge uses <code style={s.code}>aria-label={'{`${count} items`}'}</code> so screen readers
            announce "24 items" rather than reading a bare number adjacent to the heading.
          </A11yItem>
          <A11yItem label="Breadcrumb and actions are in document order">
            The topRow renders <code style={s.code}>breadcrumb</code> before <code style={s.code}>actions</code>
            in source order. Navigation context comes before admin controls for keyboard users reading linearly.
          </A11yItem>
          <A11yItem label="media slot has no implicit role">
            The <code style={s.code}>media</code> wrapper div is presentational. The Avatar component inside
            provides its own accessible name via <code style={s.code}>aria-label</code>. If passing a raw
            <code style={s.code}>{'<img>'}</code> as media, you must add meaningful alt text.
          </A11yItem>
          <A11yItem label="Tint has sufficient contrast">
            The tint wash is a 10% blend — body text and H1 use <code style={s.code}>--st-color-text-default</code>
            and <code style={s.code}>--st-color-text-secondary</code> which maintain contrast over any 10% tint
            that uses a 300-level token. Do not increase the tint intensity without re-testing contrast.
          </A11yItem>
        </ul>
      </DocSection>

      {/* 08 — Design Tokens */}
      <DocSection n="08" title="Design Tokens" priority="must">
        <TokenGroup label="Layout">
          <TokenRow token="--st-width-archive" value="1100px" role="max-width of .inner — constrains header width on wide viewports" />
          <TokenRow token="--st-page-gutter" value="2rem" role="horizontal padding on .inner" />
          <TokenRow token="--st-space-6" value="3rem" role="vertical padding on .inner (top and bottom)" />
          <TokenRow token="--st-space-5" value="2rem" role="gap between topRow and body; metadataCard margin-top; body flex gap on mobile" />
          <TokenRow token="--st-space-4" value="1.5rem" role="mobile: vertical padding on .inner; topRow gap; body flex gap" />
          <TokenRow token="--st-space-3" value="1rem" role="gap between title and count badge; description margin-top" />
        </TokenGroup>
        <TokenGroup label="Typography — H1">
          <TokenRow token="--st-font-family-narrative" value="Cormorant Garamond" role=".title font family" />
          <TokenRow token="--st-font-heading-2" value="2.5rem" role=".title font size (desktop)" />
          <TokenRow token="--st-font-size-2xl" value="1.875rem" role=".title font size (mobile, ≤520px)" />
          <TokenRow token="--st-font-weight-normal" value="400" role=".title font weight" />
          <TokenRow token="--st-line-height-tight" value="1.2" role=".title line height" />
          <TokenRow token="--st-color-text-default" value="—" role=".title color" />
        </TokenGroup>
        <TokenGroup label="Typography — count / description">
          <TokenRow token="--st-font-family-mono" value="IBM Plex Mono" role=".count font family" />
          <TokenRow token="--st-font-size-sm" value="0.875rem" role=".count font size" />
          <TokenRow token="--st-color-text-muted" value="—" role=".count color" />
          <TokenRow token="--st-font-family-ui" value="DM Sans" role=".description font family" />
          <TokenRow token="--st-font-size-md" value="1rem" role=".description font size" />
          <TokenRow token="--st-line-height-normal" value="1.5" role=".description line height" />
          <TokenRow token="--st-color-text-secondary" value="—" role=".description color" />
        </TokenGroup>
        <TokenGroup label="Tint mechanism (internal)">
          <TokenRow token="--page-header-tint" value="(caller-set)" role="Internal CSS custom property. Set via style prop from tint prop value. Never set directly." />
          <TokenRow token="--st-color-bg-surface" value="—" role="Base surface color that tint is blended over (color-mix 10%)" />
        </TokenGroup>
      </DocSection>

      {/* 09 — Anatomy */}
      <DocSection n="09" title="Anatomy" priority="should">
        <pre style={s.pre}>{`.root                     ← full-width container; .tinted modifier when tint prop present
  .inner                  ← max-width clamp + page gutter padding
    .topRow               ← breadcrumb + actions row (only rendered if either is present)
      .breadcrumbSlot     ← wrapper for breadcrumb ReactNode slot
      .actions            ← wrapper for actions ReactNode slot (flex row, gap-3)
    .body                 ← flex row: media + content (stacks on mobile ≤520px)
      .media              ← flex-shrink: 0 wrapper for Avatar / logo
      .content            ← flex: 1 1 auto; min-width: 0
        .titleRow         ← flex row: h1 + count badge (baseline-aligned, wraps)
          .title          ← H1; .titleItalic modifier when italic prop true
          .count          ← aria-labelled count badge (rendered only when count !== undefined)
        .description      ← p element; max-width: 62ch; only rendered when description present
    .metadataCard         ← margin-top wrapper for metadataCard slot`}</pre>
      </DocSection>

      {/* 10 — Responsive */}
      <DocSection n="10" title="Responsive" priority="should">
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Breakpoint</th>
              <th style={s.th}>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>≤520px (mobile)</td>
              <td style={s.td}><code style={s.code}>.inner</code> vertical padding reduces to <code style={s.code}>--st-space-5</code>; <code style={s.code}>.body</code> switches to column layout — media stacks above content; <code style={s.code}>.title</code> font size drops to <code style={s.code}>--st-font-size-2xl</code></td>
            </tr>
            <tr>
              <td style={s.td}>{'>'} 520px</td>
              <td style={s.td}><code style={s.code}>.body</code> is a flex row — media left, content right</td>
            </tr>
          </tbody>
        </table>
        <p style={s.prose}>
          The <code style={s.code}>description</code> line is capped at <code style={s.code}>62ch</code> at all widths
          to preserve comfortable reading line length even when the container is at full archive width.
        </p>
      </DocSection>

      {/* 13 — Related Components */}
      <DocSection n="13" title="Related Components" priority="should">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <RelatedCard
            name="Breadcrumb"
            why="Passed into the breadcrumb slot — provides the nav trail above the identity block."
            when="Any page with a parent archive (person → /people, article → /articles, etc.)"
          />
          <RelatedCard
            name="Avatar"
            why="Canonical media-slot component for person and tool folios. Renders initials + optional image at xl size."
            when="Entity folio pages where the entity has a recognisable identity mark."
          />
          <RelatedCard
            name="MetadataCard"
            why="Passed into the metadataCard slot — renders taxonomy chips, status badge, and links below the identity block."
            when="Entity detail pages (person, tool, project) that carry structured metadata."
          />
          <RelatedCard
            name="PageSections / SectionLabel"
            why="Renders the content body below PageHeader. The two components form a vertical stack — PageHeader at top, PageSections body below."
            when="All detail and archive pages using PageHeader."
          />
        </div>
      </DocSection>

      {/* 14 — Changelog */}
      <DocSection n="14" title="Changelog" priority="should">
        <ChangelogEntry version="v0.26.8" date="2026-06-07">
          <ChangelogItem>SUG-157 DS Codification Sprint — PageHeader formally documented with 14-section Guidelines story.</ChangelogItem>
          <ChangelogItem>No API changes in this release.</ChangelogItem>
        </ChangelogEntry>
        <ChangelogEntry version="v0.26.0" date="2026-05 (approx)">
          <ChangelogItem>Initial PageHeader implementation. Props: breadcrumb, media, title, description, count, metadataCard, actions, tint, italic, className.</ChangelogItem>
          <ChangelogItem>Tint mechanism uses CSS color-mix at 10% over --st-color-bg-surface.</ChangelogItem>
        </ChangelogEntry>
      </DocSection>
    </div>
  )
}

export const Guidelines = {
  name: 'Guidelines',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => <PageHeaderGuidelinesPage />,
}

// ─── Snapshot (Chromatic) ─────────────────────────────────────────────────────

export const Snapshot = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Articles' }]} />}
        title="Articles"
        count={24}
        description="Writing on design engineering, content strategy, and the systems that hold them together."
        italic
      />
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
        media={<Avatar name="Bex Walton" size="xl" />}
        title="Bex Walton"
        description="Design engineer and content strategist."
        tint="var(--st-color-seafoam-300)"
        italic
      />
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Tags', href: '/tags' }]} />}
        title="Design Systems"
        count={12}
        description="Articles, nodes, and case studies tagged with Design Systems."
      />
    </div>
  ),
}
