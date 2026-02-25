/**
 * Foundations/Colors — Sugartown Pink design token palette.
 *
 * Documents all three tiers of the colour token system:
 *   Tier 1: Base/Primitive  (--st-color-{name}-{step})
 *   Tier 2: Semantic        (--st-color-{role})
 *   Tier 3: Component       (--st-card-*, --st-button-*, …)
 *
 * Not a React component — pure documentation.
 */
import React from 'react';
import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
};

export default meta;

// ─── Primitives ───────────────────────────────────────────────────────────────

const Swatch = ({
  token,
  hex,
  label,
}: {
  token: string;
  hex: string;
  label?: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '10px',
    }}
  >
    <div
      style={{
        width: '52px',
        height: '52px',
        borderRadius: '8px',
        background: hex,
        border: hex === '#FFFFFF' || hex === '#f8f8fa' || hex === '#F7F7F7' || hex === '#f1f2f4'
          ? '1px solid #e5e5e5'
          : '1px solid rgba(0,0,0,0.06)',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
      }}
    />
    <div>
      <div
        style={{
          fontFamily: 'Menlo, Monaco, Consolas, monospace',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#111',
          letterSpacing: '0.02em',
        }}
      >
        {token}
      </div>
      <div
        style={{
          fontFamily: 'Menlo, Monaco, Consolas, monospace',
          fontSize: '0.68rem',
          color: '#888',
          marginTop: '1px',
          letterSpacing: '0.03em',
        }}
      >
        {hex}
      </div>
      {label && (
        <div
          style={{
            fontSize: '0.72rem',
            color: '#aaa',
            marginTop: '2px',
            fontStyle: 'italic',
          }}
        >
          {label}
        </div>
      )}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h3
      style={{
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#aaa',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

// ─── Story: Brand palette ──────────────────────────────────────────────────────

export const BrandPalette = {
  name: 'Brand Palette',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Section title="Tier 1 — Brand primitives">
        <Swatch token="--st-color-pink-500"    hex="#ff247d"  label="Sugartown Pink — primary accent" />
        <Swatch token="--st-color-lime-500"    hex="#D1FF1D"  label="Lime — secondary button bg" />
        <Swatch token="--st-color-seafoam-500" hex="#2BD4AA"  label="Seafoam" />
        <Swatch token="--st-color-maroon-500"  hex="#b91c68"  label="Maroon — brand secondary, link hover" />
      </Section>

      <Section title="Tier 2 — Semantic brand aliases">
        <Swatch token="--st-color-brand-primary"   hex="#ff247d" label="→ pink-500  ·  card border, eyebrow, focus" />
        <Swatch token="--st-color-brand-secondary" hex="#b91c68" label="→ maroon-500  ·  link hover" />
        <Swatch token="--st-color-accent-primary"  hex="#ff247d" label="→ pink-500  ·  chip default, tag accent" />
        <Swatch token="--st-color-accent-soft"     hex="rgba(255,36,125,0.08)" label="8 % pink — hover bg for chips / tertiary button" />
      </Section>
    </div>
  ),
};

// ─── Story: Neutral palette ────────────────────────────────────────────────────

export const NeutralPalette = {
  name: 'Neutral Palette',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Section title="Tier 1 — Neutral primitives">
        <Swatch token="--st-color-void-900"     hex="#0D1226" label="Void — dark canvas, code bg" />
        <Swatch token="--st-color-charcoal-900" hex="#1e1e1e" label="Charcoal — default text" />
        <Swatch token="--st-color-grey-900"     hex="#171717" />
        <Swatch token="--st-color-grey-600"     hex="#525252" />
        <Swatch token="--st-color-grey-400"     hex="#94A3B8" label="Muted text, meta, placeholders" />
        <Swatch token="--st-color-grey-300"     hex="#D4D4D4" />
        <Swatch token="--st-color-grey-200"     hex="#E5E5E5" label="Border medium" />
        <Swatch token="--st-color-grey-100"     hex="#F7F7F7" label="Background secondary" />
        <Swatch token="--st-color-grey-050"     hex="#f8f8fa" label="Background alt" />
        <Swatch token="--st-color-grey-040"     hex="#f1f2f4" label="Background subtle" />
        <Swatch token="--st-color-grey-030"     hex="#e1e3e6" label="Border subtle" />
        <Swatch token="--st-color-white"        hex="#FFFFFF" />
      </Section>

      <Section title="Tier 2 — Semantic neutrals">
        <Swatch token="--st-color-bg-canvas"    hex="#FFFFFF" label="→ white" />
        <Swatch token="--st-color-bg-surface"   hex="#FFFFFF" label="→ white  ·  card bg" />
        <Swatch token="--st-color-bg-void"      hex="#0D1226" label="→ void-900  ·  dark card bg" />
        <Swatch token="--st-color-text-default" hex="#1e1e1e" label="→ charcoal-900" />
        <Swatch token="--st-color-text-muted"   hex="#94A3B8" label="→ grey-400" />
        <Swatch token="--st-color-border-default" hex="rgba(0,0,0,0.08)" label="8% black alpha — subtle dividers" />
      </Section>
    </div>
  ),
};

