/**
 * ## Callout
 *
 * Row-format structural callout. Two-column grid: solid label column +
 * body column. 2px accent top border, 1px box border. No radius.
 *
 * `number` prop adds a folio §NN above the label text.
 * Five colorways: default (ink light / pink dark), info, tip, warn, danger.
 *
 * SUG-99
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Callout from './Callout';

const meta: Meta<typeof Callout> = {
  title: 'Primitives/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'info', 'tip', 'warn', 'danger'] },
    title:   { control: 'text' },
    number:  { control: 'text' },
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

/** Default — neutral label column, ink top rule (light) / pink (dark). */
export const Default: Story = {
  args: {
    variant: 'default',
    children: <p>Default callout. Neutral grey label column, ink top rule in light theme, pink in dark.</p>,
  },
};

/** With folio number and title — label column shows §NN above the section name. */
export const WithNumber: Story = {
  name: 'With number + title',
  args: {
    variant: 'default',
    number: '§ 01',
    title: 'The Challenge',
    children: <p>The client's catalogue had grown considerably, but the site treated every entry as a peer. Discovery collapsed into endless filter menus, and the editorial voice was buried beneath a transactional interface.</p>,
  },
};

/** Info — pink accent. */
export const Info: Story = {
  args: {
    variant: 'info',
    number: '§ 02',
    title: 'Note',
    children: <p>Factual context or background reading. Pink top rule and folio number.</p>,
  },
};

/** Tip — violet accent. */
export const Tip: Story = {
  args: {
    variant: 'tip',
    number: '§ 03',
    title: 'Tip',
    children: <p>Practical guidance. Violet top rule and folio number.</p>,
  },
};

/** Warn — orange accent. */
export const Warn: Story = {
  args: {
    variant: 'warn',
    number: '§ 04',
    title: 'Warning',
    children: <p>Caveats, known edge cases, or partial-coverage notes. Orange top rule and folio number.</p>,
  },
};

/** Danger — maroon accent. */
export const Danger: Story = {
  args: {
    variant: 'danger',
    number: '§ 05',
    title: 'Danger',
    children: <p>High-risk warnings. Maroon top rule and folio number.</p>,
  },
};

/** Without number — title-only label column (backward-compatible). */
export const TitleOnly: Story = {
  name: 'Title only (no number)',
  args: {
    variant: 'default',
    title: "Author's note",
    children: <p>Label column shows title only — number prop omitted. Fully backward-compatible with existing usage.</p>,
  },
};

/** Multi-paragraph body — label column anchors to top. */
export const MultiParagraph: Story = {
  name: 'Multi-paragraph body',
  args: {
    variant: 'default',
    number: '§ 01',
    title: 'Context',
    children: (
      <>
        <p>The label column is fixed at 130px. The body column takes the remaining width via <code>1fr</code>.</p>
        <p>When body content spans multiple paragraphs the label stays anchored to the top of its column — it does not stretch or repeat.</p>
        <p>Links resolve to <a href="#">the accent link colour</a>, consistent with all prose link treatment.</p>
      </>
    ),
  },
};

/** Snapshot — all colorways for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '0' }}>
      <Callout variant="default" number="§ 01" title="The Challenge">
        <p>Default — ink top rule (light) / pink (dark). Neutral grey label column.</p>
      </Callout>
      <Callout variant="info" number="§ 02" title="Note">
        <p>Info — pink top rule and folio number.</p>
      </Callout>
      <Callout variant="tip" number="§ 03" title="Tip">
        <p>Tip — violet top rule and folio number.</p>
      </Callout>
      <Callout variant="warn" number="§ 04" title="Warning">
        <p>Warn — orange top rule and folio number.</p>
      </Callout>
      <Callout variant="danger" number="§ 05" title="Danger">
        <p>Danger — maroon top rule and folio number.</p>
      </Callout>
    </div>
  ),
};
