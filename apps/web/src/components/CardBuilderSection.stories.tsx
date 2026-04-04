import type { Meta, StoryObj } from '@storybook/react';
import CardBuilderSection from './CardBuilderSection';
import { bodyWithCitation, simpleParagraph } from './__fixtures__/portableText';

const meta: Meta<typeof CardBuilderSection> = {
  title: 'Patterns/CardBuilderSection',
  component: CardBuilderSection,
};

export default meta;
type Story = StoryObj<typeof CardBuilderSection>;

/** Single card with title, body text, and tags. */
export const SingleCard: Story = {
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-1',
      cards: [
        {
          _key: 'card-1',
          title: 'Prompt Architecture for Long-Form Reasoning',
          variant: 'default',
          body: simpleParagraph,
          tags: [
            { title: 'AI', slug: { current: 'ai' } },
            { title: 'Prompt Engineering', slug: { current: 'prompt-engineering' } },
          ],
        },
      ],
    },
  },
};

/** Two-column grid with different card configurations. */
export const TwoCards: Story = {
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-2',
      cards: [
        {
          _key: 'card-1',
          title: 'Content Modelling Best Practices',
          variant: 'default',
          body: simpleParagraph,
          titleLink: {
            type: 'external',
            externalUrl: 'https://www.sanity.io/docs/content-modelling',
          },
          tags: [
            { title: 'CMS', slug: { current: 'cms' } },
            { title: 'Sanity', slug: { current: 'sanity' } },
          ],
        },
        {
          _key: 'card-2',
          title: 'Token-Driven Design Systems',
          variant: 'default',
          body: simpleParagraph,
          tags: [
            { title: 'Design Systems', slug: { current: 'design-systems' } },
          ],
        },
      ],
    },
  },
};

/** Three-column grid with citation footnotes. */
export const ThreeCardsWithCitations: Story = {
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-3',
      cards: [
        {
          _key: 'card-1',
          title: 'Structured Output',
          variant: 'default',
          body: bodyWithCitation,
          citations: [
            {
              _key: 'cit-1',
              index: 1,
              source: 'Anthropic Documentation',
              url: 'https://docs.anthropic.com',
            },
          ],
        },
        {
          _key: 'card-2',
          title: 'Content Graph Patterns',
          variant: 'default',
          body: simpleParagraph,
        },
        {
          _key: 'card-3',
          title: 'Schema Migration Strategies',
          variant: 'default',
          body: simpleParagraph,
        },
      ],
    },
  },
};
