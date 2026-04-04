import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const s = {
  page: { fontFamily: 'var(--st-font-family-ui, "Fira Sans", sans-serif)', color: 'var(--st-color-text-primary, rgba(255,255,255,0.85))', lineHeight: 1.6 } as React.CSSProperties,
  h1: { fontFamily: 'var(--st-font-family-narrative, "Playfair Display", serif)', fontSize: '2.5rem', marginBottom: '0.5rem' } as React.CSSProperties,
  h2: { fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem' } as React.CSSProperties,
  h3: { fontSize: '1.1rem', marginBottom: '0.5rem', marginTop: '1.5rem' } as React.CSSProperties,
  hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' } as React.CSSProperties,
  th: { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 },
  td: { padding: '0.5rem 1rem' },
  code: { background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
};

function ComponentContractsPage() {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Component Contracts</h1>
      <p>Key architectural decisions behind the Sugartown component system.</p>

      <hr style={s.hr} />
      <h2 style={s.h2}>Three-Layer Card Architecture</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Layer</th><th style={s.th}>Location</th><th style={s.th}>Responsibility</th></tr></thead>
        <tbody>
          <tr><td style={s.td}><strong>DS Card</strong></td><td style={s.td}><code style={s.code}>packages/design-system/</code></td><td style={s.td}>Named-prop API, pure presentation</td></tr>
          <tr><td style={s.td}><strong>Web Card</strong></td><td style={s.td}><code style={s.code}>apps/web/src/design-system/</code></td><td style={s.td}>SPA navigation, CSS sync</td></tr>
          <tr><td style={s.td}><strong>ContentCard / MetadataCard</strong></td><td style={s.td}><code style={s.code}>apps/web/src/components/</code></td><td style={s.td}>Sanity data mapping to Card props</td></tr>
        </tbody>
      </table>

      <h3 style={s.h3}>When to Use Which</h3>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li><strong>ContentCard</strong> &mdash; archive pages and listings. Maps docType to card variant.</li>
        <li><strong>MetadataCard</strong> &mdash; detail page metadata sidebars. Field grid via children.</li>
        <li><strong>DS Card</strong> &mdash; only in Storybook stories or the DS package. Never import directly in web pages.</li>
      </ul>

      <hr style={s.hr} />
      <h2 style={s.h2}>PortableText Serializer Contract</h2>
      <p>Multiple files define PortableText component objects. When adding a new mark or block type, <strong>all instances must be updated</strong>:</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>File</th><th style={s.th}>Context</th></tr></thead>
        <tbody>
          <tr><td style={s.td}><code style={s.code}>src/lib/portableTextComponents.jsx</code></td><td style={s.td}>Shared PT for article/node/case study</td></tr>
          <tr><td style={s.td}><code style={s.code}>src/components/PageSections.jsx</code></td><td style={s.td}>Section builder text sections</td></tr>
          <tr><td style={s.td}><code style={s.code}>src/components/portableTextComponents.jsx</code></td><td style={s.td}>Page-level PT components</td></tr>
        </tbody>
      </table>

      <hr style={s.hr} />
      <h2 style={s.h2}>Section Layout Contract</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li><strong>Horizontal containment</strong> &mdash; inherited from parent in detail context</li>
        <li><strong>Vertical rhythm</strong> &mdash; padding-block only, using <code style={s.code}>--st-spacing-stack-lg</code></li>
        <li><strong>Typography</strong> &mdash; body uses heading-4, headings use the heading scale</li>
      </ol>

      <hr style={s.hr} />
      <h2 style={s.h2}>URL Construction</h2>
      <p>All URLs built via <code style={s.code}>getCanonicalPath(&#123; docType, slug &#125;)</code> from <code style={s.code}>routes.js</code>. Never hard-code URL strings.</p>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Component Contracts',
  component: ComponentContractsPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
