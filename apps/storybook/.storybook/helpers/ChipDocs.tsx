import React from 'react';
import {
  DocSection,
  OverviewItem, NotItem,
  docStyles as s,
  AiGeneratedFooter,
} from './docs';

export function ChipGuidelinesPage() {
  return (
    <div style={s.page}>

      <h1 style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Chip / Tag
      </h1>
      <p style={s.prose}>Which Chip variant to use and when — default, tag, badge status, or dotColor mode.</p>

      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          The <code style={s.code}>Chip</code> component has two chassis modes. The correct choice depends on whether the chip communicates a label (neutral) or a status/project signal (badge).
        </p>

        <h3 style={s.h3}>Tag — neutral gray chassis</h3>
        <p style={s.prose}><code style={s.code}>variant=&quot;tag&quot;</code>, or no variant. No active state.</p>
        <ul style={s.list}>
          <OverviewItem><strong>Default (no <code style={s.code}>featured</code>)</strong> — gray neutral, no color. Use for read-only taxonomy labels in MetadataCard and detail page metadata strips.</OverviewItem>
          <OverviewItem><strong><code style={s.code}>featured</code></strong> — pink rubric tint. Applied to the first taxonomy chip in a set to signal the primary category.</OverviewItem>
        </ul>

        <h3 style={s.h3}>Badge — uppercase bold chassis</h3>
        <p style={s.prose}>
          <code style={s.code}>variant=&quot;badge&quot;</code>. Uppercase bold text, neutral chassis. Dot is optional — driven by <code style={s.code}>color</code> or <code style={s.code}>dotColor</code>. Use for status labels, project tags, and inline abbreviations.
        </p>
        <ul style={s.list}>
          <OverviewItem><strong>No dot</strong> — omit <code style={s.code}>color</code> and <code style={s.code}>dotColor</code>. Use for read-only labels where color is not needed (e.g. &ldquo;In Review&rdquo;, &ldquo;CMS&rdquo;).</OverviewItem>
          <OverviewItem><strong>Dot via <code style={s.code}>color</code></strong> — named preset: <code style={s.code}>&quot;seafoam&quot;</code> <code style={s.code}>&quot;violet&quot;</code> <code style={s.code}>&quot;lime&quot;</code> <code style={s.code}>&quot;amber&quot;</code> <code style={s.code}>&quot;grey&quot;</code>. Use for content status signals.</OverviewItem>
          <OverviewItem><strong>Dot via <code style={s.code}>dotColor</code></strong> — inline hex (e.g. from <code style={s.code}>project.colorHex</code> in Sanity). Use for project chips. Pass <code style={s.code}>onClick</code> to make the chip interactive.</OverviewItem>
        </ul>

        <div style={{ background: 'color-mix(in srgb, var(--st-color-accent) 8%, var(--st-color-canvas))', border: '1px solid color-mix(in srgb, var(--st-color-accent) 25%, var(--st-color-canvas))', borderRadius: 2, padding: '0.75rem 1rem', marginTop: '1rem' }}>
          <p style={{ ...s.prose, marginBottom: '0.375rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deprecation notes</p>
          <ul style={{ ...s.list, marginBottom: 0 }}>
            <NotItem><strong><code style={s.code}>status</code> prop values</strong> (<code style={s.code}>&quot;evergreen&quot;</code>, <code style={s.code}>&quot;draft&quot;</code>, <code style={s.code}>&quot;deprecated&quot;</code>, etc.) are deprecated. Use <code style={s.code}>color</code> (named preset) instead.</NotItem>
            <NotItem><strong><code style={s.code}>colorHex</code></strong> is deprecated. Use <code style={s.code}>color</code> for all preset needs.</NotItem>
            <NotItem><strong><code style={s.code}>variant=&quot;status&quot;</code></strong> is a deprecated alias for <code style={s.code}>variant=&quot;badge&quot;</code> — both work, but new code should use <code style={s.code}>&quot;badge&quot;</code>.</NotItem>
          </ul>
        </div>
      </DocSection>

      <AiGeneratedFooter />

    </div>
  );
}
