import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VariantFrame } from './_PreviewFrame';
import { DoDontGrid, DoGroup, DontGroup } from '../helpers/docs';

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
};

// ─── Preview helpers ──────────────────────────────────────────────────────────

const sectionBlock = (_label: string, height = 64): React.CSSProperties => ({
  background: 'var(--st-color-bg-surface-strong)',
  border: '1px solid var(--st-color-border-default)',
  borderRadius: '4px',
  height,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '1rem',
  fontSize: '0.8rem',
  color: 'var(--st-color-text-muted)',
  fontFamily: 'var(--st-font-family-mono)',
});

const annotation = (_text: string, color = 'var(--st-color-text-muted)'): React.CSSProperties => ({
  fontSize: '0.75rem',
  color,
  textAlign: 'center',
  fontFamily: 'var(--st-font-family-mono)',
  padding: '0.15rem 0',
  background: 'var(--st-color-bg-surface)',
  border: `1px dashed ${color}`,
  borderRadius: '2px',
});

function CorrectShell() {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '1rem', border: '2px solid var(--st-color-status-success-bg, #22c55e)', borderRadius: '4px' }}>
        <div style={sectionBlock('TextSection — margin-block: 0')}>TextSection</div>
        <div style={sectionBlock('CalloutSection — margin-block: 0', 48)}>CalloutSection</div>
        <div style={sectionBlock('CodeSection — margin-block: 0')}>CodeSection</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <span style={annotation('gap: 40px (--st-space-section-break-detail)', 'var(--st-color-status-success-bg, #22c55e)')}>
          ↕ gap: 40px — parent (.detailContext) owns this
        </span>
      </div>
    </div>
  );
}

