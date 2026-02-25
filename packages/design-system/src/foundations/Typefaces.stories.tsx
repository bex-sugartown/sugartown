/**
 * Foundations/Typefaces — Sugartown Pink type system.
 *
 * Documents the three font families, the type scale, and
 * weight tokens — all sourced from tokens.css Tier 1/2.
 *
 * Not a React component — pure documentation.
 */
import React from 'react';
import type { Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Typefaces',
  parameters: { layout: 'padded' },
};

export default meta;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#aaa',
      marginBottom: '0.25rem',
    }}
  >
    {children}
  </div>
);

const TokenTag = ({ children }: { children: React.ReactNode }) => (
  <code
    style={{
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      fontSize: '0.68rem',
      background: 'rgba(255, 36, 125, 0.07)',
      border: '1px solid rgba(255, 36, 125, 0.2)',
      color: '#b91c68',
      borderRadius: '4px',
      padding: '0.1em 0.45em',
    }}
  >
    {children}
  </code>
);

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '2rem 0' }} />
);

// ─── Story: Font Families ─────────────────────────────────────────────────────

export const FontFamilies = {
  name: 'Font Families',
  render: () => (
    <div style={{ maxWidth: '680px' }}>

      {/* Narrative — Playfair Display */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Label>Narrative — Playfair Display</Label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <TokenTag>--st-font-family-narrative</TokenTag>
          <TokenTag>--st-font-narrative</TokenTag>
        </div>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1.15, margin: '0 0 0.25rem' }}>
          Building a token-driven<br />design system.
        </p>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', fontWeight: 400, fontStyle: 'italic', color: '#555', margin: 0 }}>
          Editorial headings, card titles, featured pull-quotes.
        </p>
      </div>

      <Divider />

      {/* UI — Fira Sans */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Label>UI — Fira Sans</Label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <TokenTag>--st-font-family-ui</TokenTag>
          <TokenTag>--st-font-ui</TokenTag>
        </div>
        <p style={{ fontFamily: '"Fira Sans", sans-serif', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, margin: '0 0 0.25rem' }}>
          Product & Platform Strategy
        </p>
        <p style={{ fontFamily: '"Fira Sans", sans-serif', fontSize: '1rem', fontWeight: 400, color: '#555', lineHeight: 1.6, margin: 0 }}>
          Body copy, archive card titles, navigation, buttons, form labels.<br />
          Weights: 400 · 500 · 600 · 700
        </p>
      </div>

      <Divider />

      {/* Mono */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Label>Monospace — System mono stack</Label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <TokenTag>--st-font-family-mono</TokenTag>
          <TokenTag>--st-font-mono</TokenTag>
        </div>
        <p style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '1rem', lineHeight: 1.6, color: '#b91c68', margin: '0 0 0.25rem' }}>
          Menlo, Monaco, Consolas, monospace
        </p>
        <p style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.85rem', color: '#555', margin: 0 }}>
          Eyebrows · status chips · taxonomy chips · meta labels · code · filter titles
        </p>
      </div>
    </div>
  ),
};

// ─── Story: Type Scale ────────────────────────────────────────────────────────

const SCALE = [
  { token: '--st-font-size-display', value: '3rem',    label: 'Display',   semantic: '--st-font-heading-1' },
  { token: '--st-font-size-2xl',     value: '1.75rem', label: '2XL',       semantic: '--st-font-heading-2' },
  { token: '--st-font-size-xl',      value: '1.4rem',  label: 'XL',        semantic: '--st-font-heading-3' },
  { token: '--st-font-size-lg',      value: '1.125rem',label: 'LG',        semantic: '--st-font-heading-4' },
  { token: '--st-font-size-md',      value: '1rem',    label: 'MD (body)', semantic: '--st-font-body' },
  { token: '--st-font-size-sm',      value: '0.875rem',label: 'SM' },
  { token: '--st-font-size-xs',      value: '0.75rem', label: 'XS',        semantic: '--st-font-caption' },
];

export const TypeScale = {
  name: 'Type Scale',
  render: () => (
    <div style={{ maxWidth: '680px' }}>
      <p style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.7rem', color: '#aaa', marginBottom: '2rem' }}>
        Showing Fira Sans for all steps — apply <code>--st-font-narrative</code> for editorial contexts.
      </p>

      {SCALE.map(({ token, value, label, semantic }) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '1.5rem',
            marginBottom: '1.25rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <div style={{ minWidth: '200px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.65rem', color: '#b91c68', fontWeight: 700 }}>
              {token}
            </div>
            <div style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.6rem', color: '#aaa', marginTop: '2px' }}>
              {value}
              {semantic && (
                <span style={{ color: '#ccc', marginLeft: '6px' }}>· {semantic}</span>
              )}
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Fira Sans", sans-serif',
              fontSize: value,
              fontWeight: 600,
              lineHeight: 1.2,
              color: '#111',
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {label} — Sugartown Pink
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Story: Weights ───────────────────────────────────────────────────────────

const WEIGHTS = [
  { token: '--st-font-weight-normal',   value: 400, label: 'Normal' },
  { token: '--st-font-weight-medium',   value: 500, label: 'Medium' },
  { token: '--st-font-weight-semibold', value: 600, label: 'Semibold' },
  { token: '--st-font-weight-bold',     value: 700, label: 'Bold' },
];

export const FontWeights = {
  name: 'Font Weights',
  render: () => (
    <div style={{ maxWidth: '480px' }}>
      {WEIGHTS.map(({ token, value, label }) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <div style={{ minWidth: '180px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.65rem', color: '#b91c68', fontWeight: 700 }}>
              {token}
            </div>
            <div style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.6rem', color: '#aaa', marginTop: '2px' }}>
              {value}
            </div>
          </div>
          <div
            style={{
              fontFamily: '"Fira Sans", sans-serif',
              fontSize: '1.25rem',
              fontWeight: value,
              color: '#111',
            }}
          >
            {label} — {label} weight
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Story: Line Heights ──────────────────────────────────────────────────────

export const LineHeights = {
  name: 'Line Heights',
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      {[
        { token: '--st-line-height-tight',   value: 1.25, note: 'Headings, display text' },
        { token: '--st-line-height-normal',  value: 1.5,  note: 'Body copy, UI labels' },
        { token: '--st-line-height-relaxed', value: 1.75, note: 'Long-form detail content' },
      ].map(({ token, value, note }) => (
        <div key={token} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
            <TokenTag>{token}</TokenTag>
            <span style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', fontSize: '0.68rem', color: '#aaa' }}>
              {value} — {note}
            </span>
          </div>
          <p
            style={{
              fontFamily: '"Fira Sans", sans-serif',
              fontSize: '1rem',
              lineHeight: value,
              color: '#333',
              margin: 0,
              padding: '0.75rem 1rem',
              background: '#fafafa',
              border: '1px solid #efefef',
              borderRadius: '6px',
            }}
          >
            How we extracted a scalable three-tier token architecture from a live WordPress theme,
            migrated to CSS custom properties, and shipped Storybook alongside the production codebase.
          </p>
        </div>
      ))}
    </div>
  ),
};
