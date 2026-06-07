/**
 * Sugartown DS — Storybook docs helpers
 *
 * Drop this file into .storybook/helpers/docs.tsx
 * Import in Guidelines stories:
 *   import { DocSection, OverviewItem, ... } from '../../.storybook/helpers/docs';
 *
 * These components implement the Pink Moon doc-page visual language
 * for the Guidelines story (sections 01, 06–14).
 * They are NOT production components — docs-only.
 */

import React from 'react';

// ── DocSection ────────────────────────────────────────────────────────────────
// Wrapper for each numbered section in the Guidelines story.

interface DocSectionProps {
  n: string;
  title: string;
  priority: 'must' | 'should';
  showBadge?: boolean;
  children: React.ReactNode;
}

export function DocSection({ n, title, priority, showBadge = false, children }: DocSectionProps) {
  return (
    <section style={{ paddingTop: 60, marginTop: 60 }}>
      {/* SectionLabel-style header — three-zone row over 1px ink baseline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showBadge ? '1fr auto' : '1fr',
        alignItems: 'baseline',
        gap: '0 1.5rem',
        paddingBottom: '0.625rem',
        borderBottom: '1px solid var(--st-color-ink)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={monoLabel({ color: 'var(--st-color-pink)', letterSpacing: '0.06em' })}>
            {n.padStart(2, '0')}
          </span>
          <span style={monoLabel({ color: 'var(--st-color-text-default)', letterSpacing: 'var(--st-label-tracking)', textTransform: 'uppercase' })}>
            {title}
          </span>
        </div>
        {showBadge && (
          <span style={{
            ...monoLabel({ color: priority === 'must' ? 'var(--st-color-ink)' : 'var(--st-color-neutral-600)' }),
            fontSize: '0.55rem',
            letterSpacing: '0.08em',
            padding: '2px 7px',
            border: `1px solid ${priority === 'must' ? 'var(--st-color-ink)' : 'var(--st-color-neutral-500)'}`,
          }}>
            {priority === 'must' ? 'Must Have' : 'Should Have'}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Overview helpers ──────────────────────────────────────────────────────────

export function OverviewItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '9px 0',
      borderBottom: '1px solid var(--st-color-neutral-300)',
      fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--st-color-neutral-700)',
    }}>
      <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.7rem', color: 'var(--st-color-pink)', marginTop: 2, flexShrink: 0 }}>→</span>
      <span>{children}</span>
    </li>
  );
}

export function NotItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '8px 0',
      borderBottom: '1px solid var(--st-color-neutral-300)',
      fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--st-color-neutral-700)',
    }}>
      <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-neutral-500)', marginTop: 2, flexShrink: 0 }}>✗</span>
      <span>{children}</span>
    </li>
  );
}

// ── Do / Don't helpers ────────────────────────────────────────────────────────

export function DoItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '11px 14px',
      borderBottom: '1px solid var(--st-color-neutral-300)',
      fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--st-color-neutral-700)',
    }}>
      <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--st-color-seafoam-600)', marginTop: 1, flexShrink: 0 }}>✓</span>
      <span>{children}</span>
    </li>
  );
}

export function DontItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '11px 14px',
      borderBottom: '1px solid var(--st-color-neutral-300)',
      fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--st-color-neutral-700)',
    }}>
      <span style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--st-color-pink)', marginTop: 1, flexShrink: 0 }}>✗</span>
      <span>{children}</span>
    </li>
  );
}

// ── Accessibility helpers ─────────────────────────────────────────────────────

export function A11yItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: '1px solid var(--st-color-neutral-300)',
    }}>
      <div style={{
        width: 16, height: 16, border: '1px solid var(--st-color-seafoam-400)',
        background: 'color-mix(in srgb, var(--st-color-seafoam) 8%, transparent)',
        flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.6rem', color: 'var(--st-color-seafoam-600)',
      }}>✓</div>
      <div>
        <strong style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--st-color-ink)', marginBottom: 2 }}>
          {label}
        </strong>
        <span style={{ fontSize: '0.8125rem', color: 'var(--st-color-neutral-600)', lineHeight: 1.5 }}>
          {children}
        </span>
      </div>
    </li>
  );
}

// ── Design Token helpers ──────────────────────────────────────────────────────

export function TokenGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--st-color-neutral-600)',
        padding: '8px 12px', border: '1px solid var(--st-color-neutral-400)',
        borderBottom: 'none', background: 'var(--st-color-neutral-200)',
      }}>
        {label}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--st-color-neutral-400)' }}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TokenRow({ token, value, role }: { token: string; value: string; role: string }) {
  return (
    <tr>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--st-color-neutral-300)', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--st-color-maroon-600)', width: '44%' }}>
        {token}
      </td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--st-color-neutral-300)', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', color: 'var(--st-color-neutral-500)', width: '22%' }}>
        {value}
      </td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--st-color-neutral-300)', fontSize: '0.8125rem', color: 'var(--st-color-neutral-700)' }}>
        {role}
      </td>
    </tr>
  );
}

// ── Related Components helpers ────────────────────────────────────────────────

export function RelatedCard({ name, why, when }: { name: string; why: string; when: string }) {
  return (
    <div style={{ border: '1px solid var(--st-color-neutral-400)', padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--st-color-ink)', marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--st-color-neutral-600)', lineHeight: 1.5 }}>
        {why}
      </div>
      <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--st-color-neutral-500)', marginTop: 8 }}>
        {when}
      </div>
    </div>
  );
}

// ── Changelog helpers ─────────────────────────────────────────────────────────

export function ChangelogEntry({ version, date, children }: { version: string; date: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--st-color-neutral-400)' }}>
      <div style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--st-color-ink)', marginBottom: 6, display: 'flex', gap: 12, alignItems: 'baseline' }}>
        {version}
        <span style={{ fontWeight: 400, color: 'var(--st-color-neutral-500)', fontSize: '0.65rem' }}>{date}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>{children}</ul>
    </div>
  );
}

export function ChangelogItem({ breaking, children }: { breaking?: boolean; children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 8, fontSize: '0.875rem', color: 'var(--st-color-neutral-700)', lineHeight: 1.5, padding: '2px 0' }}>
      <span style={{ color: 'var(--st-color-neutral-500)', flexShrink: 0 }}>·</span>
      <span>
        {breaking && (
          <span style={{
            fontFamily: 'var(--st-font-family-mono)', fontSize: '0.5rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px',
            color: 'var(--st-color-pink-700)', border: '1px solid var(--st-color-pink-300)',
            background: 'color-mix(in srgb, var(--st-color-pink) 5%, transparent)',
            marginRight: 8, verticalAlign: 'middle',
          }}>Breaking</span>
        )}
        {children}
      </span>
    </li>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function monoLabel(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: 'var(--st-label-size)',
    fontWeight: 'var(--st-label-weight)' as any,
    letterSpacing: 'var(--st-label-tracking)',
    textTransform: 'uppercase',
    ...extra,
  };
}
