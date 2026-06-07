/**
 * ## [ComponentName]
 *
 * [One sentence — what it is, what it does, where it lives.]
 *
 * Storybook category: [Primitives | Patterns | Layout | Pages]
 * Ticket: SUG-XXX
 *
 * ─── Section coverage ────────────────────────────────────────────────────────
 *
 * | #  | Section                | SB Autodoc | This file           |
 * |----|------------------------|------------|---------------------|
 * | 01 | Overview / Purpose     |            | Guidelines story    |
 * | 02 | Live Preview           | ✓          |                     |
 * | 03 | Code / Usage Examples  | ✓          |                     |
 * | 04 | Props / API            | ✓ autodocs |                     |
 * | 05 | Composition Patterns   | ✓          | Named story exports |
 * | 06 | Usage Guidelines       |            | Guidelines story    |
 * | 07 | Accessibility          |            | Guidelines story    |
 * | 08 | Design Tokens          |            | Guidelines story    |
 * | 09 | Anatomy                |            | Guidelines story    |
 * | 10 | Variants               |            | Guidelines story    |
 * | 11 | States                 |            | Guidelines story    |
 * | 12 | Content Guidelines     |            | Guidelines story    |
 * | 13 | Related Components     |            | Guidelines story    |
 * | 14 | Changelog              |            | Guidelines story    |
 *
 * Sections 02–05 are handled automatically by Storybook autodocs + named exports.
 * Sections 01, 06–14 require the `Guidelines` story at the bottom of this file.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// ─── Replace with real import ─────────────────────────────────────────────────
import { ComponentName } from './ComponentName';

// ─── Helpers (copy .storybook/helpers/ into your project) ───────────────────
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
} from '../../.storybook/helpers/docs';


// ══════════════════════════════════════════════════════════════════════════════
// META
// ══════════════════════════════════════════════════════════════════════════════

const meta: Meta<typeof ComponentName> = {
  // ── Update category and name ──────────────────────────────────────────────
  // Valid categories (in order): Foundations · Primitives · Patterns · Layout · Pages
  title: 'Patterns/ComponentName',

  component: ComponentName,

  // autodocs generates sections 02 (Live Preview), 03 (Code), 04 (Props/API)
  tags: ['autodocs'],

  parameters: {
    // 'fullscreen' for full-width components (PageHeader, Hero, Footer)
    // 'centered' for self-contained components (Button, Chip, Badge)
    // 'padded' for components that need breathing room but not full width
    layout: 'fullscreen',

    docs: {
      description: {
        // ── Section 01 lead — shown by autodocs above the first story ─────
        // One paragraph max. Expand in the Guidelines story (section 01).
        component: `
Full-width [description]. Composes [SlotA], [SlotB] as render slots.
Lives in [ParentComponent]'s \`[slotName]\` slot.

→ See the **Guidelines** story for usage guidelines, accessibility, design tokens, anatomy, variants, states, content rules, related components, and changelog.
        `.trim(),
      },
    },
  },

  // ── Arg types — override autodocs controls for complex props ─────────────
  argTypes: {
    // Example: constrain a free-text prop to a select in the Controls panel
    // tint: {
    //   control: 'select',
    //   options: ['none', 'var(--st-color-seafoam-300)', 'var(--st-color-midnight-300)'],
    // },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;


// ══════════════════════════════════════════════════════════════════════════════
// 05 · COMPOSITION PATTERNS
// Named story exports — one per distinct usage context.
// ──────────────────────────────────────────────────────────────────────────────
// Naming convention:  "[Category] — [Descriptor]"
//   Archive — Articles
//   Entity — Person Folio
//   With Actions
//
// Order: simplest → most complex. Snapshot story always last.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * [One sentence describing what this story demonstrates and when to use it.]
 * Required props only — shows the minimal viable variant.
 */
export const Default: Story = {
  name: '[Category] — Default',
  render: () => (
    <ComponentName
      // Required prop
      requiredProp="value"
      // Optional props — omit slots that don't apply to this variant
    />
  ),
};

/**
 * [Describe the complete variant — all slots populated, most complex config.]
 */
export const Complete: Story = {
  name: '[Category] — Complete',
  render: () => (
    <ComponentName
      requiredProp="value"
      // optionalProp={<SlotComponent />}
      // tint="var(--st-color-seafoam-300)"
    />
  ),
};

// Add additional named exports per usage context:
// export const WithActions: Story = { ... }
// export const TaxonomyVariant: Story = { ... }


// ──────────────────────────────────────────────────────────────────────────────
// SNAPSHOT — Chromatic visual regression testing
// Stack all variants in a single render for a single VRT screenshot.
// disableSnapshot: false enables Chromatic capture on this story only.
// ──────────────────────────────────────────────────────────────────────────────
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'fullscreen',
    controls: { disable: true },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Stack all variants vertically with 2px gap */}
      <ComponentName requiredProp="Variant A" />
      <ComponentName requiredProp="Variant B" />
    </div>
  ),
};


