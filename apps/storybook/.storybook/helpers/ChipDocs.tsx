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
        <p style={s.prose}><code style={s.code}>variant="tag"</code>, or no variant. No active state.</p>
        <ul style={s.list}>
          <OverviewItem><strong>Default (no <code style={s.code}>featured</code>)</strong> — gray neutral, no color. Use for read-only taxonomy labels in MetadataCard and detail page metadata strips.</OverviewItem>
          <OverviewItem><strong><code style={s.code}>featured</code></strong> — pink rubric tint. Applied to the first taxonomy chip in a set to signal the primary category.</OverviewItem>
        </ul>

        <h3 style={s.h3}>Badge — uppercase bold chassis</h3>
        <p style={s.prose}>
          <code style={s.code}>variant="status"</code> (planned rename: <code style={s.code}>variant="badge"</code>). Uppercase bold text, neutral chassis. Dot is optional — driven by <code style={s.code}>color</code> or <code style={s.code}>dotColor</code>.
        </p>
        <ul style={s.list}>
          <OverviewItem><strong>No dot</strong> — omit <code style={s.code}>color</code> and <code style={s.code}>dotColor</code>. Use for read-only status labels where color is not needed.</OverviewItem>
          <OverviewItem><strong>Colored dot via <code style={s.code}>color</code></strong> — named preset (seafoam, violet, lime, amber, grey). Use for content status signals.</OverviewItem>
          <OverviewItem><strong>Colored dot via <code style={s.code}>dotColor</code></strong> — inline hex from Sanity <code style={s.code}>project.colorHex</code>. Use for project chips. Pass <code style={s.code}>onClick</code> to make the chip interactive.</OverviewItem>
        </ul>

        <div style={{ background: 'color-mix(in srgb, var(--st-color-accent) 8%, var(--st-color-canvas))', border: '1px solid color-mix(in srgb, var(--st-color-accent) 25%, var(--st-color-canvas))', borderRadius: 2, padding: '0.75rem 1rem', marginTop: '1rem' }}>
          <p style={{ ...s.prose, marginBottom: '0.375rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deprecation notes</p>
          <ul style={{ ...s.list, marginBottom: 0 }}>
            <NotItem><strong><code style={s.code}>status</code> prop values</strong> (<code style={s.code}>evergreen</code>, <code style={s.code}>draft</code>, <code style={s.code}>deprecated</code>, etc.) are deprecated. Use <code style={s.code}>color</code> (named preset) instead. Named lifecycle states are being phased out in favour of a consistent color-only API.</NotItem>
            <NotItem><strong><code style={s.code}>colorHex</code></strong> is deprecated. Use <code style={s.code}>color</code> for all preset needs.</NotItem>
            <NotItem><strong>Variant rename planned:</strong> <code style={s.code}>variant="status"</code> → <code style={s.code}>variant="badge"</code>. The "status" name is implementation-specific; "badge" describes the uppercase chip used for both status labels and project tags.</NotItem>
          </ul>
        </div>
      </DocSection>

      <AiGeneratedFooter />

    </div>
  );
}