// ─── Story: Semantic / status colours ─────────────────────────────────────────

export const StatusColors = {
  name: 'Status Colors',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Section title="Tier 1 — Semantic primitives">
        <Swatch token="--st-color-blue-500"  hex="#0066CC" />
        <Swatch token="--st-color-blue-600"  hex="#0052A3" />
        <Swatch token="--st-color-red-500"   hex="#b91c68" label="Danger" />
      </Section>

      <Section title="Status badge colours (archive cards / data-status attr)">
        <Swatch token="active"      hex="#059669" label="data-status=active" />
        <Swatch token="shipped"     hex="#d97706" label="data-status=shipped" />
        <Swatch token="in-progress" hex="#2563eb" label="data-status=in-progress" />
        <Swatch token="paused"      hex="#9ca3af" label="data-status=paused" />
        <Swatch token="archived"    hex="#6b7280" label="data-status=archived" />
        <Swatch token="draft"       hex="#7c3aed" label="data-status=draft" />
      </Section>
    </div>
  ),
};

// ─── Story: Full reference grid ────────────────────────────────────────────────

export const AllSwatches = {
  name: 'All Swatches',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '0.5rem 2rem',
        maxWidth: '800px',
      }}
    >
      {[
        { token: '--st-color-pink-500',    hex: '#ff247d' },
        { token: '--st-color-lime-500',    hex: '#D1FF1D' },
        { token: '--st-color-seafoam-500', hex: '#2BD4AA' },
        { token: '--st-color-maroon-500',  hex: '#b91c68' },
        { token: '--st-color-void-900',    hex: '#0D1226' },
        { token: '--st-color-charcoal-900',hex: '#1e1e1e' },
        { token: '--st-color-grey-900',    hex: '#171717' },
        { token: '--st-color-grey-600',    hex: '#525252' },
        { token: '--st-color-grey-400',    hex: '#94A3B8' },
        { token: '--st-color-grey-300',    hex: '#D4D4D4' },
        { token: '--st-color-grey-200',    hex: '#E5E5E5' },
        { token: '--st-color-grey-100',    hex: '#F7F7F7' },
        { token: '--st-color-grey-050',    hex: '#f8f8fa' },
        { token: '--st-color-grey-040',    hex: '#f1f2f4' },
        { token: '--st-color-grey-030',    hex: '#e1e3e6' },
        { token: '--st-color-white',       hex: '#FFFFFF' },
        { token: '--st-color-blue-500',    hex: '#0066CC' },
        { token: '--st-color-blue-600',    hex: '#0052A3' },
        { token: '--st-color-red-500',     hex: '#b91c68' },
      ].map(({ token, hex }) => (
        <Swatch key={token} token={token} hex={hex} />
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};