function WrongShell() {
  return (
    <div>
      <div style={{ padding: '1rem', border: '2px solid var(--st-color-status-danger-bg, #ef4444)', borderRadius: '4px' }}>
        <div style={{ ...sectionBlock('TextSection — margin-block: 40px'), marginBottom: '40px' }}>TextSection</div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <span style={annotation('80px (40 + 40 — stacked margins)', 'var(--st-color-status-danger-bg, #ef4444)')}>
              ↕ 80px — margin-block stacks at the boundary
            </span>
          </div>
        </div>
        <div style={{ ...sectionBlock('CalloutSection — margin-block: 40px', 48), marginBottom: '40px' }}>CalloutSection</div>
        <div style={sectionBlock('CodeSection — margin-block: 40px')}>CodeSection</div>
      </div>
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

function SectionSpacingPage() {
  return (
    <div style={s.page}>

      <h1 style={s.h1}>Section Spacing</h1>
      <p style={s.oneliner}>The parent container owns all inter-section gap. Components must not add external margin.</p>

      <hr style={s.hr} />

      <h2 style={s.h2}>The rule</h2>
      <p style={s.rule}>
        In detail page context, <code style={s.code}>.detailContext</code> owns spacing via{' '}
        <code style={s.code}>display: flex; gap: var(--st-space-section-break-detail)</code>.
        Individual sections must have zero <code style={s.code}>margin-block</code> — internal padding is allowed, external margin is not.
      </p>

      <h2 style={s.h2}>Live preview</h2>
      <VariantFrame variants={[
        {
          key: 'correct',
          label: 'Correct — parent owns gap',
          content: <CorrectShell />,
          code: `.detailContext {
  display: flex;
  flex-direction: column;
  gap: var(--st-space-section-break-detail); /* 40px */
}

/* Component CSS — internal padding only */
.mySection {
  padding: 1rem;
  /* NO margin-block here */
}`,
        },
        {
          key: 'wrong',
          label: 'Wrong — component adds margin',
          content: <WrongShell />,
          code: `/* Component CSS — this doubles the gap at every boundary */
.mySection {
  margin-block: var(--st-space-section-break-detail); /* 40 + 40 = 80px */
}`,
        },
      ]} />

      <h2 style={s.h2}>Do / Don't</h2>
      <DoDontGrid>
        <DoGroup>
          <pre style={{ ...s.pre, margin: 0 }}>{`.detailContext {
  display: flex;
  flex-direction: column;
  gap: var(--st-space-section-break-detail);
}

/* Component CSS */
.mySection {
  padding: 1rem; /* internal only */
}`}</pre>
        </DoGroup>
        <DontGroup>
          <pre style={{ ...s.pre, margin: 0 }}>{`/* Component CSS */
.mySection {
  /* doubles gap at every boundary */
  margin-block: var(--st-space-section-break-detail);
}`}</pre>
        </DontGroup>
      </DoDontGrid>

      <h2 style={s.h2}>Spacing tokens</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Token</th>
            <th style={s.th}>Value</th>
            <th style={s.th}>Used on</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}><code style={s.code}>--st-space-section-break-detail</code></td>
            <td style={s.td}>40px</td>
            <td style={s.td}><code style={s.code}>.detailContext</code> gap and MetadataCard boundary margin</td>
          </tr>
          <tr>
            <td style={s.td}><code style={s.code}>--st-width-detail</code></td>
            <td style={s.td}>760px</td>
            <td style={s.td}><code style={s.code}>.detailPage</code> max-width — single-column prose mode</td>
          </tr>
          <tr>
            <td style={s.td}><code style={s.code}>--st-width-detail-wide</code></td>
            <td style={s.td}>1080px</td>
            <td style={s.td}><code style={s.code}>.detailPage[data-has-margin]</code> max-width — two-column mode with sidebar</td>
          </tr>
          <tr>
            <td style={s.td}><code style={s.code}>--st-space-sidebar</code></td>
            <td style={s.td}>220px</td>
            <td style={s.td}>Fixed width of the right metadata column in two-column grid</td>
          </tr>
          <tr>
            <td style={s.td}><code style={s.code}>--st-space-sidebar-gap</code></td>
            <td style={s.td}>2.5rem</td>
            <td style={s.td}>Column gap between prose and sidebar in two-column shell</td>
          </tr>
          <tr>
            <td style={s.td}><code style={s.code}>--st-space-meta-top</code></td>
            <td style={s.td}>32px</td>
            <td style={s.td}>Top padding on <code style={s.code}>.detailPage</code></td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: '0.875rem', color: 'var(--st-color-text-muted)', marginTop: '-1rem' }}>
        Never hard-code these values. Every detail page spacing decision resolves through one of these tokens.
      </p>

      <h2 style={s.h2}>Boundary elements</h2>
      <p style={{ fontSize: '0.875rem' }}>
        Elements that sit <em>between</em> two spacing contexts (e.g. MetadataCard between the hero and{' '}
        <code style={s.code}>.detailContext</code>) belong to neither flex container. They need explicit margin:
      </p>
      <pre style={s.pre}>{`.detailPage > aside:first-child {
  margin-bottom: var(--st-space-section-break-detail);
}`}</pre>
      <p style={{ fontSize: '0.875rem' }}>
        When adding a new element to a detail page template, check whether it sits inside or outside the{' '}
        <code style={s.code}>.detailContext</code> wrapper. Outside elements need explicit margin; inside elements must have zero margin.
      </p>

      <h2 style={s.h2}>Adding a new section type</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2, fontSize: '0.875rem' }}>
        <li>If the component has its own <code style={s.code}>margin-block</code> in its CSS module, add a zero-margin override in <code style={s.code}>.detailContext</code> in <code style={s.code}>PageSections.module.css</code>.</li>
        <li>The <code style={s.code}>&gt; *</code> catch-all on <code style={s.code}>.detailContext</code> handles <code style={s.code}>width: 100%</code> and <code style={s.code}>margin: 0</code> automatically for new section types — no explicit registration needed.</li>
        <li>Internal box padding (callout inset, code block padding) is the component's concern. External spacing is the layout's concern.</li>
        <li>Test against <code style={s.code}>/articles/test-preview-post</code> to verify spacing at every transition between section types.</li>
      </ul>

      <h2 style={s.h2}>Implementation</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2, fontSize: '0.875rem' }}>
        <li><code style={s.code}>apps/web/src/pages/pages.module.css</code> — <code style={s.code}>.detailPage</code>, <code style={s.code}>.detailContext</code> (flex + gap), <code style={s.code}>.detailPage[data-has-margin]</code> (two-column shell)</li>
        <li><code style={s.code}>apps/web/src/components/PageSections.module.css</code> — <code style={s.code}>.detailContext &gt; *</code> catch-all override, per-component zero-margin exceptions</li>
        <li><code style={s.code}>apps/web/src/components/PageSections.jsx</code> — applies <code style={s.code}>context="detail"</code> which activates <code style={s.code}>.detailContext</code> on the wrapper</li>
      </ul>

    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Layout/Section',
  component: SectionSpacingPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
