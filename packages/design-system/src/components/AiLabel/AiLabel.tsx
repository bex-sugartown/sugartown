import React, { useState } from 'react';
import styles from './AiLabel.module.css';

/**
 * AiLabel — Sugartown Design System
 *
 * The on-site AI-generated label (SUG-178). Same anchor, type, padding, border and fill as the
 * visible mark ST-178 stamps into the image file, so the two never look different. Place it
 * inside a `position: relative; container-type: inline-size` frame the size of the image, or pass
 * `frame` to get that container layer for a CSS-background image such as the hero.
 *
 * Width rules (container queries, no JS): under 96px nothing; 96 to 199px "AI"; 200px and up
 * "AI-generated"; at 320px and up the tool name expands on hover, focus or tap.
 *
 * Vspec: docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html
 */

export type AiTool = 'dall-e' | 'midjourney' | 'stable-diffusion' | 'adobe-firefly' | 'other' | string;

export interface AiLabelProps {
  /** Renders nothing when false or absent. */
  aiGenerated?: boolean;
  /** Schema value from `richImage.aiTool`. 'other' and unknown values show no tool name. */
  aiTool?: AiTool;
  /** Wrap in a full-size container layer. Use where the image is a CSS background (hero). */
  frame?: boolean;
  /**
   * Show the tool name on expand. Default true. Pass false on cards: the label is then decorative,
   * not focusable, and clicks reach the card link.
   */
  showTool?: boolean;
  className?: string;
}

const TOOL_NAMES: Record<string, string> = {
  'dall-e': 'DALL-E',
  midjourney: 'Midjourney',
  'stable-diffusion': 'Stable Diffusion',
  'adobe-firefly': 'Adobe Firefly',
};

export function toolLabel(aiTool?: string): string | undefined {
  return aiTool ? TOOL_NAMES[aiTool] : undefined;
}

export function AiLabel({ aiGenerated, aiTool, frame, showTool = true, className }: AiLabelProps) {
  const [open, setOpen] = useState(false);
  if (!aiGenerated) return null;

  const tool = showTool ? toolLabel(aiTool) : undefined;
  const interactive = showTool;
  const label = tool ? `AI-generated image, ${tool}` : 'AI-generated image';

  // The label can sit inside a clickable figure (lightbox). Keep its own clicks and keys to itself.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const labelEl = (
    <span
      className={[styles.aiLabel, className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
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
      <span className={styles.short} aria-hidden="true">AI</span>
      <span className={styles.full} aria-hidden="true">AI-generated</span>
      {tool && <span className={styles.tool} aria-hidden="true">{tool}</span>}
    </span>
  );

  return frame ? <span className={styles.frame}>{labelEl}</span> : labelEl;
}
