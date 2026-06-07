import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Grid, SectionLabel, Breadcrumb, PageHeader, Avatar } from '../../../../apps/web/src/design-system';
import MetadataCard from '../../../../apps/web/src/components/MetadataCard';
import ContentCard from '../../../../apps/web/src/components/ContentCard';
import { mockArticles } from '../../../../apps/web/src/components/__fixtures__/mockContentCards';
import pageStyles from '../../../../apps/web/src/pages/pages.module.css';
import sectionStyles from '../../../../apps/web/src/components/PageSections.module.css';
import { VariantFrame } from './_PreviewFrame';

const s = {
  page:     { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px', background: 'var(--st-color-bg)' } as React.CSSProperties,
  h1:       { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' } as React.CSSProperties,
  oneliner: { color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' } as React.CSSProperties,
  h2:       { fontSize: '1.2rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' } as React.CSSProperties,
  rule:     { fontWeight: 700, fontSize: '1.05rem', borderLeft: '3px solid var(--st-color-brand-primary)', paddingLeft: '1rem', margin: '1rem 0 1.5rem' } as React.CSSProperties,
  hr:       { border: 'none', borderTop: '1px solid var(--st-color-border-default)', margin: '2rem 0' } as React.CSSProperties,
  th:       { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-border-default)', fontWeight: 600, fontSize: '0.875rem' },
  td:       { padding: '0.5rem 1rem', fontSize: '0.875rem', verticalAlign: 'top' as const },
  code:     { background: 'var(--st-color-bg-surface-strong)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85em', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
  pre:      { background: 'var(--st-color-bg-surface-strong)', padding: '0.75rem', borderRadius: '3px', fontSize: '0.8rem', fontFamily: 'var(--st-font-family-mono)', whiteSpace: 'pre-wrap' as const, margin: '0.5rem 0 1.5rem', overflowX: 'auto' as const } as React.CSSProperties,
  ddGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: '1.5rem' } as React.CSSProperties,
  ddCol:    { border: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  ddHd:     { padding: '9px 14px', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, borderBottom: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  ddDoHd:   { color: 'var(--st-color-seafoam-700)', background: 'color-mix(in srgb, var(--st-color-seafoam) 5%, white)', borderLeft: '3px solid var(--st-color-seafoam)' } as React.CSSProperties,
  ddDontHd: { color: 'var(--st-color-pink-700)', background: 'color-mix(in srgb, var(--st-color-pink) 4%, white)', borderLeft: '3px solid var(--st-color-pink)' } as React.CSSProperties,
};

// ─── Live preview shells ──────────────────────────────────────────────────────

function PreviewShell({ heading, description, media, tint, italic, metadata }: {
  heading: string;
  description: string;
  media?: React.ReactNode;
  tint?: string;
  italic?: boolean;
  metadata?: React.ComponentProps<typeof MetadataCard>;
}) {
  return (
    <main className={pageStyles.entityDetailPage} style={{ maxWidth: '860px' }}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
        media={media}
        title={heading}
        italic={italic}
        description={description}
        tint={tint}
      />
      {metadata && <MetadataCard {...metadata} />}
      <div className={sectionStyles.detailContext}>
        <section>
          <SectionLabel title="Articles" kicker={String(mockArticles.length)} />
          <Grid columns={2} spacing="lg">
            {mockArticles.map(item => (
              <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      </div>
    </main>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

function EntityDetailPageDocsPage() {
  return (
    <div style={s.page}>

      <h1 style={s.h1}>Entity Detail Page</h1>
      <p style={s.oneliner}>The folio + sections layout used by person, tool, and project detail pages.</p>

      <hr style={s.hr} />

      <h2 style={s.h2}>The pattern</h2>
      <p style={s.rule}>
        Three entity types share one shell: <code style={s.code}>PageHeader</code> + optional{' '}
        <code style={s.code}>MetadataCard</code> + <code style={s.code}>.detailContext</code> sections.
        They differ only in thumbnail size, H1 style, and which metadata fields the folio exposes.
      </p>

      <h2 style={s.h2}>Live preview</h2>
      <MemoryRouter>
        <VariantFrame variants={[
          {
            key: 'person',
            label: 'Person (/people/:slug)',
            content: (
              <PreviewShell
                heading="Bex Walton"
                description="Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller."
                media={<Avatar name="Bex Walton" size="xl" />}
                tint="var(--st-color-seafoam-300)"
                italic
                metadata={{
                  contentType: 'Person',
                  contentTypeHref: '/people',
                  categories: [{ _id: 'c1', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }],
                  tags: [{ _id: 't1', name: 'Design Systems', slug: 'design-systems' }],
                }}
              />
            ),
            code: `<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
  media={<Avatar name="Bex Walton" size="xl" />}
  title="Bex Walton"
  italic   {/* Person folios only */}
  tint="var(--st-color-seafoam-300)"
  description="Design engineer and content strategist…"
/>
<MetadataCard contentType="Person" contentTypeHref="/people" categories={[…]} tags={[…]} />`,
          },
          {
            key: 'tool',
            label: 'Tool (/tools/:slug)',
            content: (
              <PreviewShell
                heading="Sanity"
                description="Headless CMS with a real-time collaborative editing experience and a developer-first content lake architecture."
                media={<Avatar name="Sanity" size="xl" />}
                tint="var(--st-color-midnight-300)"
                metadata={{
                  contentType: 'Tool',
                  contentTypeHref: '/tools',
                  tags: [{ _id: 't2', name: 'CMS', slug: 'cms' }, { _id: 't3', name: 'Headless', slug: 'headless' }],
                }}
              />
            ),
            code: `<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: 'Tools', href: '/tools' }]} />}
  media={<Avatar name="Sanity" size="xl" />}
  title="Sanity"
  {/* No italic — tool folios use roman */}
  tint="var(--st-color-midnight-300)"
  description="Headless CMS…"
/>
<MetadataCard contentType="Tool" contentTypeHref="/tools" tags={[…]} />`,
          },
          {
            key: 'project',
            label: 'Project (/projects/:slug)',
            content: (
              <PreviewShell
                heading="Mini Repo"
                description="A minimal monorepo scaffold with pnpm workspaces, Turbo, and a shared design system."
                tint="#00B4A6"
                metadata={{
                  contentType: 'Project',
                  contentTypeHref: '/projects',
                  status: 'live',
                  categories: [{ _id: 'c1', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }],
                  tags: [{ _id: 't1', name: 'Design Systems', slug: 'design-systems' }],
                }}
              />
            ),
            code: `<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: 'Projects', href: '/projects' }]} />}
  {/* No media prop — projects have no folio thumbnail */}
  title="Mini Repo"
  tint="#00B4A6"
  description="A minimal monorepo scaffold…"
/>
<MetadataCard contentType="Project" status="live" categories={[…]} tags={[…]} />`,
          },
        ]} />
      </MemoryRouter>

      <hr style={s.hr} />

      <h2 style={s.h2}>Rule 1 — Folio pattern</h2>
      <p style={{ fontSize: '0.875rem' }}>
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

      <h2 style={s.h2}>Rule 2 — Thumbnail sizes</h2>
      <p style={{ fontSize: '0.875rem' }}>
        Set <code style={s.code}>--entity-thumb-size</code> on <code style={s.code}>.entityFolio</code> —
        do not hardcode a width on the image element.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
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
            <td style={s.td}>Avatar component, <code style={s.code}>size="xl"</code></td>
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

      <h2 style={s.h2}>Rule 3 — H1 italic rule</h2>
      <p style={{ fontSize: '0.875rem' }}>
        Person folios use italic Cormorant Garamond. All other entity types use roman.
        Full rationale: <strong>Foundations / Typography Conventions</strong>.
      </p>
      <div style={s.ddGrid}>
        <div style={s.ddCol}>
          <div style={{ ...s.ddHd, ...s.ddDoHd }}>Do</div>
          <div style={{ padding: '1rem' }}>
            <p style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.75rem', fontWeight: 600, fontStyle: 'italic', margin: '0 0 0.5rem' }}>Bex Walton</p>
            <code style={s.code}>.narrativeHeading.narrativeHeadingItalic</code>
            <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0.5rem 0 0' }}>Person — italic prop on PageHeader</p>
          </div>
        </div>
        <div style={s.ddCol}>
          <div style={{ ...s.ddHd, ...s.ddDontHd }}>Don't</div>
          <div style={{ padding: '1rem' }}>
            <p style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.75rem', fontWeight: 600, fontStyle: 'normal', margin: '0 0 0.5rem' }}>Sanity</p>
            <code style={s.code}>.narrativeHeading</code>
            <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0.5rem 0 0' }}>Tool — omit <code style={s.code}>italic</code>, use roman only</p>
          </div>
        </div>
      </div>

      <h2 style={s.h2}>Rule 4 — Section spacing</h2>
      <p style={{ fontSize: '0.875rem' }}>
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

      <h2 style={s.h2}>Implementation</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
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
  );
}

const meta: Meta = {
  title: 'Pages/EntityDetailPage',
  component: EntityDetailPageDocsPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Guidelines: Story = {};
