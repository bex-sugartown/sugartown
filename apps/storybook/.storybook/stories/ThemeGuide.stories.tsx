import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const s = {
  page: { fontFamily: 'var(--st-font-family-ui, "Fira Sans", sans-serif)', color: 'var(--st-color-text-primary, rgba(255,255,255,0.85))', lineHeight: 1.6 } as React.CSSProperties,
  h1: { fontFamily: 'var(--st-font-family-narrative, "Playfair Display", serif)', fontSize: '2.5rem', marginBottom: '0.5rem' } as React.CSSProperties,
  h2: { fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem' } as React.CSSProperties,
  hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' } as React.CSSProperties,
  th: { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 },
  td: { padding: '0.5rem 1rem' },
  code: { background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
  swatch: (bg: string) => ({ display: 'inline-block', width: 16, height: 16, borderRadius: 3, background: bg, marginRight: 8, verticalAlign: 'middle' } as React.CSSProperties),
};

function ThemeGuidePage() {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Theme Guide</h1>
      <p>Sugartown has two active themes. Both are Pink Moon variants applied via <code style={s.code}>data-theme</code> on the root element. Legacy <code style={s.code}>light</code> and <code style={s.code}>dark</code> values are deprecated.</p>

      <hr style={s.hr} />
      <h2 style={s.h2}>Active Themes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Theme</th>
            <th style={s.th}>Attribute</th>
            <th style={s.th}>Canvas</th>
            <th style={s.th}>Accent</th>
            <th style={s.th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={s.td}><strong>Pink Moon Light</strong></td><td style={s.td}><code style={s.code}>light-pink-moon</code></td><td style={s.td}><span style={s.swatch('#F2F2F3')} /> neutral-100</td><td style={s.td}><span style={s.swatch('#FF247D')} /> Pink</td><td style={s.td}>Default — set on page load</td></tr>
          <tr><td style={s.td}>Pink Moon Dark</td><td style={s.td}><code style={s.code}>dark-pink-moon</code></td><td style={s.td}><span style={s.swatch('#0D1226')} /> Midnight</td><td style={s.td}><span style={s.swatch('#FF247D')} /> Pink</td><td style={s.td}>Toggle via ThemeToggle</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Deprecated: <code style={s.code}>light</code> and <code style={s.code}>dark</code> — pre-Pink Moon values, no longer accepted by the theme validator in <code style={s.code}>index.html</code> or exposed in the Storybook toolbar.</p>

      <h2 style={s.h2}>How Themes Work</h2>
      <p>Each theme is a CSS file that overrides semantic tokens. Components reference tokens like <code style={s.code}>--st-color-brand-primary</code> which resolve differently per theme. No component ever references a raw colour value.</p>

      <h2 style={s.h2}>Switching Themes</h2>
      <ul style={{ paddingLeft: '1.5rem' }}>
        <li><strong>Storybook:</strong> Use the Theme toolbar dropdown (top centre).</li>
        <li><strong>Web app:</strong> ThemeToggle in the Preheader cycles variants and persists to localStorage.</li>
      </ul>

      <h2 style={s.h2}>Adding a New Theme</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Create <code style={s.code}>theme.&#123;name&#125;.css</code> in <code style={s.code}>packages/design-system/src/styles/</code></li>
        <li>Override the semantic token layer (Tier 2) &mdash; never Tier 1 primitives</li>
        <li>Import in both <code style={s.code}>preview.ts</code> (Storybook) and <code style={s.code}>globals.css</code> (web)</li>
        <li>Add to <code style={s.code}>THEME_BG</code> in preview.ts and ThemeToggle cycle array</li>
      </ol>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Theme Guide',
  component: ThemeGuidePage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
