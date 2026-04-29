import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import CardBuilderSection from './CardBuilderSection';
import { bodyWithCitation, simpleParagraph } from './__fixtures__/portableText';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof CardBuilderSection> = {
  title: 'Patterns/CardBuilderSection',
  component: CardBuilderSection,
  tags: ['autodocs'],
  decorators: [withRouter],
  argTypes: {
    section: { control: { type: 'object' }, description: 'CardBuilderSection data: cards[], each with title, body, tags, citations, image, overlay' },
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CardBuilderSection>;

// ─── Shared fixtures ───────────────────────────────────────

const IMAGE_A = {
  asset: { url: 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&q=85' },
  alt: 'Office interior with retro computers',
};

const IMAGE_B = {
  asset: { url: 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&q=85&rect=0,1000,6000,3500' },
  alt: 'Close-up of computing setup',
};

const TAGS_SHORT = [
  { title: 'Content Strategy', slug: { current: 'content-strategy' } },
  { title: 'Sanity',           slug: { current: 'sanity' } },
];

const TAGS_LONG = [
  { title: 'Design Systems',   slug: { current: 'design-systems' } },
  { title: 'Design Tokens',    slug: { current: 'design-tokens' } },
  { title: 'process insight',  slug: { current: 'process-insight' } },
];

const TOOLS_ROW = [
  { title: 'Claude Code', slug: { current: 'claude-code' } },
  { title: 'Sanity',      slug: { current: 'sanity' } },
];

const CITATION_EXTERNAL = [
  {
    _key: 'cit-1',
    index: 1,
    text: 'Source:',
    link: { type: 'external', externalUrl: 'https://docs.anthropic.com' },
    linkLabel: 'Anthropic Documentation',
  },
];

// ─── Grid — minimal ────────────────────────────────────────

/** Two-column grid: title + body only. No eyebrow, tags, tools, or image. */
export const GridMinimal: Story = {
  name: 'Grid · Minimal',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-gmin',
      layout: 'grid',
      cards: [
        {
          _key: 'card-1',
          title: 'Fractional Product Leadership',
          body: simpleParagraph,
        },
        {
          _key: 'card-2',
          title: 'Platform Architecture & Migration',
          body: simpleParagraph,
        },
      ],
    },
  },
};

// ─── Grid — all options ────────────────────────────────────

/** Two-column grid: eyebrow, title, subtitle, body w/ citation, tags, tools, and a linked title. */
export const GridFull: Story = {
  name: 'Grid · Full Options',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-gfull',
      layout: 'grid',
      heading: 'Card Builder',
      cards: [
        {
          _key: 'card-1',
          eyebrow: 'EYEBROW',
          title: 'Card Heading',
          subtitle: 'Subtitle',
          titleLink: {
            type: 'external',
            externalUrl: 'https://www.sanity.io/docs/content-modelling',
          },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: TAGS_LONG,
        },
        {
          _key: 'card-2',
          eyebrow: 'EYEBROW',
          title: 'Card Heading 2',
          subtitle: 'Subtitle',
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: [{ title: 'Post Mortem', slug: { current: 'post-mortem' } }],
          tools: TOOLS_ROW,
        },
      ],
    },
  },
};

// ─── List — minimal ────────────────────────────────────────

/** Numbered list layout: title + body only. No extras. */
export const ListMinimal: Story = {
  name: 'List · Minimal',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-lmin',
      layout: 'list',
      cards: [
        {
          _key: 'card-1',
          title: 'Fractional Product Leadership',
          body: simpleParagraph,
        },
        {
          _key: 'card-2',
          title: 'Platform Architecture & Migration',
          body: simpleParagraph,
        },
        {
          _key: 'card-3',
          title: 'Content Modelling & Governance',
          body: simpleParagraph,
        },
      ],
    },
  },
};

// ─── List — all options ────────────────────────────────────

/** List layout with full card data: eyebrow, title, subtitle, body, tags, tools, citations, and a linked title. */
export const ListFull: Story = {
  name: 'List · Full Options',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-lfull',
      layout: 'list',
      cards: [
        {
          _key: 'card-1',
          eyebrow: 'CASE STUDIES',
          title: 'Selected Work',
          subtitle: 'CMS migrations, design systems, and the product strategy that connects them.',
          titleLink: {
            type: 'external',
            externalUrl: 'https://sugartown.io/case-studies',
          },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: [
            { title: 'customer journey', slug: { current: 'customer-journey' } },
            { title: 'accessibility',    slug: { current: 'accessibility' } },
            { title: 'process insight',  slug: { current: 'process-insight' } },
          ],
        },
        {
          _key: 'card-2',
          eyebrow: 'PLATFORM',
          title: 'This site ships versions.',
          subtitle: 'How this site is actually built.',
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: TAGS_SHORT,
          tools: TOOLS_ROW,
        },
        {
          _key: 'card-3',
          eyebrow: 'SERVICES',
          title: "Let's work together",
          body: simpleParagraph,
          tags: [
            { title: 'platform strategy',    slug: { current: 'platform-strategy' } },
            { title: 'content architecture', slug: { current: 'content-architecture' } },
          ],
        },
      ],
    },
  },
};

// ─── Grid — with images ────────────────────────────────────

/** Two-column grid: image with duotone overlay, plus body and tags. */
export const GridImages: Story = {
  name: 'Grid · With Images',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-gimg',
      layout: 'grid',
      heading: 'Card Builder',
      cards: [
        {
          _key: 'card-1',
          eyebrow: 'EYEBROW',
          title: 'Card Heading',
          subtitle: 'Subtitle',
          image: IMAGE_A,
          overlay: { type: 'duotone-standard' },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: TAGS_LONG,
        },
        {
          _key: 'card-2',
          eyebrow: 'EYEBROW',
          title: 'Card Heading 2',
          subtitle: 'Subtitle',
          image: IMAGE_B,
          overlay: { type: 'duotone-featured' },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: [{ title: 'Post Mortem', slug: { current: 'post-mortem' } }],
          tools: TOOLS_ROW,
        },
      ],
    },
  },
};

// ─── List — with images ────────────────────────────────────

/** List layout: image + duotone overlay per item, with body and tags. */
export const ListImages: Story = {
  name: 'List · With Images',
  args: {
    section: {
      _type: 'cardBuilderSection',
      _key: 'cbs-limg',
      layout: 'list',
      cards: [
        {
          _key: 'card-1',
          eyebrow: 'CASE STUDIES',
          title: 'Selected Work',
          subtitle: 'CMS migrations, design systems, and the product strategy that connects them.',
          image: IMAGE_A,
          overlay: { type: 'duotone-standard' },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: [
            { title: 'customer journey', slug: { current: 'customer-journey' } },
            { title: 'accessibility',    slug: { current: 'accessibility' } },
          ],
        },
        {
          _key: 'card-2',
          eyebrow: 'PLATFORM',
          title: 'This site ships versions.',
          subtitle: 'How this site is actually built.',
          image: IMAGE_B,
          overlay: { type: 'duotone-featured' },
          body: bodyWithCitation,
          citations: CITATION_EXTERNAL,
          tags: TAGS_SHORT,
          tools: TOOLS_ROW,
        },
      ],
    },
  },
};

// ─── Legacy stories (kept for reference) ───────────────────

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
