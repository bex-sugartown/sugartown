import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DocSection,
  DoDontGrid, DoGroup, DontGroup, DoItem, DontItem,
  OverviewItem, NotItem,
  A11yItem,
  docStyles as s,
  AiGeneratedFooter,
} from '../helpers/docs';

// ── Inline chip replicas ──────────────────────────────────────────────────────
// These replicate the Chip CSS visually — no component imports from apps/web/.

const chipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '28px',
  boxSizing: 'border-box',
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '0.75rem',
  fontWeight: 400,
  lineHeight: 1,
  padding: '0.45em 0.75em',
  textDecoration: 'none',
  userSelect: 'none',
  cursor: 'default',
};

// Default chip — color-mix against accent (pink)
const chipDefault: React.CSSProperties = {
  ...chipBase,
  background: 'color-mix(in srgb, var(--st-color-accent) 18%, var(--st-color-canvas))',
  border: '1px solid color-mix(in srgb, var(--st-color-accent) 50%, var(--st-color-canvas))',
  color: 'var(--st-color-accent)',
};

// Interactive chip — same as above but pointer cursor
const chipInteractive: React.CSSProperties = {
  ...chipDefault,
  cursor: 'pointer',
};

// Active state — solid accent fill
const chipActive: React.CSSProperties = {
  ...chipBase,
  cursor: 'pointer',
  background: 'var(--st-color-accent)',
  border: '1px solid var(--st-color-accent)',
  color: 'var(--st-color-white)',
};

// Tag variant — neutral rule-dot chassis, no accent tint
const chipTag: React.CSSProperties = {
  ...chipBase,
  background: 'var(--st-chip-bg)',
  border: '1px solid var(--st-chip-border)',
  color: 'var(--st-chip-fg)',
  letterSpacing: 0,
};

// Tag + interactive
const chipTagInteractive: React.CSSProperties = {
  ...chipTag,
  cursor: 'pointer',
};

// ── Demo strip ────────────────────────────────────────────────────────────────

