import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const s = {
  page: { fontFamily: 'var(--st-font-family-ui, "DM Sans", sans-serif)', color: 'var(--st-color-text-primary)', lineHeight: 1.6 } as React.CSSProperties,
  h1: { fontFamily: 'var(--st-font-family-narrative, "Cormorant Garamond", serif)', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 400 } as React.CSSProperties,
  h2: { fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2.5rem', fontWeight: 600 } as React.CSSProperties,
  h3: { fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1.5rem', fontWeight: 600 } as React.CSSProperties,
  hr: { border: 'none', borderTop: '1px solid var(--st-color-border-default, rgba(0,0,0,0.1))', margin: '2rem 0' } as React.CSSProperties,
  th: { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-border-default, rgba(0,0,0,0.12))', fontWeight: 600, fontSize: '0.875rem' },
  td: { padding: '0.5rem 1rem', fontSize: '0.875rem', verticalAlign: 'top' as const },
  code: { background: 'var(--st-color-bg-surface-strong, rgba(0,0,0,0.06))', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono, "IBM Plex Mono", monospace)' } as React.CSSProperties,
  note: { background: 'var(--st-color-bg-surface-strong, rgba(0,0,0,0.04))', borderLeft: '3px solid var(--st-color-brand-primary, #FF247D)', padding: '0.75rem 1rem', margin: '1.5rem 0', fontSize: '0.875rem' } as React.CSSProperties,
  italic: { fontStyle: 'italic' as const },
  roman: { fontStyle: 'normal' as const },
};

const italicPreview: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-narrative, "Cormorant Garamond", serif)',
  fontSize: '2rem',
  fontWeight: 400,
  fontStyle: 'italic',
  lineHeight: 1.2,
  color: 'var(--st-color-text-primary)',
  margin: '0.25rem 0 0',
};

const romanPreview: React.CSSProperties = {
  ...italicPreview,
  fontStyle: 'normal',
};

