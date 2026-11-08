import React from 'react';
import styles from './Citation.module.css';

/* ══════════════════════════════════════════════════════
   st-citation — Knowledge Notation System
   Three exports: CitationMarker, CitationNote, CitationZone
   Typography layer — not card layer.
   ══════════════════════════════════════════════════════ */

// ── CitationMarker ────────────────────────────────────

export interface CitationMarkerProps {
  /** The citation number, e.g. 1 */
  index: number;
  /** Optional: custom anchor ID target (defaults to `st-citation-{index}`) */
  targetId?: string;
}

/**
 * Inline superscript citation marker — renders as a pink pill with [n].
 * Place inline within body copy.
 */
export const CitationMarker: React.FC<CitationMarkerProps> = ({
  index,
  targetId,
}) => {
  const id = targetId ?? `st-citation-${index}`;

  return (
    <sup className={styles.marker}>
      <a
        href={`#${id}`}
        id={`cite-ref-${index}`}
        role="doc-noteref"
        aria-label={`Citation ${index}`}
        className={styles.markerLink}
      >
        [{index}]
      </a>
    </sup>
  );
};


// ── CitationNote ──────────────────────────────────────

export interface CitationNoteProps {
  /** The citation number, e.g. 1 */
  index: number;
  /** The footnote text content */
  children: React.ReactNode;
  /** Optional: custom anchor ID (defaults to `st-citation-{index}`) */
  id?: string;
}

/**
 * Single footnote line item — renders [n] + source text in monospace.
 * Place inside a CitationZone.
 */
export const CitationNote: React.FC<CitationNoteProps> = ({
  index,
  children,
  id,
}) => {
  const noteId = id ?? `st-citation-${index}`;

  return (
    <p id={noteId} className={styles.note}>
      <span className={styles.index}>[{index}]</span>
      {children}{' '}
      <a
        href={`#cite-ref-${index}`}
        role="doc-backlink"
        aria-label={`Back to citation ${index}`}
        className={styles.backLink}
      >
        {'\u21a9'}
      </a>
    </p>
  );
};


// ── CitationZone ──────────────────────────────────────

export interface CitationZoneProps {
  /** CitationNote items */
  children: React.ReactNode;
}

/**
 * Semantic wrapper for all footnotes on a content surface.
 * Renders a dashed top border and stacks notes vertically.
 */
export const CitationZone: React.FC<CitationZoneProps> = ({ children }) => {
  return (
    // A labelled <section>, not <footer role="doc-endnotes">. The footer does not allow that role
    // (Lighthouse agent-accessibility-tree, aria-allowed-role, #84) and doc-endnote(s) are
    // deprecated in DPUB-ARIA 1.1 (axe aria-deprecated-role, #164). The label and the
    // doc-backlink links keep the footnote relationship for screen readers.
    <section className={styles.zone} aria-label="Footnotes">
      {children}
    </section>
  );
};
