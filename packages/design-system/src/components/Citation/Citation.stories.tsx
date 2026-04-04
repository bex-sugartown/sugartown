import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CitationMarker, CitationNote, CitationZone } from './Citation';

const meta: Meta = {
  title: 'Primitives/Citation',
  parameters: {
    docs: {
      description: {
        component:
          'Knowledge notation system — inline superscript citation markers and footnote captions. ' +
          'Typography layer component: renders inside card bodies, article prose, and anywhere body copy appears. ' +
          'Extracted from the legacy WordPress card layout and formalised as a design system primitive.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;


/* ══════════════════════════════════════════════════════
   ① Default — Single citation in prose context
   ══════════════════════════════════════════════════════ */

export const Default: Story = {
  name: 'Default — Single Citation',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ fontFamily: 'var(--st-font-family-narrative)', marginBottom: '0.75rem' }}>
        A Systems View of a Career
      </h3>
      <p style={{ marginBottom: '1rem' }}>
        The Resume Factory is a rules-based composition engine that assembles resumes
        from a single source of truth. Content is selected via variants, slots, and
        deterministic fallbacks so tailoring reflects intent, not AI guesswork.{' '}
        <CitationMarker index={1} />
      </p>

      <CitationZone>
        <CitationNote index={1}>
          Source: Resume Engine v2.0 — deterministic content selection pipeline
        </CitationNote>
      </CitationZone>
    </div>
  ),
};


/* ══════════════════════════════════════════════════════
   ② Multiple — Three citations in one zone
   ══════════════════════════════════════════════════════ */

export const Multiple: Story = {
  name: 'Multiple — Three Citations',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ fontFamily: 'var(--st-font-family-narrative)', marginBottom: '0.75rem' }}>
        CV / Resume — Sugartown-CMS
      </h3>
      <p style={{ marginBottom: '0.5rem' }}>
        The Resume Factory is a rules-based composition engine <CitationMarker index={1} /> that
        assembles resumes from a single source of truth. Content is selected via variants,
        slots, and deterministic fallbacks <CitationMarker index={2} /> so tailoring reflects
        intent, not AI guesswork. The personalisation layer handles all variant
        resolution at build time. <CitationMarker index={3} />
      </p>

      <CitationZone>
        <CitationNote index={1}>Source: Resume Engine v2.0</CitationNote>
        <CitationNote index={2}>Architecture: Slot-based content selection model</CitationNote>
        <CitationNote index={3}>Personalisation: Build-time variant resolution pipeline</CitationNote>
      </CitationZone>
    </div>
  ),
};


/* ══════════════════════════════════════════════════════
   ③ In-prose — Citation inside long-form article body
   NOT inside a card — validates typography layer ownership
   ══════════════════════════════════════════════════════ */

export const InProse: Story = {
  name: 'In-Prose — Article Body',
  render: () => (
    <div style={{ maxWidth: 640, lineHeight: 'var(--st-line-height-relaxed)' }}>
      <h2 style={{
        fontFamily: 'var(--st-font-family-narrative)',
        fontSize: 'var(--st-font-size-2xl)',
        marginBottom: '1rem',
      }}>
        Knowledge Systems and the Citation Contract
      </h2>
      <p style={{ marginBottom: '1rem' }}>
        Citations are what make Sugartown a knowledge system rather than a blog. They are the
        single most distinctive UI pattern in the site. <CitationMarker index={1} /> Without a
        formal component contract, the pattern drifts, duplicates, and loses its scholarly
        intentionality across content types.
      </p>
      <p style={{ marginBottom: '1.5rem' }}>
        The knowledge graph connects concepts through typed relationships. Each node in the
        graph carries provenance metadata that traces back to its original source
        material. <CitationMarker index={2} /> This lineage is the foundation of trust in the
        system — every claim can be verified against its origin.
      </p>

      <CitationZone>
        <CitationNote index={1}>
          EPIC-0159 design brief — citation as knowledge notation primitive
        </CitationNote>
        <CitationNote index={2}>
          Knowledge Graph Architecture v1.2 — provenance metadata specification
        </CitationNote>
      </CitationZone>
    </div>
  ),
};


/* ══════════════════════════════════════════════════════
   ④ Stress — Long footnote text that wraps
   ══════════════════════════════════════════════════════ */

export const Stress: Story = {
  name: 'Stress — Long Footnote Text',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <p style={{ marginBottom: '1rem' }}>
        The composition engine uses a priority-weighted fallback chain to resolve content
        slots when the primary variant is unavailable. <CitationMarker index={1} />
      </p>

      <CitationZone>
        <CitationNote index={1}>
          Source: Resume Engine v2.0 — Priority-weighted fallback chain specification,
          Chapter 4: Slot Resolution Strategy. See also the deterministic content
          selection pipeline architecture document (internal ref: ARCH-2024-017)
          for the full algorithmic description of the variant resolution process
          and its interaction with the personalisation layer.
        </CitationNote>
      </CitationZone>
    </div>
  ),
};


/* ══════════════════════════════════════════════════════
   ⑤ Token Audit — Documented tokens with resolved values
   ══════════════════════════════════════════════════════ */

const CITATION_TOKENS = [
  { name: '--st-citation-color',        mapsTo: 'var(--st-color-text-secondary)' },
  { name: '--st-citation-index-color',  mapsTo: 'var(--st-color-pink)' },
  { name: '--st-citation-font',         mapsTo: 'var(--st-font-family-mono)' },
  { name: '--st-citation-size',         mapsTo: '0.72rem' },
  { name: '--st-citation-marker-bg',    mapsTo: 'var(--st-color-pink)' },
  { name: '--st-citation-marker-color', mapsTo: 'var(--st-color-white)' },
  { name: '--st-citation-zone-border',  mapsTo: 'rgba(255, 36, 125, 0.2)' },
  { name: '--st-citation-zone-gap',     mapsTo: 'var(--st-space-3)' },
];

export const TokenAudit: Story = {
  name: 'Token Audit',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <h3 style={{
        fontFamily: 'var(--st-font-family-mono)',
        fontSize: 'var(--st-font-size-sm)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: 'var(--st-color-text-muted)',
        marginBottom: '1rem',
      }}>
        Citation Token Reference
      </h3>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--st-font-family-mono)',
        fontSize: 'var(--st-font-size-xs)',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--st-color-border-default)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem 0.5rem 0' }}>Token</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem 0.5rem 0' }}>Maps To</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {CITATION_TOKENS.map((token) => (
            <tr key={token.name} style={{ borderBottom: '1px solid var(--st-color-border-subtle)' }}>
              <td style={{
                padding: '0.5rem 1rem 0.5rem 0',
                color: 'var(--st-color-text-brand)',
                fontWeight: 600,
              }}>
                {token.name}
              </td>
              <td style={{
                padding: '0.5rem 1rem 0.5rem 0',
                color: 'var(--st-color-text-muted)',
              }}>
                {token.mapsTo}
              </td>
              <td style={{ padding: '0.5rem 0' }}>
                <span style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  verticalAlign: 'middle',
                  marginRight: 8,
                  border: '1px solid var(--st-color-border-default)',
                  background: `var(${token.name})`,
                }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
