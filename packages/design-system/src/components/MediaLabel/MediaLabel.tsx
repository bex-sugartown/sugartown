import React, { useState } from 'react';
import styles from './MediaLabel.module.css';
import { Chip } from '../Chip';

/**
 * MediaLabel — Sugartown Design System
 *
 * A short label laid over an image, lower-left. The look is a Chip (`variant="badge"
 * tone="inverse" size="fluid"`); this component adds the placement, the width tiers and the
 * expandable detail. The caller supplies every word: Sugartown uses it for the AI-generated
 * label (SUG-178, ST-181), built in `apps/web/src/lib/provenance.js` (`aiLabelProps`).
 * Renamed from AiLabel in ST-183 so the component is not named after one use.
 *
 * Place it inside a `position: relative; container-type: inline-size` frame the size of the image,
 * or pass `frame` to get that container layer for a CSS-background image such as the hero.
 *
 * Width rules (container queries, no JS): under 96px nothing; 96 to 199px `short`; 200px and up
 * `full`; at 320px and up `detail` expands on hover, focus or tap (interactive labels only).
 *
 * Vspec: docs/drafts/ST-181-ai-image-provenance-compliance-gaps.vspec.html (builds on ST-178's)
 */

export interface MediaLabelProps {
  /** Text shown from 96 to 199px of image width. */
  short: string;
  /** Text shown from 200px of image width. */
  full: string;
  /** Extra text that expands on hover, focus or tap at 320px and up. Interactive labels only. */
  detail?: string;
  /** Accessible name for the label (`role="img"`). */
  ariaLabel: string;
  /**
   * Default true: focusable, and tap or Enter toggles the detail. Pass false where the image sits
   * inside a link (cards): the label is then decorative, shows no detail, and clicks reach the link.
   */
  interactive?: boolean;
  /** Wrap in a full-size container layer. Use where the image is a CSS background (hero). */
  frame?: boolean;
  className?: string;
}

export function MediaLabel({ short, full, detail, ariaLabel, interactive = true, frame, className }: MediaLabelProps) {
  const [open, setOpen] = useState(false);
  const shownDetail = interactive ? detail : undefined;

  // The label can sit inside a clickable figure (lightbox). Keep its own clicks and keys to itself.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const labelEl = (
    <span
      className={[styles.mediaLabel, className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      data-open={open ? 'true' : undefined}
      {...(interactive
        ? {
            onClick: (e: React.MouseEvent) => { stop(e); setOpen((v) => !v); },
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
              stop(e);
            },
            onBlur: () => setOpen(false),
          }
        : {})}
    >
      <Chip variant="badge" tone="inverse" size="fluid">
        <span className={styles.text}>
          <span className={styles.short} aria-hidden="true">{short}</span>
          <span className={styles.full} aria-hidden="true">{full}</span>
          {shownDetail && <span className={styles.detail} aria-hidden="true">{shownDetail}</span>}
        </span>
      </Chip>
    </span>
  );

  return frame ? <span className={styles.frame}>{labelEl}</span> : labelEl;
}
