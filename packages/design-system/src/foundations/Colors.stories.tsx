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

// ─── Swatch ── theme-adaptive text via CSS custom properties ──────────────────

const Swatch = ({
  token,
  hex,
  label,
}: {
  token: string;
  hex: string;
  label?: string;
}) => {
  const isVeryLight = (() => {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8;
  })();
  const isSemiTransparent = hex.startsWith('rgba');

  return (
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
          flexShrink: 0,
          boxShadow: isVeryLight
            ? '0 0 0 1px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)'
            : isSemiTransparent
            ? '0 0 0 1px rgba(128,128,128,0.25), 0 2px 6px rgba(0,0,0,0.1)'
            : '0 2px 6px rgba(0,0,0,0.18)',
        }}
      />
      <div>
        <div
          style={{
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--st-color-text-default)',
            letterSpacing: '0.02em',
          }}
        >
          {token}
        </div>
        <div
          style={{
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            fontSize: '0.68rem',
            color: 'var(--st-color-text-secondary)',
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
              color: 'var(--st-color-text-muted)',
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
};

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
        color: 'var(--st-color-text-muted)',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--st-color-border-default)',
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
      <Section title="Pink — --st-color-pink-{n}">
        <Swatch token="--st-color-pink-50"  hex="#fff0f6" />
        <Swatch token="--st-color-pink-100" hex="#ffe1ed" />
        <Swatch token="--st-color-pink-200" hex="#ffb3d1" />
        <Swatch token="--st-color-pink-300" hex="#ff80b5" />
        <Swatch token="--st-color-pink-400" hex="#ff4d99" />
        <Swatch token="--st-color-pink-500" hex="#FF247D" label="canonical · --st-color-pink · Sugartown brand pink" />
        <Swatch token="--st-color-pink-600" hex="#e00069" />
        <Swatch token="--st-color-pink-700" hex="#b30054" />
        <Swatch token="--st-color-pink-800" hex="#860040" />
        <Swatch token="--st-color-pink-900" hex="#59002b" />
      </Section>

      <Section title="Maroon — --st-color-maroon-{n}">
        <Swatch token="--st-color-maroon-50"  hex="#fef2f8" />
        <Swatch token="--st-color-maroon-100" hex="#fcdcea" />
        <Swatch token="--st-color-maroon-200" hex="#f9b8d4" />
        <Swatch token="--st-color-maroon-300" hex="#f48ab8" label="dark inline code text" />
        <Swatch token="--st-color-maroon-400" hex="#e75596" />
        <Swatch token="--st-color-maroon-500" hex="#d42b7a" />
        <Swatch token="--st-color-maroon-600" hex="#b91c68" label="canonical · --st-color-maroon · brand secondary, link hover" />
        <Swatch token="--st-color-maroon-700" hex="#961553" />
        <Swatch token="--st-color-maroon-800" hex="#72103f" />
        <Swatch token="--st-color-maroon-900" hex="#4d0a2a" />
      </Section>

      <Section title="Lime — --st-color-lime-{n}">
        <Swatch token="--st-color-lime-50"  hex="#f9ffe5" />
        <Swatch token="--st-color-lime-100" hex="#f2ffbf" />
        <Swatch token="--st-color-lime-200" hex="#e8ff8a" />
        <Swatch token="--st-color-lime-300" hex="#dcff52" />
        <Swatch token="--st-color-lime-400" hex="#D1FF1D" label="canonical · --st-color-lime · secondary button bg" />
        <Swatch token="--st-color-lime-500" hex="#b8e000" />
        <Swatch token="--st-color-lime-600" hex="#96b800" />
        <Swatch token="--st-color-lime-700" hex="#748f00" />
        <Swatch token="--st-color-lime-800" hex="#526600" />
        <Swatch token="--st-color-lime-900" hex="#314000" />
      </Section>

      <Section title="Seafoam — --st-color-seafoam-{n}">
        <Swatch token="--st-color-seafoam-50"  hex="#f0fdf9" />
        <Swatch token="--st-color-seafoam-100" hex="#e6faf5" />
        <Swatch token="--st-color-seafoam-200" hex="#b3ece0" />
        <Swatch token="--st-color-seafoam-300" hex="#72d9c6" />
        <Swatch token="--st-color-seafoam-400" hex="#48d4b8" />
        <Swatch token="--st-color-seafoam-500" hex="#2BD4AA" label="canonical · --st-color-seafoam" />
        <Swatch token="--st-color-seafoam-600" hex="#25b895" />
        <Swatch token="--st-color-seafoam-700" hex="#1d9679" />
        <Swatch token="--st-color-seafoam-800" hex="#15735c" />
        <Swatch token="--st-color-seafoam-900" hex="#0d4a3d" />
      </Section>

      <Section title="Tier 2 — Brand semantic aliases">
        <Swatch token="--st-color-brand-primary"   hex="#FF247D" label="→ pink-500  ·  card border, eyebrow, focus ring" />
        <Swatch token="--st-color-brand-secondary" hex="#b91c68" label="→ maroon-600  ·  link hover" />
        <Swatch token="--st-color-accent-primary"  hex="#FF247D" label="→ pink-500  ·  chip default, tag accent" />
        <Swatch token="--st-color-accent-lime"     hex="#D1FF1D" label="→ lime-400  ·  secondary CTA accent" />
        <Swatch token="--st-color-accent-soft"     hex="rgba(255,36,125,0.08)" label="8% pink — hover bg for chips / tertiary button" />
        <Swatch token="--st-color-text-brand"      hex="#FF247D" label="dark: → pink-500  |  light: → maroon (Deep Pink Rule — WCAG AA)" />
      </Section>
    </div>
  ),
};

