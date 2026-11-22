/**
 * ## Accordion
 *
 * Expand/collapse component with ink top rule, hairline dividers, and pink
 * open chevron. `numbered` adds a Q.NN prefix column and Cormorant question text.
 *
 * SUG-99. Package copy is canonical (SUG-224 Phase 0 decision A, 2026-07-23) —
 * ported from apps/web/src/design-system/components/accordion/Accordion.jsx.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  // #246: known color-contrast failure, reported by the a11y gate (#50) without failing it. Remove when #246 is fixed.
  parameters: { a11y: { test: 'todo' }, layout: 'padded' },
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
// #50 Phase 1: a trigger toggles its panel; single-expand mode closes the others; Space and Enter toggle.
export const Default: Story = {
  name: 'Default',
  args: { items: CS_QUESTIONS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: /core challenge/ });
    const second = canvas.getByRole('button', { name: /taxonomy system/ });

    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: /core challenge/ })).toBeVisible();

    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');

    second.focus();
    await userEvent.keyboard('{Enter}');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  },
};

/** Numbered — Q.NN pink mono prefix, Cormorant question text. */
export const Numbered: Story = {
  name: 'Numbered',
  args: { items: CS_QUESTIONS, numbered: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Q.01')).toBeInTheDocument();
    await expect(canvas.getByText('Q.03')).toBeInTheDocument();
  },
};

/**
 * No items — renders nothing rather than throwing. The guard sits below the
 * hooks deliberately — an early return above `useState`/`useId` would break
 * the Rules of Hooks. Renders an empty frame; a thrown error here is the
 * regression.
 */
export const EmptyItems: Story = {
  name: 'Empty / undefined items',
  args: { items: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0);
  },
};