// ══════════════════════════════════════════════════════════════════════════════
// GUIDELINES
// Covers sections 01, 06–14 — the sections not generated by autodocs.
// ──────────────────────────────────────────────────────────────────────────────
// This story does NOT appear in the autodocs tab. It is a standalone story
// navigable from the sidebar as "Guidelines" under the component.
//
// docs: { disable: true } prevents it from appearing in the Docs tab.
// controls: { disable: true } hides the Controls panel (no interactive props).
// ══════════════════════════════════════════════════════════════════════════════
export const Guidelines: Story = {
  name: 'Guidelines',
  parameters: {
    docs: { disable: true },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => (
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

      {/* ── 01 · OVERVIEW / PURPOSE ──────────────────────────────────────── */}
      <DocSection n="01" title="Overview / Purpose" priority="must">

        <h3 style={styles.h3}>What it is</h3>
        <p style={styles.prose}>
          {/* One sentence: [ComponentName] is the [noun] that [verb phrase]. */}
          [ComponentName] is the [describe it] that [does what] on [where it lives].
        </p>

        <h3 style={styles.h3}>What it does</h3>
        <ul style={styles.list}>
          {/* 3–5 bullets using → prefix. Each bullet = one capability. */}
          <OverviewItem>Renders the [element] — [why it matters]</OverviewItem>
          <OverviewItem>Accepts a [slot] slot for [purpose]</OverviewItem>
          <OverviewItem>Applies [behaviour] via [mechanism]</OverviewItem>
        </ul>

        <h3 style={styles.h3}>What it is not</h3>
        <ul style={styles.list}>
          {/* 2–3 bullets using ✗ prefix. Prevents misuse. */}
          <NotItem>Not a [similar component] — use [alternative] for [use case]</NotItem>
          <NotItem>Not composable inside [container type] — it must [constraint]</NotItem>
        </ul>

      </DocSection>


      {/* ── 06 · USAGE GUIDELINES ────────────────────────────────────────── */}
      <DocSection n="06" title="Usage Guidelines" priority="must">
        {/*
          Do / Don't grid.
          Max 5 items per column. One sentence each.
          Focus on: boundary conditions, common misuse, composability pitfalls.
          Do NOT repeat Props/API content or paste code examples here.
        */}
        <div style={styles.ddGrid}>
          <div style={styles.ddCol}>
            <div style={{ ...styles.ddHd, ...styles.ddDoHd }}>Do</div>
            <ul style={styles.list}>
              <DoItem>Use DS colour tokens for the <code style={styles.code}>tint</code> prop — never freeform hex values.</DoItem>
              <DoItem>Pass only the props relevant to your context — omit slots that don't apply.</DoItem>
              {/* Add up to 3 more items */}
            </ul>
          </div>
          <div style={styles.ddCol}>
            <div style={{ ...styles.ddHd, ...styles.ddDontHd }}>Don't</div>
            <ul style={styles.list}>
              <DontItem>Don't use <code style={styles.code}>[prop]</code> for [wrong use case] — it means [correct meaning].</DontItem>
              <DontItem>Don't nest [ComponentName] inside [container] — it must [constraint].</DontItem>
              {/* Add up to 3 more items */}
            </ul>
          </div>
        </div>
      </DocSection>


      {/* ── 07 · ACCESSIBILITY ───────────────────────────────────────────── */}
      <DocSection n="07" title="Accessibility" priority="must">
        {/*
          Required topics: semantic HTML, landmark roles, ARIA, focus, contrast, motion.
          Keyboard interaction table: include ONLY if component has keyboard interactions.
          Screen reader notes: include when announced output is non-obvious.
        */}
        <ul style={styles.a11yList}>
          <A11yItem label="Semantic HTML">
            {/* Describe the root element and any landmark roles */}
            The root element is a [element]. It carries [role/landmark] for [purpose].
          </A11yItem>
          <A11yItem label="ARIA attributes">
            {/* List any aria-* attributes and when they change */}
            [aria-attribute] is set to [value] when [condition].
          </A11yItem>
          <A11yItem label="Focus behaviour">
            {/* Describe focus management — or state "No focus management" if non-interactive */}
            [ComponentName] is [non-interactive / interactive]. [Focus behaviour description.]
          </A11yItem>
          <A11yItem label="Colour contrast">
            All text tokens guarantee WCAG AA (4.5:1) in both light-pink-moon and dark-pink-moon.
            The component does not rely on colour alone to convey meaning.
          </A11yItem>
          <A11yItem label="Motion">
            Respects <code style={styles.code}>prefers-reduced-motion</code>. [Describe animation or state "No animations."]
          </A11yItem>
        </ul>
      </DocSection>


      {/* ── 08 · DESIGN TOKENS ───────────────────────────────────────────── */}
      <DocSection n="08" title="Design Tokens" priority="must">
        {/*
          List every CSS custom property the component consumes.
          Group by: layout · typography · colour · spacing.
          Token = exact CSS variable name.
          Value = resolved value in light-pink-moon at rest.
          Role = one phrase.
          Do NOT document tokens from slot components here.
        */}

        <TokenGroup label="Layout">
          <TokenRow token="--st-[token-name]" value="[resolved value]" role="[one phrase]" />
        </TokenGroup>

        <TokenGroup label="Typography">
          <TokenRow token="--st-font-family-[x]" value="[family]" role="[element typeface]" />
          <TokenRow token="--st-font-[scale]" value="[size]" role="[element font size]" />
        </TokenGroup>

        <TokenGroup label="Colour & Surface">
          <TokenRow token="--st-color-bg-surface" value="#FAFAFA" role="Base background" />
          <TokenRow token="--st-color-border-default" value="#E4E4E5" role="Border" />
          <TokenRow token="--st-color-text-default" value="#0a0f1a" role="Primary text" />
        </TokenGroup>

        <TokenGroup label="Spacing">
          <TokenRow token="--st-space-[n]" value="[px]" role="[semantic role]" />
        </TokenGroup>

      </DocSection>


      {/* ── 09 · ANATOMY ─────────────────────────────────────────────────── */}
      <DocSection n="09" title="Anatomy" priority="should">
        {/*
          ASCII diagram using CSS module class names as labels.
          Show the most complete variant (all slots populated).
          Update class names to match the component's actual .module.css.
        */}
        <pre style={styles.anatomy}>{`
┌──────────────────────────────────────────────────┐
│ .root                                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ .topRow                                      │  │
│  │   .slotA (left)         .slotB (right)       │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │ .body                                        │  │
│  │   .media     .content                        │  │
│  │             .title · .description            │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
        `.trim()}</pre>
      </DocSection>


      {/* ── 10 · VARIANTS ────────────────────────────────────────────────── */}
      <DocSection n="10" title="Variants" priority="should">
        {/*
          Visual grid of all distinct configurations.
          Each card: variant name + mini preview + prop diff from minimal.
          These are conceptual variants — not the same as story exports.
        */}
        <p style={styles.prose}>
          {/* Describe the variant taxonomy briefly, then show the grid */}
          [ComponentName] has [N] variants based on [the axis of variation]:
        </p>
        {/* Render actual component variants here, stacked or in a grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <p style={styles.variantLabel}>Variant A — [Name]</p>
            <ComponentName requiredProp="Variant A" />
          </div>
          <div>
            <p style={styles.variantLabel}>Variant B — [Name]</p>
            <ComponentName requiredProp="Variant B" />
          </div>
        </div>
      </DocSection>


      {/* ── 11 · STATES ──────────────────────────────────────────────────── */}
      <DocSection n="11" title="States" priority="should">
        {/*
          Every conditional rendering state.
          For non-interactive components: loading, empty, error, etc.
          For interactive components: hover, focus, active, disabled, loading.
          Each state: label + trigger condition + visual.
        */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <p style={styles.variantLabel}>Default</p>
            <ComponentName requiredProp="Default state" />
          </div>
          <div>
            <p style={styles.variantLabel}>Loading / Skeleton</p>
            {/* <ComponentName isLoading /> */}
            <div style={styles.stubBlock}>Skeleton state — implement when skeleton prop is available</div>
          </div>
        </div>
      </DocSection>


      {/* ── 12 · CONTENT GUIDELINES ──────────────────────────────────────── */}
      <DocSection n="12" title="Content Guidelines" priority="should">
        {/*
          Table: prop · rule · character limit · example.
          Cover every text-bearing prop.
          Rules must be actionable ("sentence case, no terminal punctuation"),
          not vague ("keep it short").
        */}
        <table style={styles.table}>
          <thead>
            <tr>
              {['Prop', 'Rule', 'Limit', 'Example'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...styles.td, ...styles.tdMono }}>title</td>
              <td style={styles.td}>Sentence case. No terminal punctuation. No verbs.</td>
              <td style={{ ...styles.td, ...styles.tdMono }}>—</td>
              <td style={styles.td}>"Articles" not "View articles."</td>
            </tr>
            <tr>
              <td style={{ ...styles.td, ...styles.tdMono }}>eyebrow</td>
              <td style={styles.td}>Uppercase noun phrase. Max 3 words. No verbs.</td>
              <td style={{ ...styles.td, ...styles.tdMono }}>3 words</td>
              <td style={styles.td}>"Design Engineer" not "Works as a designer"</td>
            </tr>
            <tr>
              <td style={{ ...styles.td, ...styles.tdMono }}>description</td>
              <td style={styles.td}>Present tense. 1–3 sentences. No markdown.</td>
              <td style={{ ...styles.td, ...styles.tdMono }}>62ch/line</td>
              <td style={styles.td}>"Writing on design engineering and content strategy."</td>
            </tr>
            {/* Add rows for every text-bearing prop */}
          </tbody>
        </table>
      </DocSection>


      {/* ── 13 · RELATED COMPONENTS ──────────────────────────────────────── */}
      <DocSection n="13" title="Related Components" priority="should">
        {/*
          Only components with a direct relationship:
            - slot dependencies
            - alternatives for specific use cases
            - frequent co-usage
          Two fields per card: why it relates + when to use it instead.
          Max 6 cards.
        */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <RelatedCard
            name="[SlotComponent]"
            why="Consumed as the [slotName] slot — [what it provides]."
            when="See [Category/SlotComponent] for slot structure and usage."
          />
          <RelatedCard
            name="[AlternativeComponent]"
            why="[How it relates to this component]."
            when="Use instead when [specific condition]."
          />
        </div>
      </DocSection>


      {/* ── 14 · CHANGELOG ───────────────────────────────────────────────── */}
      <DocSection n="14" title="Changelog" priority="should">
        {/*
          Version · date · bullet list. Breaking changes get a BREAKING tag.
          Only document changes to this component's public API and visual contract.
          Most recent version first. Use semantic versioning.
        */}
        <ChangelogEntry version="v0.x.0" date="YYYY-MM-DD">
          <ChangelogItem>Initial implementation — [brief description of scope]</ChangelogItem>
        </ChangelogEntry>
      </DocSection>

    </div>
  ),
};


// ══════════════════════════════════════════════════════════════════════════════
// INLINE STYLES
// Used for the Guidelines story layout only.
// All values use DS tokens where possible.
// Do not use these styles outside of .stories.tsx files.
// ══════════════════════════════════════════════════════════════════════════════
const styles = {
  h3: {
    fontFamily: 'var(--st-font-family-narrative)',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--st-color-ink)',
    marginBottom: '10px',
    marginTop: '32px',
  } as React.CSSProperties,

  prose: {
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    color: 'var(--st-color-neutral-600)',
    maxWidth: '62ch',
    marginBottom: '12px',
  } as React.CSSProperties,

  list: { listStyle: 'none', padding: 0, marginBottom: '20px' } as React.CSSProperties,

  code: {
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.84em',
    background: 'var(--st-color-neutral-100)',
    padding: '1px 5px',
    color: 'var(--st-color-maroon-600)',
  } as React.CSSProperties,

  ddGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } as React.CSSProperties,
  ddCol: { border: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  ddHd: {
    padding: '9px 14px',
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--st-color-neutral-200)',
  } as React.CSSProperties,
  ddDoHd: {
    color: 'var(--st-color-seafoam-700)',
    background: 'color-mix(in srgb, var(--st-color-seafoam) 5%, white)',
    borderLeft: '3px solid var(--st-color-seafoam)',
  } as React.CSSProperties,
  ddDontHd: {
    color: 'var(--st-color-pink-700)',
    background: 'color-mix(in srgb, var(--st-color-pink) 4%, white)',
    borderLeft: '3px solid var(--st-color-pink)',
  } as React.CSSProperties,

  a11yList: { listStyle: 'none', padding: 0 } as React.CSSProperties,

  anatomy: {
    background: 'var(--st-color-midnight-900)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '24px 28px',
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.72rem',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.65)',
    overflowX: 'auto',
  } as React.CSSProperties,

  variantLabel: {
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--st-color-neutral-500)',
    marginBottom: 8,
  } as React.CSSProperties,

  stubBlock: {
    border: '1px dashed var(--st-color-neutral-300)',
    padding: '20px',
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.65rem',
    color: 'var(--st-color-neutral-400)',
    textAlign: 'center',
  } as React.CSSProperties,

  table: { width: '100%', borderCollapse: 'collapse', border: '1px solid var(--st-color-neutral-200)' } as React.CSSProperties,
  th: {
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.58rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--st-color-neutral-500)',
    padding: '8px 12px',
    textAlign: 'left',
    borderBottom: '1px solid var(--st-color-neutral-200)',
    background: 'var(--st-color-neutral-100)',
  } as React.CSSProperties,
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--st-color-neutral-100)',
    fontSize: '0.8125rem',
    color: 'var(--st-color-neutral-600)',
    verticalAlign: 'top',
  } as React.CSSProperties,
  tdMono: {
    fontFamily: 'var(--st-font-family-mono)',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--st-color-maroon-600)',
  } as React.CSSProperties,
};
