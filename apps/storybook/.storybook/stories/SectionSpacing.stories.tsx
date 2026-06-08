import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DocSection,
  DoDontGrid, DoGroup, DontGroup,
  OverviewItem, NotItem,
  A11yItem,
  TokenGroup, TokenRow,
  docStyles,
} from '../helpers/docs';

const s: Record<string, React.CSSProperties> = {
  ...docStyles,
  page:     { fontFamily: 'var(--st-font-family-ui)', color: 'var(--st-color-text-primary)', lineHeight: 1.6, maxWidth: '860px', background: 'var(--st-color-bg)' },
  h1:       { fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' },
  oneliner: { color: 'var(--st-color-text-muted)', marginTop: 0, marginBottom: '2rem' },
  rule:     { fontWeight: 700, fontSize: '1.05rem', borderLeft: '3px solid var(--st-color-brand-primary)', paddingLeft: '1rem', margin: '1rem 0 1.5rem' },
  hr:       { border: 'none', borderTop: '1px solid var(--st-color-border-default)', margin: '2rem 0' },
};

// ─── Page component ───────────────────────────────────────────────────────────

function SectionSpacingPage() {
  return (
    <div style={s.page}>

      <h1 style={s.h1}>Section Spacing</h1>
      <p style={s.oneliner}>The parent container owns all inter-section gap. Components must not add external margin.</p>

      <hr style={s.hr} />

      <DocSection n="01" title="Overview / Purpose" priority="must">
        <ul style={s.list}>
          <OverviewItem>Detail pages use a flex column container (<code style={s.code}>.detailContext</code>) that owns all inter-section gap via <code style={s.code}>gap: var(--st-space-section-break-detail)</code>.</OverviewItem>
          <OverviewItem>Individual section components must have zero <code style={s.code}>margin-block</code>. Internal padding is allowed; external margin is not.</OverviewItem>
          <OverviewItem>Boundary elements sitting outside <code style={s.code}>.detailContext</code> (e.g. MetadataCard) need an explicit <code style={s.code}>margin-bottom</code> equal to the section gap.</OverviewItem>
        </ul>
        <p style={{ ...s.prose, marginTop: '0.75rem' }}>This pattern applies whenever <code style={s.code}>PageSections.jsx</code> renders in <code style={s.code}>context="detail"</code>. It does not apply to full-width standalone pages.</p>
        <ul style={s.list}>
          <NotItem>Do not use this pattern for top-level full-width marketing pages — those sections use their own margin strategy.</NotItem>
          <NotItem>Do not zero out section margin globally. Only sections inside <code style={s.code}>.detailContext</code> must be zero-margin.</NotItem>
        </ul>
      </DocSection>

      <DocSection n="06" title="Usage Guidelines" priority="must">
        <p style={s.prose}>
          The parent container (<code style={s.code}>.detailContext</code>) declares a flex column with a fixed gap.
          Each section component sits as a flex child — it stretches to full width and receives its spacing from that gap automatically.
          The section itself must not add any external margin or the gap will stack and double at every boundary.
        </p>
        <DoDontGrid>
          <DoGroup label="The parent owns the gap">
            <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.75rem' }}>
              Set <code style={s.code}>gap</code> on <code style={s.code}>.detailContext</code> once.
              Section components use internal padding only — no <code style={s.code}>margin-block</code>.
            </p>
            <pre style={{ ...s.pre, margin: 0 }}>{`.detailContext {
  display: flex;
  flex-direction: column;
  gap: var(--st-space-section-break-detail);
}

/* Component CSS */
.mySection {
  padding: 1rem; /* internal only */
}`}</pre>
          </DoGroup>
          <DontGroup label="The component adds margin">
            <p style={{ fontSize: '0.8rem', color: 'var(--st-color-text-muted)', margin: '0 0 0.75rem' }}>
              Adding <code style={s.code}>margin-block</code> on each section means adjacent sections contribute margin on both sides of every boundary — 40px + 40px = 80px gap instead of 40px.
            </p>
            <pre style={{ ...s.pre, margin: 0 }}>{`/* Component CSS */
.mySection {
  /* doubles gap at every boundary */
  margin-block: var(--st-space-section-break-detail);
}`}</pre>
          </DontGroup>
        </DoDontGrid>

        <h3 style={s.h3}>Boundary elements</h3>
        <p style={s.prose}>
          Elements that sit between two spacing contexts (e.g. MetadataCard between the hero and{' '}
          <code style={s.code}>.detailContext</code>) belong to neither flex container. They need explicit margin:
        </p>
        <pre style={s.pre}>{`.detailPage > aside:first-child {
  margin-bottom: var(--st-space-section-break-detail);
}`}</pre>
        <p style={s.prose}>
          When adding a new element to a detail page template, check whether it sits inside or outside the{' '}
          <code style={s.code}>.detailContext</code> wrapper. Outside elements need explicit margin; inside elements must have zero margin.
        </p>

        <h3 style={s.h3}>Adding a new section type</h3>
        <ul style={s.list}>
          <li>If the component has its own <code style={s.code}>margin-block</code> in its CSS module, add a zero-margin override in <code style={s.code}>.detailContext</code> in <code style={s.code}>PageSections.module.css</code>.</li>
          <li>The <code style={s.code}>&gt; *</code> catch-all handles <code style={s.code}>width: 100%</code> and <code style={s.code}>margin: 0</code> automatically — no explicit registration needed for new section types.</li>
          <li>Internal box padding (callout inset, code block padding) is the component's concern. External spacing is the layout's concern.</li>
          <li>Test against <code style={s.code}>/articles/test-preview-post</code> to verify spacing at every transition between section types.</li>
        </ul>

        <h3 style={s.h3}>Implementation files</h3>
        <ul style={s.list}>
          <li><code style={s.code}>apps/web/src/pages/pages.module.css</code> — <code style={s.code}>.detailPage</code>, <code style={s.code}>.detailContext</code> (flex + gap), <code style={s.code}>.detailPage[data-has-margin]</code> (two-column shell)</li>
          <li><code style={s.code}>apps/web/src/components/PageSections.module.css</code> — <code style={s.code}>.detailContext &gt; *</code> catch-all override, per-component zero-margin exceptions</li>
          <li><code style={s.code}>apps/web/src/components/PageSections.jsx</code> — applies <code style={s.code}>context="detail"</code> which activates <code style={s.code}>.detailContext</code> on the wrapper</li>
        </ul>
      </DocSection>

      <DocSection n="07" title="Accessibility" priority="must">
        <ul style={s.a11yList}>
          <A11yItem label="DOM order preserved">The flex column layout is CSS-only — it does not reorder DOM nodes. Source order equals visual order, so keyboard navigation and screen reader reading order are unaffected.</A11yItem>
          <A11yItem label="No ARIA required">The spacing container (<code style={s.code}>.detailContext</code>) has no semantic role; it is a pure layout wrapper. No ARIA attributes are needed on the container or on individual sections.</A11yItem>
          <A11yItem label="No animation">The gap is a static CSS value — no transitions, no motion. Motion-sensitive users are not affected.</A11yItem>
          <A11yItem label="Boundary margin is also CSS-only">The explicit <code style={s.code}>margin-bottom</code> on boundary elements outside <code style={s.code}>.detailContext</code> is a visual spacing rule only and has no impact on focus order or landmark regions.</A11yItem>
        </ul>
      </DocSection>

      <DocSection n="08" title="Design Tokens" priority="must">
        <TokenGroup label="Detail page spacing">
          <TokenRow token="--st-space-section-break-detail" value="40px" role=".detailContext gap and MetadataCard boundary margin" />
          <TokenRow token="--st-width-detail" value="760px" role=".detailPage max-width — single-column prose mode" />
          <TokenRow token="--st-width-detail-wide" value="1080px" role=".detailPage[data-has-margin] max-width — two-column mode with sidebar" />
          <TokenRow token="--st-space-sidebar" value="220px" role="Fixed width of the right metadata column in two-column grid" />
          <TokenRow token="--st-space-sidebar-gap" value="2.5rem" role="Column gap between prose and sidebar in two-column shell" />
          <TokenRow token="--st-space-meta-top" value="32px" role="Top padding on .detailPage" />
        </TokenGroup>
        <p style={{ ...s.prose, marginTop: '0.75rem', color: 'var(--st-color-text-muted)' }}>
          Never hard-code these values. Every detail page spacing decision resolves through one of these tokens.
        </p>
      </DocSection>

    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Layout/Section',
  component: SectionSpacingPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
