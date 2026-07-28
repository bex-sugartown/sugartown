import React from 'react';
import {
  DocSection,
  DoDontGrid, DoGroup, DontGroup,
  OverviewItem, NotItem,
  A11yItem,
  TokenGroup, TokenRow,
  docStyles,
  AiGeneratedFooter,
} from '@sugartown/storybook-docs';

const s = {
  ...docStyles,
  page:     { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px', background: 'var(--st-color-bg)' },
  h1:       { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' },
  oneliner: { color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' },
};

// ─── Page component ───────────────────────────────────────────────────────────

export function EntityDetailPageDocsPage() {
  return (
    <div style={s.page}>

      <h1 style={s.h1}>Entity Detail Page</h1>
      <p style={s.oneliner}>The folio + sections layout used by person, tool, and project detail pages.</p>


      <DocSection n="01" title="Overview / Purpose" priority="must">
        <ul style={s.list}>
          <OverviewItem>Three entity types (Person, Tool, Project) share one layout shell: <code style={s.code}>PageHeader</code> + optional <code style={s.code}>MetadataCard</code> + <code style={s.code}>.detailContext</code> sections.</OverviewItem>
          <OverviewItem>They differ only in thumbnail size, H1 typography (italic vs roman), and which metadata fields the folio exposes.</OverviewItem>
          <OverviewItem>The folio flex layout (<code style={s.code}>.entityFolio</code>) and heading classes come from <code style={s.code}>pages.module.css</code> — never re-implement them inline.</OverviewItem>
        </ul>
        <ul style={s.list}>
          <NotItem>Do not use this pattern for content pages (articles, case studies, nodes) — those use different shells.</NotItem>
          <NotItem>Do not add a folio thumbnail to entity types that do not specify one (Project pages have no media prop).</NotItem>
        </ul>
      </DocSection>




      <DocSection n="06" title="Usage Guidelines" priority="must">
        <h3 style={s.h3}>Rule 1 — Folio pattern</h3>
        <p style={s.prose}>
          The folio is a flex row (<code style={s.code}>.entityFolio</code>) with a thumbnail on the
          left and an identity block (<code style={s.code}>.folioIdentity</code>) on the right.
          Never implement this flex layout by hand — use the shared classes from{' '}
          <code style={s.code}>pages.module.css</code>.
        </p>
        <pre style={s.pre}>{`<div className={pageStyles.entityFolio}>
  <Avatar name="Bex Walton" size="xl" />
  <div className={pageStyles.folioIdentity}>
    <h1 className={\`\${pageStyles.narrativeHeading} \${pageStyles.narrativeHeadingItalic}\`}>
      Bex Walton
    </h1>
    <p className={pageStyles.detailEyebrow}>Design Engineer</p>
  </div>
</div>`}</pre>

        <h3 style={s.h3}>Rule 2 — Thumbnail sizes</h3>
        <p style={s.prose}>
          Set <code style={s.code}>--entity-thumb-size</code> on <code style={s.code}>.entityFolio</code> —
          do not hardcode a width on the image element.
        </p>
        <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Entity type</th>
              <th style={s.th}><code style={s.code}>--entity-thumb-size</code></th>
              <th style={s.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>Person</td>
              <td style={s.td}>80px</td>
              <td style={s.td}>Avatar component, <code style={s.code}>size=&quot;xl&quot;</code></td>
            </tr>
            <tr>
              <td style={s.td}>Tool</td>
              <td style={s.td}>72px</td>
              <td style={s.td}>Logo image via <code style={s.code}>.entityThumbnail</code></td>
            </tr>
            <tr>
              <td style={s.td}>Project</td>
              <td style={s.td}>72px</td>
              <td style={s.td}>Logo image via <code style={s.code}>.entityThumbnail</code></td>
            </tr>
            <tr>
              <td style={s.td}>Default</td>
              <td style={s.td}>88px</td>
              <td style={s.td}>Fallback if prop is not set</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3 style={s.h3}>Rule 3 — H1 italic rule</h3>
        <p style={s.prose}>
          Person folios use italic Cormorant Garamond. All other entity types use roman.
          Full rationale: <strong>Foundations / Typography Conventions</strong>.
        </p>
        <DoDontGrid>
          <DoGroup>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.75rem', fontWeight: 600, fontStyle: 'italic', margin: '0 0 0.5rem' }}>Bex Walton</p>
              <code style={s.code}>.narrativeHeading.narrativeHeadingItalic</code>
              <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0.5rem 0 0' }}>Person — italic prop on PageHeader</p>
            </div>
          </DoGroup>
          <DontGroup>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.75rem', fontWeight: 600, fontStyle: 'normal', margin: '0 0 0.5rem' }}>Sanity</p>
              <code style={s.code}>.narrativeHeading</code>
              <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0.5rem 0 0' }}>Tool — omit <code style={s.code}>italic</code>, use roman only</p>
            </div>
          </DontGroup>
        </DoDontGrid>

        <h3 style={s.h3}>Rule 4 — Section spacing</h3>
        <p style={s.prose}>
          Content sections sit inside a <code style={s.code}>.detailContext</code> flex container
          (from <code style={s.code}>PageSections.module.css</code>). The container owns all
          inter-section gap via <code style={s.code}>display: flex; gap: var(--st-space-section-break-detail)</code>.
          Individual <code style={s.code}>&lt;section&gt;</code> elements must have zero{' '}
          <code style={s.code}>margin-block</code>. Full contract: <strong>Foundations / Layout / Section</strong>.
        </p>
        <pre style={s.pre}>{`<div className={sectionStyles.detailContext}>
  <section>
    <SectionLabel title="Articles" kicker="4" />
    <Grid columns={2} spacing="lg">...</Grid>
  </section>
  <section>
    <SectionLabel title="Knowledge Nodes" kicker="2" />
    <Grid columns={2} spacing="lg">...</Grid>
  </section>
</div>`}</pre>

        <h3 style={s.h3}>Implementation files</h3>
        <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>File</th>
              <th style={s.th}>What it owns</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['apps/web/src/pages/pages.module.css', '.entityFolio, .folioIdentity, .entityThumbnail, .narrativeHeading, .narrativeHeadingItalic'],
              ['apps/web/src/pages/PersonProfilePage.jsx', 'Person entity — applies .narrativeHeadingItalic'],
              ['apps/web/src/pages/ToolDetailPage.jsx', 'Tool entity — .narrativeHeading only (roman)'],
              ['apps/web/src/pages/ProjectDetailPage.jsx', 'Project entity — .narrativeHeading only (roman)'],
              ['apps/web/src/components/PageSections.module.css', '.detailContext — section spacing container'],
            ].map(([file, desc]) => (
              <tr key={file}>
                <td style={s.td}><code style={s.code}>{file}</code></td>
                <td style={s.td}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </DocSection>

      <DocSection n="07" title="Accessibility" priority="must">
        <ul style={s.a11yList}>
          <A11yItem label="Heading hierarchy">Each entity detail page must have exactly one <code style={s.code}>&lt;h1&gt;</code> — the entity name rendered via <code style={s.code}>PageHeader</code>. Section labels use <code style={s.code}>SectionLabel</code>, which renders a visually styled label without promoting to a heading level. Do not add a second <code style={s.code}>&lt;h1&gt;</code> within the page.</A11yItem>
          <A11yItem label="Avatar alt text">When an Avatar or entity thumbnail is decorative (the entity name is already in the adjacent <code style={s.code}>&lt;h1&gt;</code>), set <code style={s.code}>alt=&quot;&quot;</code> to suppress duplicate announcements. If the image is the only identity signal, provide a descriptive alt.</A11yItem>
          <A11yItem label="Landmark navigation">The entity shell wraps content in <code style={s.code}>&lt;main className={'{'}pageStyles.entityDetailPage{'}'}&gt;</code>. This provides the page&rsquo;s <code style={s.code}>main</code> landmark. Do not add a second <code style={s.code}>&lt;main&gt;</code> inside.</A11yItem>
          <A11yItem label="MetadataCard links">Category and tag chips inside MetadataCard are interactive links. Ensure each chip&rsquo;s label is descriptive enough to make sense out of context (e.g. &ldquo;Design Systems&rdquo; not just &ldquo;tag&rdquo;).</A11yItem>
          <A11yItem label="Focus order">The folio flex layout is CSS-only and does not reorder DOM nodes, so keyboard focus order matches visual order. No <code style={s.code}>tabindex</code> adjustments are needed.</A11yItem>
        </ul>
      </DocSection>

      <DocSection n="08" title="Design Tokens" priority="must">
        <TokenGroup label="Entity folio layout">
          <TokenRow token="--entity-thumb-size" value="80px / 72px / 88px" role="Thumbnail dimension — set per entity type on .entityFolio" />
        </TokenGroup>
        <TokenGroup label="Detail page shell">
          <TokenRow token="--st-width-detail" value="760px" role=".detailPage max-width — single-column prose shell" />
          <TokenRow token="--st-width-detail-wide" value="1080px" role=".detailPage[data-has-margin] max-width — two-column shell with sidebar" />
          <TokenRow token="--st-space-meta-top" value="32px" role="Top padding on .detailPage" />
          <TokenRow token="--st-space-section-break-detail" value="40px" role=".detailContext gap — inter-section spacing" />
          <TokenRow token="--st-space-sidebar" value="220px" role="Right metadata column fixed width" />
          <TokenRow token="--st-space-sidebar-gap" value="2.5rem" role="Column gap between prose and sidebar" />
        </TokenGroup>
      </DocSection>

      <AiGeneratedFooter />

    </div>
  );
}

