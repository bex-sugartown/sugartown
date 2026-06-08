import React from 'react';
import {
  DocSection,
  DoDontGrid, DoGroup, DontGroup, DoItem, DontItem,
  OverviewItem, NotItem,
  A11yItem,
  docStyles as s,
  AiGeneratedFooter,
} from './docs';

// ── Inline card replicas ───────────────────────────────────────────────────────
// Visual stand-ins — no component imports from apps/web or packages/design-system.

// ── Shared tokens ──────────────────────────────────────────────────────────────

const cardBase: React.CSSProperties = {
  border: '1px solid var(--st-card-border)',
  background: 'var(--st-card-bg)',
  fontFamily: 'var(--st-font-family-ui)',
  fontSize: '0.875rem',
  color: 'var(--st-color-text-primary)',
  maxWidth: '380px',
};

const folioStrip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  padding: '0.4rem 0.75rem',
  background: 'var(--st-card-folio-bg)',
  borderBottom: '1px solid var(--st-card-border)',
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '0.65rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--st-color-text-muted)',
};

const dot = (color: string): React.CSSProperties => ({
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: color,
  flexShrink: 0,
});

const cardBody: React.CSSProperties = {
  padding: '0.75rem',
};

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-narrative)',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.3,
  marginBottom: '0.375rem',
  color: 'var(--st-color-text-primary)',
};

const cardExcerpt: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--st-color-text-muted)',
  lineHeight: 1.5,
  marginBottom: '0.5rem',
};

const chipRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '0.25rem',
  marginBottom: '0.375rem',
};

const chip = (featured = false): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25em 0.6em',
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '0.68rem',
  background: featured
    ? 'var(--st-chip-rubric-bg)'
    : 'var(--st-chip-bg)',
  border: `1px solid ${featured ? 'var(--st-chip-rubric-border)' : 'var(--st-chip-border)'}`,
  color: featured ? 'var(--st-chip-rubric-fg)' : 'var(--st-chip-fg)',
});

const metaLabel: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--st-color-text-muted)',
  width: 72,
  flexShrink: 0,
  paddingTop: '0.1rem',
};

const metaRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  padding: '0.45rem 0.75rem',
  borderBottom: '1px solid var(--st-color-border-subtle)',
};

// ── Card replicas ──────────────────────────────────────────────────────────────

function DSCardReplica() {
  return (
    <div style={cardBase}>
      <div style={folioStrip}>
        <span>Node · PROJ-002</span>
        <span style={dot('var(--st-color-status-exploring)')}>​</span>
      </div>
      <div style={cardBody}>
        <div style={cardTitle}>Prompt Architecture for Long-Form Reasoning</div>
        <div style={cardExcerpt}>
          Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks.
        </div>
        <div style={chipRow}>
          <span style={chip(true)}>AI Methodology</span>
          <span style={chip()}>Prompting</span>
          <span style={chip()}>LLM</span>
        </div>
      </div>
    </div>
  );
}

function ContentCardReplica() {
  return (
    <div style={cardBase}>
      <div style={folioStrip}>
        <span>Article</span>
      </div>
      <div style={cardBody}>
        <div style={cardTitle}>Typography at Scale: Variable Fonts in Production</div>
        <div style={cardExcerpt}>
          How we migrated a legacy font stack to variable fonts, reduced load by 40%, and shipped with no visual regression.
        </div>
        <div style={chipRow}>
          <span style={chip(true)}>Engineering</span>
          <span style={chip()}>CSS</span>
          <span style={chip()}>Performance</span>
        </div>
        <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginTop: '0.25rem' }}>
          8 Jan 2024
        </div>
      </div>
    </div>
  );
}

