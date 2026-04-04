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

function TokenReferencePage() {
  const tiers = [
    { tier: 'Tier 1', purpose: 'Raw primitives', example: '--st-color-pink-500', use: 'No' },
    { tier: 'Tier 2', purpose: 'Semantic aliases', example: '--st-color-brand-primary', use: 'Yes (preferred)' },
    { tier: 'Tier 3', purpose: 'Component tokens', example: '--st-card-border', use: 'Yes' },
  ];
  const spacing = [
    ['--st-space-1', '0.25rem', '4px'], ['--st-space-2', '0.5rem', '8px'], ['--st-space-3', '0.75rem', '12px'],
    ['--st-space-4', '1rem', '16px'], ['--st-space-5', '1.5rem', '24px'], ['--st-space-6', '2rem', '32px'],
    ['--st-space-7', '2.5rem', '40px'], ['--st-space-8', '3.75rem', '60px'],
  ];
  const radii = [
    ['--st-radius-xs', '4px', 'Chip, tag, button'], ['--st-radius-sm', '8px', 'Standard components'],
    ['--st-radius-md', '12px', 'Card, modal'], ['--st-radius-lg', '16px', 'Large containers'],
    ['--st-radius-xl', '35px', 'Hero, media'],
  ];
  const fonts = [
    ['--st-font-family-narrative', 'Playfair Display, serif', 'Headings, display'],
    ['--st-font-family-ui', 'Fira Sans, sans-serif', 'Body text, UI'],
    ['--st-font-family-mono', 'Fira Code, monospace', 'Code blocks'],
  ];

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Token Reference</h1>
      <p>All visual properties are driven by CSS custom properties. Components must reference semantic tokens.</p>

      <hr style={s.hr} />
      <h2 style={s.h2}>Token Tiers</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Tier</th><th style={s.th}>Purpose</th><th style={s.th}>Example</th><th style={s.th}>Use in components?</th></tr></thead>
        <tbody>{tiers.map(t => <tr key={t.tier}><td style={s.td}>{t.tier}</td><td style={s.td}>{t.purpose}</td><td style={s.td}><code style={s.code}>{t.example}</code></td><td style={s.td}>{t.use}</td></tr>)}</tbody>
      </table>

      <h2 style={s.h2}>Brand Colours</h2>
      <p><span style={s.swatch('#FF247D')} /> <code style={s.code}>--st-color-brand-primary</code> &mdash; Pink, primary accent</p>
      <p><span style={s.swatch('#2BD4AA')} /> <code style={s.code}>--st-color-brand-secondary</code> &mdash; Seafoam, secondary accent</p>

      <h2 style={s.h2}>Spacing</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Token</th><th style={s.th}>Value</th><th style={s.th}>Pixels</th></tr></thead>
        <tbody>{spacing.map(([tok, val, px]) => <tr key={tok}><td style={s.td}><code style={s.code}>{tok}</code></td><td style={s.td}>{val}</td><td style={s.td}>{px}</td></tr>)}</tbody>
      </table>

      <h2 style={s.h2}>Border Radius</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Token</th><th style={s.th}>Value</th><th style={s.th}>Use case</th></tr></thead>
        <tbody>{radii.map(([tok, val, use]) => <tr key={tok}><td style={s.td}><code style={s.code}>{tok}</code></td><td style={s.td}>{val}</td><td style={s.td}>{use}</td></tr>)}</tbody>
      </table>

      <h2 style={s.h2}>Typography</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Token</th><th style={s.th}>Stack</th><th style={s.th}>Use case</th></tr></thead>
        <tbody>{fonts.map(([tok, stack, use]) => <tr key={tok}><td style={s.td}><code style={s.code}>{tok}</code></td><td style={s.td}>{stack}</td><td style={s.td}>{use}</td></tr>)}</tbody>
      </table>

      <hr style={s.hr} />
      <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Token files must stay in sync: <code style={s.code}>apps/web/src/design-system/styles/tokens.css</code> and <code style={s.code}>packages/design-system/src/styles/tokens.css</code>.</p>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Token Reference',
  component: TokenReferencePage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