// ─── Story: Neutral palette ────────────────────────────────────────────────────

export const NeutralPalette = {
  name: 'Neutral Palette',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Section title="Midnight — --st-color-midnight-{n}">
        <Swatch token="--st-color-midnight-50"  hex="#eef0f8" />
        <Swatch token="--st-color-midnight-100" hex="#d5d9ee" />
        <Swatch token="--st-color-midnight-200" hex="#abb3dd" />
        <Swatch token="--st-color-midnight-300" hex="#808dcc" />
        <Swatch token="--st-color-midnight-400" hex="#5567bb" />
        <Swatch token="--st-color-midnight-500" hex="#3547a3" />
        <Swatch token="--st-color-midnight-600" hex="#28358c" />
        <Swatch token="--st-color-midnight-700" hex="#1C2240" label="dark surface L2 — raised/inset" />
        <Swatch token="--st-color-midnight-800" hex="#141830" label="dark surface L1 — card/section bg" />
        <Swatch token="--st-color-midnight-900" hex="#0D1226" label="canonical · --st-color-midnight · dark canvas" />
      </Section>

      <Section title="Charcoal — --st-color-charcoal-{n}">
        <Swatch token="--st-color-charcoal-50"  hex="#f5f5f5" />
        <Swatch token="--st-color-charcoal-100" hex="#e8e8e8" />
        <Swatch token="--st-color-charcoal-200" hex="#d1d1d1" />
        <Swatch token="--st-color-charcoal-300" hex="#b0b0b0" />
        <Swatch token="--st-color-charcoal-400" hex="#888888" />
        <Swatch token="--st-color-charcoal-500" hex="#666666" />
        <Swatch token="--st-color-charcoal-600" hex="#444444" />
        <Swatch token="--st-color-charcoal-700" hex="#333333" />
        <Swatch token="--st-color-charcoal-800" hex="#282828" />
        <Swatch token="--st-color-charcoal-900" hex="#1e1e1e" label="canonical · --st-color-charcoal · light text default" />
      </Section>

      <Section title="Softgrey (blue-cast UI tones) — --st-color-softgrey-{n}">
        <Swatch token="--st-color-softgrey-50"  hex="#f8f8fa" label="light bg-surface, bg-alt" />
        <Swatch token="--st-color-softgrey-100" hex="#f1f2f4" label="light bg-subtle, inline code bg" />
        <Swatch token="--st-color-softgrey-200" hex="#e1e3e6" label="light border-default" />
        <Swatch token="--st-color-softgrey-300" hex="#bcc5d1" />
        <Swatch token="--st-color-softgrey-400" hex="#94A3B8" label="canonical · --st-color-softgrey · dark text default, muted text" />
        <Swatch token="--st-color-softgrey-500" hex="#6e7f96" label="light text-muted" />
        <Swatch token="--st-color-softgrey-600" hex="#526070" />
        <Swatch token="--st-color-softgrey-700" hex="#3d4a57" />
        <Swatch token="--st-color-softgrey-800" hex="#2b3540" />
        <Swatch token="--st-color-softgrey-900" hex="#1a2128" />
      </Section>

      <Section title="Neutral (true greyscale) — --st-color-neutral-{n}">
        <Swatch token="--st-color-neutral-50"  hex="#fafafa" />
        <Swatch token="--st-color-neutral-100" hex="#f5f5f5" label="light bg-secondary" />
        <Swatch token="--st-color-neutral-200" hex="#e5e5e5" label="border-medium" />
        <Swatch token="--st-color-neutral-300" hex="#d4d4d4" />
        <Swatch token="--st-color-neutral-400" hex="#a3a3a3" />
        <Swatch token="--st-color-neutral-500" hex="#737373" />
        <Swatch token="--st-color-neutral-600" hex="#525252" label="light text-secondary" />
        <Swatch token="--st-color-neutral-700" hex="#404040" />
        <Swatch token="--st-color-neutral-800" hex="#262626" />
        <Swatch token="--st-color-neutral-900" hex="#171717" />
      </Section>

      <Section title="Base">
        <Swatch token="--st-color-white" hex="#FFFFFF" />
        <Swatch token="--st-color-black" hex="#000000" />
      </Section>

      <Section title="Tier 2 — Semantic backgrounds (dark theme defaults)">
        <Swatch token="--st-color-bg-canvas"         hex="#0D1226" label="→ midnight-900  ·  page background" />
        <Swatch token="--st-color-bg-surface"        hex="#141830" label="→ midnight-800  ·  card / section bg" />
        <Swatch token="--st-color-bg-surface-strong" hex="#1C2240" label="→ midnight-700  ·  raised / inset surface" />
        <Swatch token="--st-color-bg-subtle"         hex="#1C2240" label="→ midnight-700  ·  subtle bg" />
        <Swatch token="--st-color-bg-midnight"       hex="#0D1226" label="→ midnight  ·  code block bg (stays dark in all themes)" />
      </Section>

      <Section title="Tier 2 — Semantic text (dark theme defaults)">
        <Swatch token="--st-color-text-default"   hex="#f8f8fa" label="→ softgrey-50  ·  primary body text" />
        <Swatch token="--st-color-text-primary"   hex="#f8f8fa" label="→ softgrey-50  ·  alias for text-default" />
        <Swatch token="--st-color-text-secondary" hex="#94A3B8" label="→ softgrey-400  ·  secondary / meta text" />
        <Swatch token="--st-color-text-muted"     hex="#94A3B8" label="→ softgrey-400  ·  muted / placeholder text" />
      </Section>
    </div>
  ),
};