function TypographyConventionsPage() {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Typography Conventions</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Decision records for typographic rules that live in code but weren't written down anywhere.</p>

      <hr style={s.hr} />

      {/* ---- H1 ITALIC RULE ---- */}
      <h2 style={s.h2}>H1 Italic / Roman Rule</h2>

      <p>
        Cormorant Garamond is the narrative typeface. Italic is its editorial register — the voice of a writer. Roman is its reference register — the voice of a catalogue.
        H1s are italic on editorial and narrative surfaces, roman on catalogue and reference surfaces.
      </p>
      <p>
        The rule is not "italic everywhere." It's <em>italic where the page is authored, roman where the page is looked up.</em>
      </p>

      <div style={s.note}>
        <strong>The question that triggered this doc:</strong> Should the H1 on <code style={s.code}>/projects/sugartown-cms</code> be italic? No — project pages are catalogue surfaces. The answer existed in <code style={s.code}>pages.module.css</code> but was never written down.
      </div>

      <h3 style={s.h3}>Live examples</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Surface</th>
            <th style={s.th}>Style</th>
            <th style={s.th}>Preview</th>
            <th style={s.th}>CSS class / mechanism</th>
            <th style={s.th}>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}>Article detail</td>
            <td style={s.td}><span style={s.italic}>Italic</span></td>
            <td style={s.td}><span style={italicPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.masthead h1</code> → global h1 narrative rule</td>
            <td style={s.td}>Cormorant Garamond editorial register — authored content</td>
          </tr>
          <tr>
            <td style={s.td}>Node detail</td>
            <td style={s.td}><span style={s.italic}>Italic</span></td>
            <td style={s.td}><span style={italicPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.masthead h1</code></td>
            <td style={s.td}>Same — nodes are authored narrative pieces</td>
          </tr>
          <tr>
            <td style={s.td}>Case study detail</td>
            <td style={s.td}><span style={s.italic}>Italic</span></td>
            <td style={s.td}><span style={italicPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.masthead h1</code></td>
            <td style={s.td}>Same — case studies are authored editorial work</td>
          </tr>
          <tr>
            <td style={s.td}>Archive mastheads (articles, nodes, KG, library)</td>
            <td style={s.td}><span style={s.italic}>Italic</span></td>
            <td style={s.td}><span style={italicPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.archiveHeading.archiveHeadingItalic</code></td>
            <td style={s.td}>Narrative index surfaces — archive of authored writing</td>
          </tr>
          <tr>
            <td style={s.td}>Homepage hero</td>
            <td style={s.td}><span style={s.italic}>Italic</span></td>
            <td style={s.td}><span style={italicPreview}>The title</span></td>
            <td style={s.td}>Hero section heading CSS</td>
            <td style={s.td}>Editorial register — homepage is a manifesto, not a catalogue</td>
          </tr>
          <tr>
            <td style={s.td}>Project detail</td>
            <td style={s.td}><span style={s.roman}>Roman</span></td>
            <td style={s.td}><span style={romanPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.projectName</code> — no <code style={s.code}>font-style</code> set</td>
            <td style={s.td}>Catalogue surface — projects are things you look up, not read</td>
          </tr>
          <tr>
            <td style={s.td}>Person detail</td>
            <td style={s.td}><span style={s.roman}>Roman</span></td>
            <td style={s.td}><span style={romanPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.entityFolio</code> pattern — no italic</td>
            <td style={s.td}>Reference surface — entity folio pattern</td>
          </tr>
          <tr>
            <td style={s.td}>Tool detail</td>
            <td style={s.td}><span style={s.roman}>Roman</span></td>
            <td style={s.td}><span style={romanPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.entityFolio</code> pattern</td>
            <td style={s.td}>Same — tools are catalogue entries</td>
          </tr>
          <tr>
            <td style={s.td}>Category / tag detail</td>
            <td style={s.td}><span style={s.roman}>Roman</span></td>
            <td style={s.td}><span style={romanPreview}>The title</span></td>
            <td style={s.td}><code style={s.code}>.entityFolio</code> pattern</td>
            <td style={s.td}>Same — taxonomy labels are reference, not prose</td>
          </tr>
        </tbody>
      </table>

      <h3 style={s.h3}>The decision rule</h3>
      <p>
        Ask: <em>is this page a piece of writing, or a thing you look up?</em>
      </p>
      <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
        <li><strong>Authored content</strong> (articles, nodes, case studies, archive indexes, homepage) → italic H1</li>
        <li><strong>Entity / catalogue surfaces</strong> (projects, people, tools, taxonomy) → roman H1</li>
      </ul>

      <h3 style={s.h3}>Key files</h3>
      <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
        <li><code style={s.code}>apps/web/src/pages/pages.module.css</code> — <code style={s.code}>.archiveHeadingItalic</code>, <code style={s.code}>.archiveHeading</code>, <code style={s.code}>.masthead</code></li>
        <li><code style={s.code}>apps/web/src/pages/ProjectDetailPage.module.css</code> — <code style={s.code}>.projectName</code> (no italic)</li>
        <li>Global h1–h4 narrative rule in base CSS — Cormorant Garamond applies to all headings; italic is an additive modifier applied per surface, not the default</li>
      </ul>

      <hr style={s.hr} />

      {/* ---- PHASE 2 CANDIDATES ---- */}
      <h2 style={s.h2}>Further conventions to document (Phase 2+)</h2>
      <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>These exist in code but have no decision record. Prioritise at Phase 1 close-out.</p>
      <ul style={{ paddingLeft: '1.5rem', lineHeight: 2, fontSize: '0.875rem' }}>
        <li><strong>Spacing contract</strong> — section gap vs component padding (the <code style={s.code}>.detailContext</code> gap model; parent owns spacing, children zero their margins)</li>
        <li><strong>Token naming rationale</strong> — why <code style={s.code}>--st-color-text-primary</code> ≠ <code style={s.code}>--st-color-brand-primary</code></li>
        <li><strong>Folio layout contract</strong> — eyebrow + thumbnail + name + description pattern; when to use vs masthead</li>
        <li><strong>Component composition rules</strong> — when Card vs ContentCard vs MetadataCard</li>
        <li><strong>Responsive breakpoint rationale</strong> — 860px table breakpoint, 768px nav breakpoint</li>
        <li><strong>Chip taxonomy</strong> — Chip vs Tag vs Pill usage distinctions</li>
      </ul>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Typography Conventions',
  component: TypographyConventionsPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
