import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Blockquote } from './Blockquote';

/**
 * ## Blockquote
 *
 * Single canonical style: pink left border, italic text, muted colour.
 * Supports optional `citation` for attribution via `<footer><cite>`.
 *
 * No variants — this is the complete blockquote treatment.
 *
 * Canonical CSS: `artifacts/style 260118.css` §02
 */
const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    citation: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    children: (
      <p>
        Design systems are not about creating rigid constraints — they are about
        establishing shared language that frees teams to focus on solving real
        problems instead of reinventing pixels.
      </p>
    ),
  },
};

// ── With Citation ────────────────────────────────────────────────────────────

export const WithCitation: Story = {
  args: {
    children: (
      <p>
        The best design systems are the ones that are invisible. They make
        the right thing the easy thing.
      </p>
    ),
    citation: 'Becky Alice Head, Sugartown Design System PRD',
  },
};

// ── Nested ───────────────────────────────────────────────────────────────────

export const Nested: Story = {
  render: () => (
    <Blockquote>
      <p>
        Outer blockquote — this contains a nested quote within it.
      </p>
      <Blockquote citation="Inner source">
        <p>This is the nested blockquote inside the outer one.</p>
      </Blockquote>
    </Blockquote>
  ),
};

// ── Stress Test: Long Quote ──────────────────────────────────────────────────

export const StressTestLongQuote: Story = {
  name: 'Stress Test / Long Quote',
  args: {
    children: (
      <>
        <p>
          When we started extracting the Sugartown design system from the
          WordPress theme, we had no idea how deep the rabbit hole went.
          Every component had three slightly different implementations. The
          spacing tokens were a mix of rem, em, px, and occasionally vh.
          Colours that looked identical in Figma had four different hex values
          in the CSS.
        </p>
        <p>
          The breakthrough came when we stopped trying to document what existed
          and instead defined what should exist. We wrote the token spec first,
          then migrated component-by-component, treating each migration as a
          chance to reconcile the drift. Six months later, we had a single
          source of truth that powered Storybook, the production site, and the
          Sanity Studio preview pane.
        </p>
        <p>
          The lesson: legacy code is not technical debt — it is archaeological
          evidence. Treat it with respect, extract the intent, then formalise
          it into something that can evolve.
        </p>
      </>
    ),
    citation: 'Sugartown Post-Mortem, v7b Retrospective',
  },
};