// ─── Story: Status / utility colours ──────────────────────────────────────────

export const StatusColors = {
  name: 'Status Colors',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <Section title="Blue — utility (not brand)">
        <Swatch token="--st-color-blue-500" hex="#0066CC" />
        <Swatch token="--st-color-blue-600" hex="#0052A3" />
      </Section>

      <Section title="Status badge colours (data-status attribute)">
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
        maxWidth: '900px',
      }}
    >
      {[
        // ── Pink ─────────────────────────────────────────────────────────────
        { token: '--st-color-pink-50',   hex: '#fff0f6' },
        { token: '--st-color-pink-100',  hex: '#ffe1ed' },
        { token: '--st-color-pink-200',  hex: '#ffb3d1' },
        { token: '--st-color-pink-300',  hex: '#ff80b5' },
        { token: '--st-color-pink-400',  hex: '#ff4d99' },
        { token: '--st-color-pink-500',  hex: '#FF247D', label: '← canonical' },
        { token: '--st-color-pink-600',  hex: '#e00069' },
        { token: '--st-color-pink-700',  hex: '#b30054' },
        { token: '--st-color-pink-800',  hex: '#860040' },
        { token: '--st-color-pink-900',  hex: '#59002b' },
        // ── Maroon ───────────────────────────────────────────────────────────
        { token: '--st-color-maroon-50',  hex: '#fef2f8' },
        { token: '--st-color-maroon-100', hex: '#fcdcea' },
        { token: '--st-color-maroon-200', hex: '#f9b8d4' },
        { token: '--st-color-maroon-300', hex: '#f48ab8' },
        { token: '--st-color-maroon-400', hex: '#e75596' },
        { token: '--st-color-maroon-500', hex: '#d42b7a' },
        { token: '--st-color-maroon-600', hex: '#b91c68', label: '← canonical' },
        { token: '--st-color-maroon-700', hex: '#961553' },
        { token: '--st-color-maroon-800', hex: '#72103f' },
        { token: '--st-color-maroon-900', hex: '#4d0a2a' },
        // ── Lime ─────────────────────────────────────────────────────────────
        { token: '--st-color-lime-50',  hex: '#f9ffe5' },
        { token: '--st-color-lime-100', hex: '#f2ffbf' },
        { token: '--st-color-lime-200', hex: '#e8ff8a' },
        { token: '--st-color-lime-300', hex: '#dcff52' },
        { token: '--st-color-lime-400', hex: '#D1FF1D', label: '← canonical' },
        { token: '--st-color-lime-500', hex: '#b8e000' },
        { token: '--st-color-lime-600', hex: '#96b800' },
        { token: '--st-color-lime-700', hex: '#748f00' },
        { token: '--st-color-lime-800', hex: '#526600' },
        { token: '--st-color-lime-900', hex: '#314000' },
        // ── Seafoam ───────────────────────────────────────────────────────────
        { token: '--st-color-seafoam-50',  hex: '#f0fdf9' },
        { token: '--st-color-seafoam-100', hex: '#e6faf5' },
        { token: '--st-color-seafoam-200', hex: '#b3ece0' },
        { token: '--st-color-seafoam-300', hex: '#72d9c6' },
        { token: '--st-color-seafoam-400', hex: '#48d4b8' },
        { token: '--st-color-seafoam-500', hex: '#2BD4AA', label: '← canonical' },
        { token: '--st-color-seafoam-600', hex: '#25b895' },
        { token: '--st-color-seafoam-700', hex: '#1d9679' },
        { token: '--st-color-seafoam-800', hex: '#15735c' },
        { token: '--st-color-seafoam-900', hex: '#0d4a3d' },
        // ── Midnight ──────────────────────────────────────────────────────────
        { token: '--st-color-midnight-50',  hex: '#eef0f8' },
        { token: '--st-color-midnight-100', hex: '#d5d9ee' },
        { token: '--st-color-midnight-200', hex: '#abb3dd' },
        { token: '--st-color-midnight-300', hex: '#808dcc' },
        { token: '--st-color-midnight-400', hex: '#5567bb' },
        { token: '--st-color-midnight-500', hex: '#3547a3' },
        { token: '--st-color-midnight-600', hex: '#28358c' },
        { token: '--st-color-midnight-700', hex: '#1C2240' },
        { token: '--st-color-midnight-800', hex: '#141830' },
        { token: '--st-color-midnight-900', hex: '#0D1226', label: '← canonical' },
        // ── Charcoal ──────────────────────────────────────────────────────────
        { token: '--st-color-charcoal-50',  hex: '#f5f5f5' },
        { token: '--st-color-charcoal-100', hex: '#e8e8e8' },
        { token: '--st-color-charcoal-200', hex: '#d1d1d1' },
        { token: '--st-color-charcoal-300', hex: '#b0b0b0' },
        { token: '--st-color-charcoal-400', hex: '#888888' },
        { token: '--st-color-charcoal-500', hex: '#666666' },
        { token: '--st-color-charcoal-600', hex: '#444444' },
        { token: '--st-color-charcoal-700', hex: '#333333' },
        { token: '--st-color-charcoal-800', hex: '#282828' },
        { token: '--st-color-charcoal-900', hex: '#1e1e1e', label: '← canonical' },
        // ── Softgrey ──────────────────────────────────────────────────────────
        { token: '--st-color-softgrey-50',  hex: '#f8f8fa' },
        { token: '--st-color-softgrey-100', hex: '#f1f2f4' },
        { token: '--st-color-softgrey-200', hex: '#e1e3e6' },
        { token: '--st-color-softgrey-300', hex: '#bcc5d1' },
        { token: '--st-color-softgrey-400', hex: '#94A3B8', label: '← canonical' },
        { token: '--st-color-softgrey-500', hex: '#6e7f96' },
        { token: '--st-color-softgrey-600', hex: '#526070' },
        { token: '--st-color-softgrey-700', hex: '#3d4a57' },
        { token: '--st-color-softgrey-800', hex: '#2b3540' },
        { token: '--st-color-softgrey-900', hex: '#1a2128' },
        // ── Neutral ───────────────────────────────────────────────────────────
        { token: '--st-color-neutral-50',  hex: '#fafafa' },
        { token: '--st-color-neutral-100', hex: '#f5f5f5' },
        { token: '--st-color-neutral-200', hex: '#e5e5e5' },
        { token: '--st-color-neutral-300', hex: '#d4d4d4' },
        { token: '--st-color-neutral-400', hex: '#a3a3a3' },
        { token: '--st-color-neutral-500', hex: '#737373' },
        { token: '--st-color-neutral-600', hex: '#525252' },
        { token: '--st-color-neutral-700', hex: '#404040' },
        { token: '--st-color-neutral-800', hex: '#262626' },
        { token: '--st-color-neutral-900', hex: '#171717' },
        // ── Base & utility ────────────────────────────────────────────────────
        { token: '--st-color-white',    hex: '#FFFFFF' },
        { token: '--st-color-black',    hex: '#000000' },
        { token: '--st-color-blue-500', hex: '#0066CC' },
        { token: '--st-color-blue-600', hex: '#0052A3' },
      ].map(({ token, hex, label }) => (
        <Swatch key={token} token={token} hex={hex} label={label} />
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};
