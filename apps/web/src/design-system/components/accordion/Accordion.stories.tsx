/**
 * ## Accordion
 *
 * Expand/collapse component with ink top rule, hairline dividers, and pink
 * open chevron. `numbered` adds a Q.NN prefix column and Cormorant question text.
 *
 * SUG-99
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Accordion from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Primitives/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    multi:         { control: 'boolean', description: 'Allow multiple panels open simultaneously' },
    numbered:      { control: 'boolean', description: 'Q.NN prefix column + Cormorant text' },
    numberPrefix:  { control: 'text',    description: 'Prefix character, e.g. Q → Q.01' },
    defaultOpen:   { table: { disable: true } },
    items:         { table: { disable: true } },
    className:     { table: { disable: true } },
  },
  decorators: [
    (Story) => <div style={{ maxWidth: '640px' }}><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const CS_QUESTIONS = [
  {
    id: 'q1',
    trigger: 'What was the core challenge?',
    content: (
      <p>
        The editorial team had no reliable way to surface related content
        at the point of decision — readers left before exploring depth the
        site already had.
      </p>
    ),
  },
  {
    id: 'q2',
    trigger: 'How did the team approach the taxonomy system?',
    content: (
      <p>
        Three passes: first a vocabulary audit across 800 published pieces,
        then a controlled tagging sprint, then a filter model that mapped
        reader intent (topic, format, date range) to structured fields.
      </p>
    ),
  },
  {
    id: 'q3',
    trigger: 'What changed for readers after launch?',
    content: (
      <p>
        Average time-on-site rose 38%. Filter usage in the first 90 days
        showed 91% of sessions matched within two filter combinations —
        well within the original two-step model.
      </p>
    ),
  },
];

/** Default — ink top rule, hairline dividers, left-aligned labels. */
export const Default: Story = {
  name: 'Default',
  args: { items: CS_QUESTIONS },
};

/** Default with first item open — pink chevron visible. */
export const DefaultOpen: Story = {
  name: 'Default / First Open',
  args: { items: CS_QUESTIONS, defaultOpen: ['q1'] },
};

/** Numbered — Q.NN pink mono prefix, Cormorant question text. */
export const Numbered: Story = {
  name: 'Numbered',
  args: { items: CS_QUESTIONS, numbered: true },
};

/** Numbered with first item open — pink chevron visible. */
export const NumberedOpen: Story = {
  name: 'Numbered / First Open',
  args: { items: CS_QUESTIONS, numbered: true, defaultOpen: ['q1'] },
};

/** Snapshot for Chromatic VRT — all four states. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '640px' }}>
      <Accordion items={CS_QUESTIONS} />
      <Accordion items={CS_QUESTIONS} defaultOpen={['q1']} />
      <Accordion items={CS_QUESTIONS} numbered />
      <Accordion items={CS_QUESTIONS} numbered defaultOpen={['q1']} />
    </div>
  ),
};
