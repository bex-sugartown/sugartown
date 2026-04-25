/**
 * Callout stories — SUG-80 · Ledger Tradition structural treatment
 *
 * Rule-pair box (no bg tint) + CSS grid label column.
 * Five variants: default, info, tip, warn, danger.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Callout from './Callout';

const meta: Meta<typeof Callout> = {
  title: 'Patterns/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'info', 'tip', 'warn', 'danger'] },
    title:   { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '680px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Callout>;

/** Default (pink) — single-word label, short body. */
export const Default: Story = {
  args: {
    variant: 'default',
    children: <p>This is the default callout. Pink 2px rubrication rule, mono label in the left column.</p>,
  },
};

/** With explicit title — label overrides the variant name. */
export const WithTitle: Story = {
  name: 'With title',
  args: {
    variant: 'default',
    title: "Author's note",
    children: <p>Multi-word title as label. Wraps within the 72px column. Body column unaffected.</p>,
  },
};

/** Info — neutral rule and label. */
export const Info: Story = {
  args: {
    variant: 'info',
    children: <p>Factual context or background reading. Neutral-300 top rule, neutral-600 label.</p>,
  },
};

/** Tip — seafoam rule and label. */
export const Tip: Story = {
  args: {
    variant: 'tip',
    children: <p>Practical guidance. Seafoam top rule and seafoam-800 label — WCAG AA on canvas.</p>,
  },
};

/** Warn — amber rule and label. */
export const Warn: Story = {
  args: {
    variant: 'warn',
    children: <p>Caveats, known edge cases, or partial-coverage notes. Amber-600 rule, amber-700 label.</p>,
  },
};

/** Danger — maroon rule and label. */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: <p>High-risk warnings. Maroon rule and label, consistent with text-brand token.</p>,
  },
};

/** Multi-paragraph body — label stays anchored to top of grid row. */
export const MultiParagraph: Story = {
  name: 'Multi-paragraph body',
  args: {
    variant: 'default',
    title: 'Note',
    children: (
      <>
        <p>The grid label column is fixed at 72px. The body column takes the remaining width via <code>1fr</code>.</p>
        <p>When body content spans multiple paragraphs the label stays anchored to the top of the grid cell — it does not stretch or repeat.</p>
        <p>Links within the body resolve to <a href="#">the accent link colour</a>, consistent with all prose link treatment.</p>
      </>
    ),
  },
};

/** Snapshot — all variants side by side for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column' }}>
      {(['default', 'info', 'tip', 'warn', 'danger'] as const).map((v) => (
        <Callout key={v} variant={v}>
          <p>{v.charAt(0).toUpperCase() + v.slice(1)} variant — 2px {v} rule, mono label in left column.</p>
        </Callout>
      ))}
    </div>
  ),
};
