/**
 * Docs/Story Template — the canonical structure for every component story.
 *
 * Reference this page when authoring a new component's stories.tsx file.
 * The boilerplate is at: apps/storybook/.storybook/stories/stories.boilerplate.tsx
 * Shared doc helpers: apps/storybook/.storybook/helpers/docs.tsx
 * Section rules: docs/conventions/storybook-section-rules.md
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DocSection,
  OverviewItem,
  NotItem,
  DoItem,
  DontItem,
  A11yItem,
  TokenGroup,
  TokenRow,
  RelatedCard,
  ChangelogEntry,
  ChangelogItem,
} from '../helpers/docs';

// ─── Checkbox helper (coverage table) ────────────────────────────────────────

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 16, height: 16,
      border: `1px solid ${checked ? 'var(--st-color-seafoam-400)' : 'var(--st-color-neutral-300)'}`,
      background: checked ? 'color-mix(in srgb, var(--st-color-seafoam) 10%, white)' : 'transparent',
      fontSize: '0.6rem',
      color: checked ? 'var(--st-color-seafoam-600)' : 'transparent',
      fontFamily: 'var(--st-font-family-mono)',
      fontWeight: 700,
    }}>
      {checked ? '✓' : ''}
    </span>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

function StoryTemplatePage() {
  return (
    <div
      data-theme="light-pink-moon"
      style={{
        padding: '52px 56px 120px',
        maxWidth: 920,
        fontFamily: 'var(--st-font-family-ui)',
        color: 'var(--st-color-ink)',
        background: 'var(--st-color-neutral-100)',
        minHeight: '100vh',
      }}
    >

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 60 }}>
        <h1 style={{
          fontFamily: 'var(--st-font-family-narrative)',
          fontSize: '2.5rem',
          fontWeight: 600,
          color: 'var(--st-color-ink)',
          marginBottom: 8,
        }}>
          Story Template
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--st-color-neutral-500)', maxWidth: '62ch', lineHeight: 1.6 }}>
          The 14-section structure for every component story in the Sugartown DS.
          Sections 02–05 are generated automatically by Storybook autodocs.
          Sections 01 and 06–14 are written in a <code style={s.code}>Guidelines</code> story export.
        </p>
      </div>

      {/* ── Coverage model ────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={s.h2}>Coverage model</h2>
        <p style={{ ...s.prose, marginBottom: 20 }}>
          Sections 02–05 are generated automatically by Storybook autodocs — they require no
          manual writing. Sections 01 and 06–14 are authored in a <code style={s.code}>Guidelines</code> story export.
          Must Have sections gate merge. Should Have sections gate v1 stable.
        </p>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Section</th>
              <th style={s.th}>Description</th>
              <th style={s.th}>Priority</th>
              <th style={{ ...s.th, textAlign: 'center' as const }}>Pink Moon</th>
              <th style={{ ...s.th, textAlign: 'center' as const }}>SB Autodoc</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['Overview / Purpose',          'What it is, what it does, what it is not',                          'must',   false, false],
              ['Live Preview',                 'Interactive Controls panel — toggle props, see output in real time', 'must',   true,  true ],
              ['Code / Usage Examples',        'Working JSX or HTML, Storybook embed',                              'must',   true,  true ],
              ['Props / API',                  'Autodocs prop table — name, type, default, required, description',  'must',   true,  true ],
              ['Composition Patterns (Stories)','How it works with other components in context',                    'must',   true,  true ],
              ['Usage Guidelines (Do / Don\'t)','Annotated correct and incorrect use pairs',                        'must',   false, false],
              ['Accessibility',                'ARIA, keyboard, touch targets, screen reader behavior',             'must',   false, false],
              ['Design Tokens',                'Token-to-property mapping per variant and state',                   'must',   false, false],
              ['Anatomy',                      'Labeled diagram of named parts',                                    'should', false, false],
              ['Variants',                     'Full taxonomy — style, size, icon combinations',                    'should', false, false],
              ['States',                       'Every interactive condition with visuals',                          'should', false, false],
              ['Content Guidelines',           'Label rules, char limits, verb-first phrasing',                     'should', false, false],
              ['Related Components',           'When to use something else instead',                                'should', false, false],
              ['Changelog',                    'Version history, deprecations, breaking changes',                   'should', false, false],
            ] as [string, string, 'must'|'should', boolean, boolean][]).map(([section, desc, priority, pm, sb]) => (
              <tr key={section}>
                <td style={s.td}>{section}</td>
                <td style={{ ...s.td, color: 'var(--st-color-neutral-500)' }}>{desc}</td>
                <td style={s.td}>
                  <span style={{
                    fontFamily: 'var(--st-font-family-mono)',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    padding: '2px 7px',
                    border: `1px solid ${priority === 'must' ? 'var(--st-color-ink)' : 'var(--st-color-neutral-400)'}`,
                    color: priority === 'must' ? 'var(--st-color-ink)' : 'var(--st-color-neutral-500)',
                  }}>
                    {priority === 'must' ? 'Must Have' : 'Should Have'}
                  </span>
                </td>
                <td style={{ ...s.td, textAlign: 'center' as const }}><Checkbox checked={pm} /></td>
                <td style={{ ...s.td, textAlign: 'center' as const }}><Checkbox checked={sb} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── File structure ────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={s.h2}>File structure</h2>
        <pre style={s.anatomy}>{`ComponentName.stories.tsx
│
├── Meta (export default)
│   ├── title: "Category/ComponentName"
│   ├── component: ComponentName
│   ├── tags: ['autodocs']           ← enables sections 02–05
│   ├── parameters.layout
│   ├── parameters.docs.description.component   ← one-sentence lead
│   └── argTypes                     ← override controls for complex props
│
├── Named story exports              ← section 05
│   ├── Default  (required props only — shown first in autodocs)
│   ├── [VariantA]
│   ├── [VariantB]
│   └── Snapshot (Chromatic VRT — always last)
│
└── Guidelines                       ← sections 01, 06–14
    └── export const Guidelines: Story = {
          parameters: { docs: { disable: true }, controls: { disable: true } },
          render: () => <GuidelinesPage />,
        }`}</pre>
      </section>

      {/* ── Import pattern ────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={s.h2}>Import pattern</h2>
        <p style={s.prose}>
          Start from the boilerplate at{' '}
          <code style={s.code}>apps/storybook/.storybook/stories/stories.boilerplate.tsx</code>.
          Import doc helpers from{' '}
          <code style={s.code}>../../.storybook/helpers/docs</code> (relative to your component folder),
          or <code style={s.code}>../helpers/docs</code> from inside{' '}
          <code style={s.code}>.storybook/stories/</code>.
        </p>
        <pre style={s.anatomy}>{`import {
  DocSection,
  OverviewItem, NotItem,
  DoItem, DontItem,
  A11yItem,
  TokenGroup, TokenRow,
  RelatedCard,
  ChangelogEntry, ChangelogItem,
} from '../../.storybook/helpers/docs';
// ^ adjust path based on your component's location`}</pre>
      </section>

      {/* ── Section rules ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={s.h2}>Section rules</h2>
        <p style={s.prose}>
          Full authoring rules for each section are in{' '}
          <code style={s.code}>docs/conventions/storybook-section-rules.md</code>.
          The visual reference is{' '}
          <code style={s.code}>docs/briefs/design-system/storybook-docs-template.html</code>.
        </p>
      </section>

      {/* ── Live examples of all helpers ──────────────────────────────────── */}
      <DocSection n="01" title="Overview / Purpose" priority="must" showBadge>
        <h3 style={s.h3}>What it is</h3>
        <p style={s.prose}>
          One sentence: [ComponentName] is the [noun] that [verb phrase] on [location].
        </p>
        <h3 style={s.h3}>What it does</h3>
        <ul style={s.list}>
          <OverviewItem>Renders the [element] — [why it matters]</OverviewItem>
          <OverviewItem>Accepts a [slot] slot for [purpose]</OverviewItem>
          <OverviewItem>Applies [behaviour] via [mechanism]</OverviewItem>
        </ul>
        <h3 style={s.h3}>What it is not</h3>
        <ul style={s.list}>
          <NotItem>Not a [similar component] — use [alternative] for [use case]</NotItem>
          <NotItem>Not composable inside [container type] — it must [constraint]</NotItem>
        </ul>
      </DocSection>

      <DocSection n="06" title="Usage Guidelines" priority="must" showBadge>
        <div style={s.ddGrid}>
          <div style={s.ddCol}>
            <div style={{ ...s.ddHd, ...s.ddDoHd }}>Do</div>
            <ul style={s.list}>
              <DoItem>Use DS colour tokens for the <code style={s.code}>tint</code> prop — never freeform hex.</DoItem>
              <DoItem>Pass only the props relevant to your context — omit slots that don't apply.</DoItem>
            </ul>
          </div>
          <div style={s.ddCol}>
            <div style={{ ...s.ddHd, ...s.ddDontHd }}>Don't</div>
            <ul style={s.list}>
              <DontItem>Don't use <code style={s.code}>[prop]</code> for [wrong use case] — it means [correct meaning].</DontItem>
              <DontItem>Don't nest [ComponentName] inside [container] — it must [constraint].</DontItem>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection n="07" title="Accessibility" priority="must" showBadge>
        <ul style={s.a11yList}>
          <A11yItem label="Semantic HTML">The root element is a [element]. It carries [role/landmark] for [purpose].</A11yItem>
          <A11yItem label="ARIA attributes">[aria-attribute] is set to [value] when [condition].</A11yItem>
          <A11yItem label="Focus behaviour">[ComponentName] is non-interactive. No focus management.</A11yItem>
          <A11yItem label="Colour contrast">All text tokens guarantee WCAG AA (4.5:1) in both light and dark Pink Moon.</A11yItem>
          <A11yItem label="Motion">No animations. <code style={s.code}>prefers-reduced-motion</code> has no effect.</A11yItem>
        </ul>
      </DocSection>

      <DocSection n="08" title="Design Tokens" priority="must" showBadge>
        <TokenGroup label="Colour & Surface">
          <TokenRow token="--st-color-bg-surface" value="#FAFAFA" role="Base background" />
          <TokenRow token="--st-color-border-default" value="#E4E4E5" role="Border" />
          <TokenRow token="--st-color-text-default" value="#0a0f1a" role="Primary text" />
        </TokenGroup>
        <TokenGroup label="Typography">
          <TokenRow token="--st-font-family-narrative" value="Cormorant Garamond" role="Heading typeface" />
          <TokenRow token="--st-font-heading-2" value="2rem / 1.15" role="H1 font size" />
        </TokenGroup>
      </DocSection>

      <DocSection n="09" title="Anatomy" priority="should" showBadge>
        <pre style={s.anatomy}>{`
┌──────────────────────────────────────────────────┐
│ .root                                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ .topRow                                      │  │
│  │   .breadcrumbSlot (left)  .actions (right)   │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │ .body                                        │  │
│  │   .media    .content                         │  │
│  │            .titleRow (.title · .count)       │  │
│  │            .description                      │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
        `.trim()}</pre>
      </DocSection>

      <DocSection n="13" title="Related Components" priority="should" showBadge>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <RelatedCard
            name="Breadcrumb"
            why="Consumed as the breadcrumb slot — renders the nav trail above the title."
            when="See Patterns/Breadcrumb for slot structure and breadcrumb item shape."
          />
          <RelatedCard
            name="MetadataCard"
            why="Common companion — appears below PageHeader in entity detail pages."
            when="Use instead of custom metadata layouts below the header."
          />
        </div>
      </DocSection>

      <DocSection n="14" title="Changelog" priority="should" showBadge>
        <ChangelogEntry version="v0.26.8" date="2026-06-06">
          <ChangelogItem breaking>breadcrumb prop changed from BreadcrumbItem[] to ReactNode — callers must wrap in &lt;Breadcrumb /&gt;</ChangelogItem>
          <ChangelogItem>Initial implementation — archive, entity folio, taxonomy detail patterns</ChangelogItem>
        </ChangelogEntry>
      </DocSection>

    </div>
  );
}

