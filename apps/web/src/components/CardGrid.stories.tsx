import type { Meta, StoryObj } from '@storybook/react';
import CardGrid from './CardGrid';

const meta: Meta<typeof CardGrid> = {
  title: 'Patterns/CardGrid',
  component: CardGrid,
  parameters: {
    docs: {
      description: {
        component:
          '**Deprecated** — replaced by CardBuilderSection (EPIC-0160). Kept for backward compatibility with existing content.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

const mockCards = [
  {
    title: 'Prompt Architecture for Long-Form Reasoning',
    description:
      'Breaking complex prompts into reasoning chains that produce consistent, verifiable output.',
    link: { label: 'Read more', url: '/articles/prompt-architecture' },
  },
  {
    title: 'Content Modelling Best Practices',
    description:
      'Designing Sanity schemas that scale — references over embedded objects, typed taxonomies, and composition patterns.',
    link: { label: 'Read more', url: '/articles/content-modelling' },
  },
  {
    title: 'Token-Driven Design Systems',
    description:
      'A single source of truth for colour, spacing, and typography that works across web, native, and print.',
    link: { label: 'View case study', url: '/case-studies/design-tokens' },
  },
];

/** Two-column grid (2 cards). */
export const TwoCards: Story = {
  args: {
    cards: mockCards.slice(0, 2),
  },
};

/** Three-column grid (3 cards). */
export const ThreeCards: Story = {
  args: {
    cards: mockCards,
  },
};

/** Empty state — renders nothing. */
export const Empty: Story = {
  args: {
    cards: [],
  },
};