function MetadataCardReplica() {
  return (
    <div style={{ ...cardBase, maxWidth: '300px', borderStyle: 'dashed' }}>
      <div style={{ ...folioStrip, background: 'transparent', borderBottom: '1px solid var(--st-color-border-subtle)' }}>
        <span>PROJ-002</span>
      </div>
      <div style={metaRow}>
        <span style={metaLabel}>Author</span>
        <span style={{ fontSize: '0.8125rem' }}>Bex</span>
      </div>
      <div style={metaRow}>
        <span style={metaLabel}>Status</span>
        <span style={{ fontSize: '0.8125rem' }}>Exploring</span>
      </div>
      <div style={metaRow}>
        <span style={metaLabel}>Tags</span>
        <div style={chipRow}>
          <span style={chip()}>Prompting</span>
          <span style={chip()}>LLM</span>
        </div>
      </div>
      <div style={{ ...metaRow, borderBottom: 'none', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)' }}>
          Published 14 Nov 2025
        </span>
      </div>
    </div>
  );
}

function CardComparisonTable() {
  const rows: Array<[string, string, string, string]> = [
    ['DS `Card`', '`packages/design-system`', 'None — raw card chrome', 'Custom surfaces, one-off layouts, Storybook stories'],
    ['`ContentCard`', '`apps/web/src/components`', 'article · node · caseStudy', 'Archive grids, taxonomy detail listings'],
    ['`MetadataCard`', '`apps/web/src/components`', 'article · node · caseStudy · project · page', 'Detail page right column — never re-implement inline'],
  ];
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Component</th>
            <th style={s.th}>Layer</th>
            <th style={s.th}>Binds to</th>
            <th style={s.th}>Canonical context</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([comp, layer, binds, ctx]) => (
            <tr key={comp}>
              <td style={s.tdMono}>{comp}</td>
              <td style={{ ...s.td, fontSize: '0.72rem', fontFamily: 'var(--st-font-family-mono)', color: 'var(--st-color-neutral-500)' }}>{layer}</td>
              <td style={s.td}>{binds}</td>
              <td style={s.td}>{ctx}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function CardCompositionPage() {
  return (
    <div style={s.page}>

      <h1 style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Card Composition Rules
      </h1>
      <p style={s.prose}>When to use DS <code style={s.code}>Card</code> vs <code style={s.code}>ContentCard</code> vs <code style={s.code}>MetadataCard</code> — and what each one owns.</p>

      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          Three card-shaped components exist in the codebase. They are not interchangeable — each occupies a distinct layer and context.
        </p>
        <ul style={s.list}>
          <OverviewItem>
            <strong>DS <code style={s.code}>Card</code></strong> — the raw primitive. Provides card chrome (border, background, optional folio strip) with no data binding. Lives in <code style={s.code}>packages/design-system</code>. Use when no existing higher-level card fits.
          </OverviewItem>
          <OverviewItem>
            <strong><code style={s.code}>ContentCard</code></strong> — binds to Sanity content types (article, node, caseStudy). Handles slug routing, TaxonomyChips, status chip, excerpt, and date. Lives in <code style={s.code}>apps/web/src/components</code>. Use in archive grids and taxonomy detail listings.
          </OverviewItem>
          <OverviewItem>
            <strong><code style={s.code}>MetadataCard</code></strong> — the canonical metadata surface for content detail pages. Renders structured label rows (author, status, tags, tools, date). Lives in <code style={s.code}>apps/web/src/components</code>. Use once per detail page. Never re-implement inline.
          </OverviewItem>
        </ul>
        <p style={{ ...s.prose, marginTop: '0.75rem' }}>Not in scope:</p>
        <ul style={s.list}>
          <NotItem><code style={s.code}>Card variant="listing"</code> — the flat document row. Used internally by ContentCard for the listing variant. Not a direct consumer API.</NotItem>
          <NotItem><code style={s.code}>Card variant="metadata"</code> — the metadata strip primitive used by MetadataCard. Not a direct consumer API.</NotItem>
        </ul>
      </DocSection>

      <DocSection n="06" title="Usage Guidelines" priority="must">

        <h3 style={s.h3}>Visual comparison</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '1.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--st-color-text-muted)', marginBottom: '0.5rem' }}>DS Card (primitive)</div>
            <DSCardReplica />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--st-color-text-muted)', marginBottom: '0.5rem' }}>ContentCard (Sanity-bound)</div>
            <ContentCardReplica />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--st-color-text-muted)', marginBottom: '0.5rem' }}>MetadataCard (detail page)</div>
            <MetadataCardReplica />
          </div>
        </div>

        <CardComparisonTable />

        <h3 style={s.h3}>ContentCard calling contexts</h3>
        <p style={s.prose}>
          ContentCard is context-agnostic — the surrounding layout changes, not the card itself.
        </p>
        <ol style={{ ...s.list, listStyleType: 'decimal', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Archive grid</strong> (<code style={s.code}>Pages/ArchivePage</code>) — rendered inside a <code style={s.code}>{'<Grid columns={3} spacing="lg">'}</code> with full item shape: <code style={s.code}>slug</code>, <code style={s.code}>excerpt</code>, <code style={s.code}>publishedAt</code>, taxonomy arrays. Pass <code style={s.code}>docType</code> to determine routing.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Taxonomy detail listing</strong> (<code style={s.code}>Pages/TaxonomyDetailPage</code>) — same ContentCard inside an <code style={s.code}>.archiveGrid</code> wrapper, no FilterBar. The card does not change between contexts.
          </li>
        </ol>

        <h3 style={s.h3}>Do / Don't</h3>
        <DoDontGrid>
          <DoGroup>
            <DoItem>Use <code style={s.code}>ContentCard</code> in archive grids and taxonomy detail pages — it handles routing, TaxonomyChips, and status chips automatically.</DoItem>
            <DoItem>Use <code style={s.code}>MetadataCard</code> once per detail page for structured metadata. It is the single source of truth for that surface.</DoItem>
            <DoItem>Use DS <code style={s.code}>Card</code> directly when you need raw card chrome and neither ContentCard nor MetadataCard fits the context.</DoItem>
          </DoGroup>
          <DontGroup>
            <DontItem>Render bare DS <code style={s.code}>Card</code> in an archive grid — it has no Sanity data binding, no routing, and no taxonomy chip logic.</DontItem>
            <DontItem>Re-implement ContentCard's listing layout inline in a page or template — ContentCard already covers the binding, routing, and chip rendering.</DontItem>
            <DontItem>Re-implement MetadataCard's label rows inline — divergent metadata layouts are a maintenance hazard. If MetadataCard lacks a row type, extend it via props.</DontItem>
          </DontGroup>
        </DoDontGrid>
      </DocSection>

      <DocSection n="07" title="Accessibility" priority="must">
        <ul style={s.a11yList}>
          <A11yItem label="Card link semantics">
            DS <code style={s.code}>Card</code> renders an <code style={s.code}>&lt;article&gt;</code> element. When <code style={s.code}>href</code> is passed, the title renders as an <code style={s.code}>&lt;a&gt;</code> — the entire card is not wrapped in a link. This avoids the "link contains interactive descendants" WCAG violation.
          </A11yItem>
          <A11yItem label="ContentCard heading level">
            ContentCard renders the title as <code style={s.code}>&lt;h3&gt;</code> inside a <code style={s.code}>&lt;article&gt;</code>. Archive pages using ContentCard should not place an <code style={s.code}>&lt;h3&gt;</code> above the grid — use <code style={s.code}>SectionLabel</code> (which renders a styled <code style={s.code}>&lt;h2&gt;</code>) instead.
          </A11yItem>
          <A11yItem label="MetadataCard label rows">
            MetadataCard label rows use <code style={s.code}>&lt;dt&gt;</code>/<code style={s.code}>&lt;dd&gt;</code> pairs inside a <code style={s.code}>&lt;dl&gt;</code>. Screen readers surface these as definition list terms. Do not replace MetadataCard with a plain <code style={s.code}>&lt;div&gt;</code> grid — the semantic structure is intentional.
          </A11yItem>
        </ul>
      </DocSection>

      <AiGeneratedFooter />

    </div>
  );
}
