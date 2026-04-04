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
      <p>Sugartown ships four theme variants, each applied via <code style={s.code}>data-theme</code> on the root element.</p>

      <hr style={s.hr} />
      <h2 style={s.h2}>Available Themes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Theme</th>
            <th style={s.th}>Attribute</th>
            <th style={s.th}>Background</th>
            <th style={s.th}>Accent</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={s.td}>Dark (default)</td><td style={s.td}><code style={s.code}>dark</code></td><td style={s.td}><span style={s.swatch('#0D1226')} /> Navy</td><td style={s.td}><span style={s.swatch('#FF247D')} /> Pink</td></tr>
          <tr><td style={s.td}>Light</td><td style={s.td}><code style={s.code}>light</code></td><td style={s.td}><span style={s.swatch('#ffffff')} /> White</td><td style={s.td}><span style={s.swatch('#FF247D')} /> Pink</td></tr>
          <tr><td style={s.td}>Dark Pink Moon</td><td style={s.td}><code style={s.code}>dark-pink-moon</code></td><td style={s.td}><span style={s.swatch('#0D1226')} /> Navy</td><td style={s.td}><span style={s.swatch('#D1FF1D')} /> Lime</td></tr>
          <tr><td style={s.td}>Light Pink Moon</td><td style={s.td}><code style={s.code}>light-pink-moon</code></td><td style={s.td}><span style={s.swatch('#ffffff')} /> White</td><td style={s.td}><span style={s.swatch('#D1FF1D')} /> Lime</td></tr>
        </tbody>
      </table>

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