// ─── Local styles (Guidelines story layout only) ──────────────────────────────

const s = {
  h2: { fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--st-color-ink)', marginBottom: 16, marginTop: 0 } as React.CSSProperties,
  h3: { fontFamily: 'var(--st-font-family-narrative)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--st-color-ink)', marginBottom: 10, marginTop: 32 } as React.CSSProperties,
  prose: { fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--st-color-neutral-600)', maxWidth: '62ch', marginBottom: 12 } as React.CSSProperties,
  list: { listStyle: 'none', padding: 0, marginBottom: 20 } as React.CSSProperties,
  a11yList: { listStyle: 'none', padding: 0 } as React.CSSProperties,
  code: { fontFamily: 'var(--st-font-family-mono)', fontSize: '0.84em', background: 'var(--st-color-neutral-100)', padding: '1px 5px', color: 'var(--st-color-maroon-600)' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse', border: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  th: { fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--st-color-neutral-500)', padding: '8px 12px', textAlign: 'left' as const, borderBottom: '1px solid var(--st-color-neutral-200)', background: 'var(--st-color-neutral-100)' } as React.CSSProperties,
  td: { padding: '8px 12px', borderBottom: '1px solid var(--st-color-neutral-100)', fontSize: '0.8125rem', color: 'var(--st-color-neutral-600)', verticalAlign: 'top' as const } as React.CSSProperties,
  tdMono: { fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--st-color-maroon-600)' } as React.CSSProperties,
  anatomy: { background: 'var(--st-color-midnight-900)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px 28px', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', overflowX: 'auto' as const, margin: '0 0 16px' } as React.CSSProperties,
  ddGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } as React.CSSProperties,
  ddCol: { border: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  ddHd: { padding: '9px 14px', fontFamily: 'var(--st-font-family-mono)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, borderBottom: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  ddDoHd: { color: 'var(--st-color-seafoam-700)', background: 'color-mix(in srgb, var(--st-color-seafoam) 5%, white)', borderLeft: '3px solid var(--st-color-seafoam)' } as React.CSSProperties,
  ddDontHd: { color: 'var(--st-color-pink-700)', background: 'color-mix(in srgb, var(--st-color-pink) 4%, white)', borderLeft: '3px solid var(--st-color-pink)' } as React.CSSProperties,
};

// ─── Meta & export ────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Docs/Story Template',
  component: StoryTemplatePage,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
