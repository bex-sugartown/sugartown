import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

/**
 * ## Accordion
 *
 * Expand/collapse component using CSS grid-row animation.
 *
 * - **Single-expand** (default) — only one panel open at a time
 * - **Multi-expand** — multiple panels can be open simultaneously
 *
 * Full a11y: `aria-expanded`, `aria-controls`, `role="region"`, keyboard nav.
 * Animation uses the CSS `grid-template-rows` trick (proven in MobileNav).
 *
 * SUG-44: Accordion Component
 */
const meta: Meta<typeof Accordion> = {
  title: 'Primitives/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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
type Story = StoryObj<typeof Accordion>;

const FAQ_ITEMS = [
  {
    id: 'what',
    trigger: 'What is the Sugartown Design System?',
    content: (
      <p>
        A CMS-agnostic component library providing tokens, primitives, and
        patterns for the Sugartown platform. Built with React, CSS Modules, and
        Storybook.
      </p>
    ),
  },
  {
    id: 'tokens',
    trigger: 'How do design tokens work?',
    content: (
      <p>
        Tokens follow a three-tier model: raw primitives at the base level,
        semantic aliases mapping intent to primitives, and component tokens
        binding specific components to the semantic layer. All tokens use the{' '}
        <code>--st-*</code> namespace.
      </p>
    ),
  },
  {
    id: 'themes',
    trigger: 'What themes are available?',
    content: (
      <p>
        Three themes ship by default: <strong>Midnight</strong> (dark, default),{' '}
        <strong>Light</strong>, and <strong>Pink Moon</strong> (light with warm
        pink accents). Themes are controlled via the{' '}
        <code>data-theme</code> attribute on the root element.
      </p>
    ),
  },
];

// ── Single Expand (default) ─────────────────────────────────────────────────

export const SingleExpand: Story = {
  args: {
    items: FAQ_ITEMS,
  },
};

// ── Multi Expand ────────────────────────────────────────────────────────────

export const MultiExpand: Story = {
  name: 'Multi Expand',
  args: {
    items: FAQ_ITEMS,
    multi: true,
  },
};

// ── With Default Open ───────────────────────────────────────────────────────

export const WithDefaultOpen: Story = {
  name: 'Default Open',
  args: {
    items: FAQ_ITEMS,
    defaultOpen: ['what'],
  },
};

// ── Long Content ────────────────────────────────────────────────────────────

export const LongContent: Story = {
  name: 'Long Content',
  args: {
    items: [
      {
        id: 'long',
        trigger: 'Accordion with extended body content',
        content: (
          <>
            <p>
              This item contains multiple paragraphs to test the grid-row
              animation with varying content heights. The animation should remain
              smooth regardless of content length.
            </p>
            <p>
              Token architecture follows a three-tier model: raw primitives at
              the base level provide the atomic values; semantic aliases map
              intent to primitives; component tokens bind specific components to
              the semantic layer.
            </p>
            <p>
              When drift occurs between the two token files — the canonical web
              file and the design system mirror — the browser silently falls back
              to user-agent defaults. This is invisible in development unless you
              run <code>pnpm validate:tokens</code> explicitly.
            </p>
          </>
        ),
      },
      {
        id: 'short',
        trigger: 'Short item for comparison',
        content: <p>A brief answer.</p>,
      },
    ],
  },
};

// ── Many Items ──────────────────────────────────────────────────────────────

export const ManyItems: Story = {
  name: 'Many Items',
  args: {
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `item-${i}`,
      trigger: `Question ${i + 1}: What happens with many accordion items?`,
      content: (
        <p>
          Answer {i + 1}: The accordion scales gracefully with any number of
          items. Each item is independently expandable.
        </p>
      ),
    })),
  },
};