function ChipStrip({ chips }: { chips: Array<{ style: React.CSSProperties; label: string }> }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
      {chips.map(({ style, label }, i) => (
        <span key={i} style={style}>{label}</span>
      ))}
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

function ChipTaxonomyPage() {
  return (
    <div style={s.page}>

      <h1 style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Chip / Tag Taxonomy
      </h1>
      <p style={s.prose}>Which Chip variant to use — default or <code style={s.code}>variant="tag"</code> — and the rule that decides.</p>

      {/* ── 01 Overview ─────────────────────────────────────────────────────── */}
      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          The DS <code style={s.code}>Chip</code> component has two operating modes governed by the <code style={s.code}>variant</code> prop.
          The correct choice is determined by one question: <strong>will the user interact with this chip to filter or navigate?</strong>
        </p>
        <ul style={s.list}>
          <OverviewItem><strong>Default (no variant)</strong> — pink color-mix surface, supports <code style={s.code}>onClick</code> and active state. Use for FilterBar chips and taxonomy links on content cards.</OverviewItem>
          <OverviewItem><strong><code style={s.code}>variant="tag"</code></strong> — neutral rule-dot chassis, no active state. Use for read-only taxonomy labels in MetadataCard and detail page metadata strips.</OverviewItem>
        </ul>
        <p style={{ ...s.prose, marginTop: '0.75rem' }}>Not in scope:</p>
        <ul style={s.list}>
          <NotItem><code style={s.code}>variant="status"</code> — lifecycle status chips (Evergreen, Draft, Deprecated). Not a taxonomy chip. See the Component Registry for status usage.</NotItem>
          <NotItem>dotColor mode — project color-dot chips. Passed via the <code style={s.code}>dotColor</code> prop, not <code style={s.code}>variant</code>.</NotItem>
        </ul>
      </DocSection>

      {/* ── 06 Usage Guidelines ─────────────────────────────────────────────── */}
      <DocSection n="06" title="Usage Guidelines" priority="must">

        <h3 style={s.h3}>Default chip — filter and navigation</h3>
        <p style={s.prose}>
          Pass <code style={s.code}>onClick</code> for FilterBar filter chips. Pass <code style={s.code}>href</code> for taxonomy links that navigate to a listing page.
          The active state (solid pink fill) is only meaningful on filter chips — pass <code style={s.code}>isActive</code> to reflect selection.
        </p>
        <ChipStrip chips={[
          { style: chipInteractive, label: 'Design Systems' },
          { style: chipInteractive, label: 'Case Studies' },
          { style: chipActive,      label: 'AI Ethics' },
        ]} />
        <p style={{ ...s.prose, color: 'var(--st-color-text-muted)', fontSize: '0.8rem' }}>
          Left: default interactive chips. Right: active state (<code style={s.code}>isActive</code>).
        </p>

        <h3 style={s.h3}>Tag variant — read-only labels</h3>
        <p style={s.prose}>
          Use <code style={s.code}>variant="tag"</code> where the chip communicates a label with no user action — metadata strips, detail page taxonomy rows, profile metadata.
          Tag chips can still accept <code style={s.code}>href</code> for passive navigation (the user can click to browse, but the chip is not a primary filter control).
        </p>
        <ChipStrip chips={[
          { style: chipTag,            label: 'Design Systems' },
          { style: chipTag,            label: 'React' },
          { style: chipTagInteractive, label: 'Case Studies' },
        ]} />
        <p style={{ ...s.prose, color: 'var(--st-color-text-muted)', fontSize: '0.8rem' }}>
          Left: static tag chips (no href). Right: tag chip with href — passive navigation, neutral hover.
        </p>

        <h3 style={s.h3}>Comparison</h3>
        <div style={{ ...s.tableWrap }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Variant</th>
                <th style={s.th}>Surface</th>
                <th style={s.th}>Active state</th>
                <th style={s.th}>Typical context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.tdMono}>default</td>
                <td style={s.td}>Pink color-mix</td>
                <td style={s.td}>Yes — solid pink fill via <code style={s.code}>isActive</code></td>
                <td style={s.td}>FilterBar, taxonomy link chips in ContentCard</td>
              </tr>
              <tr>
                <td style={s.tdMono}>variant="tag"</td>
                <td style={s.td}>Neutral (<code style={s.code}>--st-chip-bg</code> / <code style={s.code}>--st-chip-border</code>)</td>
                <td style={s.td}>None</td>
                <td style={s.td}>MetadataCard taxonomy rows, detail page metadata, PersonProfile expertise chips</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={s.h3}>Do / Don't</h3>
        <DoDontGrid>
          <DoGroup>
            <DoItem>Use default chip with <code style={s.code}>onClick</code> or <code style={s.code}>isActive</code> in a FilterBar — the pink surface and active state signal filter interactivity.</DoItem>
            <DoItem>Use <code style={s.code}>variant="tag"</code> in MetadataCard taxonomy rows — neutral surface signals a label, not a toggle.</DoItem>
            <DoItem>Pass <code style={s.code}>href</code> on either variant when the chip links to a taxonomy listing page.</DoItem>
          </DoGroup>
          <DontGroup>
            <DontItem>Render a default chip with no <code style={s.code}>onClick</code> or <code style={s.code}>href</code> in a UI where other chips are interactive — the pink surface implies clickability.</DontItem>
            <DontItem>Implement a new custom chip style inline in a page — <code style={s.code}>Chip</code> and <code style={s.code}>variant="tag"</code> cover all taxonomy display needs.</DontItem>
            <DontItem>Use <code style={s.code}>isActive</code> on <code style={s.code}>variant="tag"</code> chips — the rule-dot chassis has no active state and the class has no effect.</DontItem>
          </DontGroup>
        </DoDontGrid>
      </DocSection>

      {/* ── 07 Accessibility ────────────────────────────────────────────────── */}
      <DocSection n="07" title="Accessibility" priority="must">
        <ul style={s.a11yList}>
          <A11yItem label="Button vs link semantics">
            When <code style={s.code}>onClick</code> is passed, Chip renders a <code style={s.code}>&lt;button&gt;</code>. When <code style={s.code}>href</code> is passed, it renders a react-router-dom <code style={s.code}>&lt;Link&gt;</code>. Never pass both — the semantics would conflict.
          </A11yItem>
          <A11yItem label="Static chips have no role">
            A chip with neither <code style={s.code}>onClick</code> nor <code style={s.code}>href</code> renders a <code style={s.code}>&lt;span&gt;</code>. It is not focusable and carries no interactive ARIA role — correct for a read-only label.
          </A11yItem>
          <A11yItem label="Active state must be communicated">
            <code style={s.code}>isActive</code> sets a visual active style but does not set <code style={s.code}>aria-pressed</code> automatically. If Chip is used as a toggle (FilterBar), wrap it in a context that communicates the selection state to screen readers.
          </A11yItem>
          <A11yItem label="Color is not the only signal">
            The default chip communicates interactivity through cursor, hover animation, and focus ring — not color alone. The tag variant communicates read-only state through cursor and the absence of those cues.
          </A11yItem>
        </ul>
      </DocSection>

      {/* ── 08 Design Tokens ────────────────────────────────────────────────── */}
      <DocSection n="08" title="Design Tokens" priority="must">
        <p style={{ ...s.prose, marginBottom: '1.5rem' }}>
          The default chip derives all color from <code style={s.code}>--st-color-accent</code> via <code style={s.code}>color-mix()</code> — one token controls background, border, and text.
          The tag variant uses the rule-dot chassis tokens shared with status chips.
        </p>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Token</th>
                <th style={s.th}>Variant</th>
                <th style={s.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['--st-color-accent', 'default', 'Chip color source — drives bg (18% mix), border (50% mix), text'],
                ['--st-chip-bg', 'tag / status', 'Rule-dot chassis background — transparent in light, surface in dark'],
                ['--st-chip-border', 'tag / status', 'Rule-dot chassis border — maps to --st-color-rule-accent'],
                ['--st-chip-fg', 'tag / status', 'Rule-dot chassis text color'],
                ['--st-chip-rubric-bg', 'tag featured', 'Pink rubric tint for first taxonomy chip on a card'],
                ['--st-chip-rubric-border', 'tag featured', 'Pink border on rubric chip'],
                ['--st-chip-rubric-fg', 'tag featured', 'Maroon text on rubric chip'],
              ].map(([token, variant, role]) => (
                <tr key={token}>
                  <td style={s.tdMono}>{token}</td>
                  <td style={{ ...s.td, fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', color: 'var(--st-color-neutral-500)' }}>{variant}</td>
                  <td style={s.td}>{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...s.prose, color: 'var(--st-color-text-muted)' }}>
          To override chip color, pass <code style={s.code}>color="seafoam"</code> (named preset) or <code style={s.code}>colorHex="#6d28d9"</code> (arbitrary hex). Both inject <code style={s.code}>--chip-color</code> and the <code style={s.code}>color-mix()</code> formulas do the rest.
        </p>
      </DocSection>

      <AiGeneratedFooter />

    </div>
  );
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Foundations/Chip Taxonomy',
  component: ChipTaxonomyPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
