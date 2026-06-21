import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AiGeneratedFooter } from '../helpers/docs';

const s = {
  page:     { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px' } as React.CSSProperties,
  h1:       { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem', fontStyle: 'normal' } as React.CSSProperties,
  oneliner: { color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' } as React.CSSProperties,
  h2:       { fontSize: '1.2rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' } as React.CSSProperties,
  rule:     { fontWeight: 700, fontSize: '1.05rem', borderLeft: '3px solid var(--st-color-brand-primary)', paddingLeft: '1rem', margin: '1rem 0 1.5rem' } as React.CSSProperties,
  hr:       { border: 'none', borderTop: '1px solid var(--st-color-border-default)', margin: '2rem 0' } as React.CSSProperties,
  th:       { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-border-default)', fontWeight: 600, fontSize: '0.875rem' },
  td:       { padding: '0.5rem 1rem', fontSize: '0.875rem', verticalAlign: 'top' as const },
  code:     { background: 'var(--st-color-bg-surface-strong)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85em', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
  whenCol:  { flex: 1, padding: '1rem', background: 'var(--st-color-bg-surface-strong)', borderRadius: '4px' } as React.CSSProperties,
  pairRow:  { display: 'flex', gap: '1rem', marginBottom: '1.5rem' } as React.CSSProperties,
  label:    { fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' } as React.CSSProperties,
  doBox:    { flex: 1, padding: '1rem', borderTop: '3px solid #16a34a' } as React.CSSProperties,
  dontBox:  { flex: 1, padding: '1rem', borderTop: '3px solid #dc2626' } as React.CSSProperties,
};

const italic: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-narrative)',
  fontSize: '1.75rem',
  fontWeight: 600,
  fontStyle: 'italic',
  lineHeight: 1.2,
  color: 'var(--st-color-text-primary)',
};
const roman: React.CSSProperties = { ...italic, fontStyle: 'normal' };

function TypographyConventionsPage() {
  return (
    <div style={s.page}>

      <h1 style={s.h1}>H1 Italic / Roman Rule</h1>
      <p style={s.oneliner}>Which page surfaces render H1 in italic Cormorant Garamond and which use roman.</p>

      <hr style={s.hr} />

      <h2 style={s.h2}>The rule</h2>
      <p style={s.rule}>
        Archive mastheads and person folios use italic. Hero surfaces and all other entity folios use roman.
      </p>

      <h2 style={s.h2}>When to use</h2>
      <div style={s.pairRow}>
        <div style={s.whenCol}>
          <p style={s.label}>Italic</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 2 }}>
            <li>Archive mastheads — <em>Library</em>, <em>Agentic Caucus Nodes</em>, etc.</li>
            <li>Person folio — <em>Becky Alice Head</em></li>
          </ul>
        </div>
        <div style={s.whenCol}>
          <p style={s.label}>Roman</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 2 }}>
            <li>Hero component — all editorial and content pages</li>
            <li>Project, tool, tag, category folios</li>
            <li>Series page</li>
          </ul>
        </div>
      </div>

      <h2 style={s.h2}>Examples</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Surface</th>
            <th style={s.th}>Style</th>
            <th style={s.th}>Preview</th>
            <th style={s.th}>CSS mechanism</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}>Archive masthead<br /><span style={{ color: 'var(--st-color-text-muted)', fontSize: '0.8em' }}>Library, Agentic Caucus Nodes, etc.</span></td>
            <td style={s.td}>Italic</td>
            <td style={s.td}><span style={italic}>Library</span></td>
            <td style={s.td}><code style={s.code}>.archiveHeading.archiveHeadingItalic</code></td>
          </tr>
          <tr>
            <td style={s.td}>Person folio</td>
            <td style={s.td}>Italic</td>
            <td style={s.td}><span style={italic}>Becky Alice Head</span></td>
            <td style={s.td}><code style={s.code}>.narrativeHeading.narrativeHeadingItalic</code></td>
          </tr>
          <tr>
            <td style={s.td}>Hero<br /><span style={{ color: 'var(--st-color-text-muted)', fontSize: '0.8em' }}>Article, node, editorial pages, homepage</span></td>
            <td style={s.td}>Roman</td>
            <td style={s.td}><span style={roman}>The Epic That Executed Itself</span></td>
            <td style={s.td}><code style={s.code}>Hero .heading</code> — inherits global h1 rule, no italic</td>
          </tr>
          <tr>
            <td style={s.td}>Project folio</td>
            <td style={s.td}>Roman</td>
            <td style={s.td}><span style={roman}>Sugartown CMS</span></td>
            <td style={s.td}><code style={s.code}>.narrativeHeading</code> — roman by default</td>
          </tr>
          <tr>
            <td style={s.td}>Tool folio</td>
            <td style={s.td}>Roman</td>
            <td style={s.td}><span style={roman}>Vercel</span></td>
            <td style={s.td}><code style={s.code}>.narrativeHeading</code> — roman by default</td>
          </tr>
          <tr>
            <td style={s.td}>Tag / category folio</td>
            <td style={s.td}>Roman</td>
            <td style={s.td}><span style={roman}>POC</span></td>
            <td style={s.td}><code style={s.code}>.archiveHeading</code> — no italic modifier applied</td>
          </tr>
        </tbody>
      </table>

      <h2 style={s.h2}>Do / Don't</h2>
      <div style={s.pairRow}>
        <div style={s.doBox}>
          <p style={{ ...s.label, color: '#16a34a' }}>Do</p>
          <p style={italic}>Agentic Caucus Nodes</p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Italic on archive mastheads — they are named, curated spaces.</p>
        </div>
        <div style={s.dontBox}>
          <p style={{ ...s.label, color: '#dc2626' }}>Don't</p>
          <p style={italic}>Vercel</p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Italic on tool folios — tools are catalogue entries, not voices.</p>
        </div>
      </div>
      <div style={s.pairRow}>
        <div style={s.doBox}>
          <p style={{ ...s.label, color: '#16a34a' }}>Do</p>
          <p style={roman}>The Epic That Executed Itself</p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Roman in Hero — large roman at weight 600 reads as a proclamation.</p>
        </div>
        <div style={s.dontBox}>
          <p style={{ ...s.label, color: '#dc2626' }}>Don't</p>
          <p style={italic}>The Epic That Executed Itself</p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Italic in Hero — lighter, less commanding at hero scale.</p>
        </div>
      </div>

      <h2 style={s.h2}>Implementation</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
        <li><code style={s.code}>apps/web/src/pages/pages.module.css</code> — <code style={s.code}>.narrativeHeading</code> (roman default), <code style={s.code}>.narrativeHeadingItalic</code> (person modifier), <code style={s.code}>.archiveHeading</code>, <code style={s.code}>.archiveHeadingItalic</code></li>
        <li><code style={s.code}>apps/web/src/pages/PersonProfilePage.jsx</code> — applies both <code style={s.code}>.narrativeHeading .narrativeHeadingItalic</code></li>
        <li><code style={s.code}>apps/web/src/pages/ToolDetailPage.jsx</code> — applies <code style={s.code}>.narrativeHeading</code> only (roman)</li>
        <li><code style={s.code}>apps/web/src/components/Hero.module.css</code> — <code style={s.code}>.heading</code> sets font-size only; roman via global h1 rule in <code style={s.code}>globals.css</code></li>
      </ul>

      <h2 style={s.h2}>Adding a new entity type</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
        <li>Ask: does this entity have a voice or point of view? If yes (person) → use <code style={s.code}>.narrativeHeading.narrativeHeadingItalic</code>.</li>
        <li>If it is a platform, project, tool, tag, or any catalogue item → use <code style={s.code}>.narrativeHeading</code> alone.</li>
        <li>If it is an archive masthead → use <code style={s.code}>.archiveHeading.archiveHeadingItalic</code>.</li>
      </ul>

      <AiGeneratedFooter />

    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Typography Conventions',
  component: TypographyConventionsPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true }, chromatic: { disableSnapshot: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
