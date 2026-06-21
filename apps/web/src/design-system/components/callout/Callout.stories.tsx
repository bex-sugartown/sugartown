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
  title: 'Components/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'info', 'tip', 'warn', 'danger', 'banner'],
      description: 'Colorway — default: neutral grey label / ink rule (light) / pink rule (dark). info: pink. tip: violet. warn: orange. danger: maroon. banner: full-width strip, no label column.',
    },
    title:   { control: 'text', description: 'Bold label shown in the label column (or inline for banner)', defaultValue: 'The Challenge' },
    number:  { control: 'text', description: 'Folio number shown above the title (e.g. § 01)', defaultValue: '§ 01' },
    content: { control: 'text', description: 'Body text — renders as a paragraph. Use children for rich content.' },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    title: 'The Challenge',
    number: '§ 01',
    content: 'Default callout. Neutral grey label column, ink top rule in light theme, pink in dark.',
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

export const Default: Story = {
  args: { variant: 'default' },
};

export const Info: Story = {
  args: { variant: 'info', title: 'Note', number: '§ 02', content: 'Factual context or background reading. Pink top rule and folio number.' },
};

export const Tip: Story = {
  args: { variant: 'tip', title: 'Tip', number: '§ 03', content: 'Practical guidance. Violet top rule and folio number.' },
};

export const Warn: Story = {
  args: { variant: 'warn', title: 'Warning', number: '§ 04', content: 'Caveats, known edge cases, or partial-coverage notes. Orange top rule.' },
};

export const Danger: Story = {
  args: { variant: 'danger', title: 'Danger', number: '§ 05', content: 'High-risk warnings. Maroon top rule.' },
};

/** Banner — full-width strip, no label column. With and without title. */
export const Banner: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Callout variant="banner" title="Note">
        <p>This section covers experimental APIs that may change before general availability.</p>
      </Callout>
      <Callout variant="banner">
        <p>Draft content — not published. Visible in preview mode only.</p>
      </Callout>
    </div>
  ),
};

/** Snapshot — all colorways for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
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
      <Callout variant="banner" title="Note">
        <p>Banner — single-row strip, full-width, no label column.</p>
      </Callout>
    </div>
  ),
};
