/**
 * Usage doc template — copy this file, rename it, delete this comment block.
 * Style guide: docs/conventions/usage-doc-style-guide.md
 *
 * PRE-AUTHORING GATES (run in order before writing any section):
 *   Gate 1 — API stability: prop API must be frozen. If not, write Overview only.
 *             Mark detail sections <!-- PENDING: API not frozen --> until stable.
 *   Gate 2 — Template lock: present the section table below, wait for sign-off.
 *   Gate 3 — Framework-agnostic: no Sanity field names, no CMS lifecycle vocab.
 *             Use prop names (dotColor), not data-source names (project.colorHex).
 *
 * TEMPLATE LOCK TABLE (fill in, present to user before writing content):
 *   | Section          | Applicable? | Scope (one sentence) |
 *   |------------------|-------------|----------------------|
 *   | Overview         | Yes         |                      |
 *   | Usage Guidelines | Yes/No      |                      |
 *   | Accessibility    | Yes/No      |                      |
 *   | Design Tokens    | Yes/No      |                      |
 *
 * Sections (in order):
 *   1. Title + one-liner      (required)
 *   2. The rule               (required)
 *   3. When to use            (required)
 *   4. Examples table         (required — include live preview column)
 *   5. Do / Don't             (required)
 *   6. Implementation         (required for code-touching conventions)
 *   7. Accessibility          (include if a11y-relevant)
 *
 * Remove sections not applicable. Do not add unlisted sections.
 * Do not include: origin stories, phase candidates, rationale prose, uncertainty markers.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiGeneratedFooter } from '../helpers/docs';

// ─── Shared style object ─────────────────────────────────────────────────────
// Extend this as needed. All colours via var(--st-*) tokens — no hex values.
const s = {
  page:    { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px' } as React.CSSProperties,
  h1:      { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' } as React.CSSProperties,
  oneliner:{ color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' } as React.CSSProperties,
  h2:      { fontSize: '1.2rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' } as React.CSSProperties,
  rule:    { fontWeight: 700, fontSize: '1.1rem', borderLeft: '3px solid var(--st-color-brand-primary)', paddingLeft: '1rem', margin: '1rem 0 1.5rem' } as React.CSSProperties,
  hr:      { border: 'none', borderTop: '1px solid var(--st-color-border-default)', margin: '2rem 0' } as React.CSSProperties,
  th:      { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid var(--st-color-border-default)', fontWeight: 600, fontSize: '0.875rem' },
  td:      { padding: '0.5rem 1rem', fontSize: '0.875rem', verticalAlign: 'top' as const },
  code:    { background: 'var(--st-color-bg-surface-strong)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
  whenCol: { flex: 1, padding: '1rem', background: 'var(--st-color-bg-surface-strong)', borderRadius: '4px' } as React.CSSProperties,
  doBox:   { flex: 1, padding: '1rem', borderTop: '3px solid var(--st-color-status-success-bg, #22c55e)' } as React.CSSProperties,
  dontBox: { flex: 1, padding: '1rem', borderTop: '3px solid var(--st-color-status-danger-bg, #ef4444)' } as React.CSSProperties,
  pairRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' } as React.CSSProperties,
  label:   { fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' } as React.CSSProperties,
};

// ─── Page component ──────────────────────────────────────────────────────────
// Replace <ConventionName> with the actual name.
//
// Section dependencies (fill in before writing content — update when Overview changes):
// Overview lists [modes/states/rules] → Usage Guidelines §[section] must match exactly
// Usage Guidelines §[rule] → Accessibility §[criterion] must reference it
// Design Tokens table → Overview [callout/list] must reference the same token names
function ConventionNamePage() {
  return (
    <div style={s.page}>

      {/* ── 1. Title + one-liner ─────────────────────────────────────────── */}
      <h1 style={s.h1}>Convention Name</h1>
      <p style={s.oneliner}>One sentence describing what this convention governs. No history, no rationale.</p>

      <hr style={s.hr} />

      {/* ── 2. The rule ──────────────────────────────────────────────────── */}
      <h2 style={s.h2}>The rule</h2>
      <p style={s.rule}>
        Single, bold, prescriptive statement. One sentence. No hedging.
      </p>

      {/* ── 3. When to use ───────────────────────────────────────────────── */}
      <h2 style={s.h2}>When to use</h2>
      <div style={s.pairRow}>
        <div style={s.whenCol}>
          <p style={s.label}>Use X when</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
            <li>Condition A</li>
            <li>Condition B</li>
          </ul>
        </div>
        <div style={s.whenCol}>
          <p style={s.label}>Use Y when</p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
            <li>Condition A</li>
            <li>Condition B</li>
          </ul>
        </div>
      </div>

      {/* ── 4. Examples table ────────────────────────────────────────────── */}
      <h2 style={s.h2}>Examples</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={s.th}>Surface</th>
            <th style={s.th}>Applies</th>
            <th style={s.th}>Preview</th>
            <th style={s.th}>CSS mechanism</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}>Surface name</td>
            <td style={s.td}>Value</td>
            <td style={s.td}>{/* live inline preview element here */}</td>
            <td style={s.td}><code style={s.code}>.className</code></td>
          </tr>
        </tbody>
      </table>

      {/* ── 5. Do / Don't ────────────────────────────────────────────────── */}
      <h2 style={s.h2}>Do / Don&rsquo;t</h2>

      <div style={s.pairRow}>
        <div style={s.doBox}>
          <p style={{ ...s.label, color: 'var(--st-color-status-success-bg, #16a34a)' }}>Do</p>
          {/* visual example */}
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Short label — no explanatory prose.</p>
        </div>
        <div style={s.dontBox}>
          <p style={{ ...s.label, color: 'var(--st-color-status-danger-bg, #dc2626)' }}>Don&rsquo;t</p>
          {/* visual example */}
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0' }}>Short label — no explanatory prose.</p>
        </div>
      </div>

      {/* ── 6. Implementation ────────────────────────────────────────────── */}
      <h2 style={s.h2}>Implementation</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
        <li><code style={s.code}>path/to/file.css</code> — <code style={s.code}>.className</code> description</li>
        <li><code style={s.code}>path/to/other.css</code> — <code style={s.code}>.otherClass</code> description</li>
      </ul>

      {/* ── 7. Accessibility (include only if a11y-relevant) ─────────────── */}
      <h2 style={s.h2}>Accessibility</h2>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
        <li>Bullet-only. Link to WCAG criterion if applicable.</li>
      </ul>

      <AiGeneratedFooter />

    </div>
  );
}

// ─── Storybook meta ──────────────────────────────────────────────────────────
const meta: Meta = {
  title: 'Foundations/TEMPLATE — replace this title',
  component: ConventionNamePage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
