import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';
import { simpleParagraph, richContent, bodyWithCitation } from './__fixtures__/portableText';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/PageSections',
  component: PageSections,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
  parameters: {
    chromatic: { disableSnapshot: false },
  },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

// ─── Shared section fixtures — reused individually and in the combined Snapshot ──

/** Mirrors Regions/Hero's Default (full width) story — see Hero.stories.tsx buildSection(). */
const HERO_SECTION = {
  _type: 'heroSection',
  _key: 'hero-1',
  eyebrow: 'Platform',
  heading: 'Built as infrastructure.',
  subheading: 'A governed monorepo: versioned releases, enforced boundaries, a portable design system.',
  backgroundImage: {
    asset: { _id: 'image-hero-platform-mock' },
    hotspot: { x: 0.5, y: 0.4 },
    alt: 'Vercel Production and Preview deployments dashboard',
  },
  imageTreatment: { type: 'duotone-extreme', panel: true },
  imageWidth: 'full-width',
  showStatRail: false,
  showMetaFinePrint: true,
  _meta: { date: '2024-03-01' },
  ctas: [{ _key: 'cta-1', label: 'View the platform', url: '/platform', style: 'secondary', openInNewTab: false }],
};

const TEXT_SECTION = {
  _type: 'textSection',
  _key: 'ts-1',
  heading: 'About Our Approach',
  content: richContent,
};

/** Real render shape (post-GROQ): heading + description (plain text) + buttons[] {text, url, style, openInNewTab}. */
const CTA_SECTION = {
  _type: 'ctaSection',
  _key: 'cta-2',
  heading: 'Ready to get started?',
  description: "Let's talk about your next platform migration or design system build.",
  buttons: [
    { text: 'Get in touch', url: '/contact', style: 'primary', openInNewTab: false },
    { text: 'View case studies', url: '/case-studies', style: 'secondary', openInNewTab: false },
  ],
};

const CALLOUT_SECTION = {
  _type: 'calloutSection',
  _key: 'co-1',
  variant: 'info',
  title: 'A note on content strategy',
  body: simpleParagraph,
};

const ACCORDION_SECTION = {
  _type: 'accordionSection',
  _key: 'acc-1',
  heading: 'Frequently Asked Questions',
  items: [
    { _key: 'faq-1', title: 'What is a headless CMS?', content: simpleParagraph },
    { _key: 'faq-2', title: 'How does structured content differ from HTML?', content: simpleParagraph },
    { _key: 'faq-3', title: 'What are design tokens?', content: simpleParagraph },
  ],
};

const STAT_CARD_SECTION = {
  _type: 'cardSection',
  _key: 'sts-1',
  label: 'Outcomes',
  items: [
    { _key: 'i1', metric: 'Accessibility score', valueAfter: '98', valueBefore: '71', evidenceType: 'Measured' },
    { _key: 'i2', metric: 'Page weight', valueAfter: '−42%', evidenceType: 'Measured' },
    { _key: 'i3', metric: 'Deploy time', valueAfter: '4 min', valueBefore: '18 min', evidenceType: 'Observed' },
    { _key: 'i4', metric: 'Lighthouse score', valueAfter: '100', valueBefore: '84', evidenceType: 'Measured' },
  ],
};

const MERMAID_SECTION = {
  _type: 'mermaidSection',
  _key: 'md-1',
  code: 'flowchart LR\n  A[Token] --> B[Component]\n  B --> C[Page]',
};

/** Mirrors Patterns/CardBuilder's "Grid · Full Options" story. */
const CARD_BUILDER_SECTION = {
  _type: 'cardBuilderSection',
  _key: 'cbs-1',
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
      citations: [
        {
          _key: 'cit-1',
          index: 1,
          text: 'Source:',
          link: { type: 'external', externalUrl: 'https://docs.anthropic.com' },
          linkLabel: 'Anthropic Documentation',
        },
      ],
      tags: [
        { title: 'Design Systems', slug: { current: 'design-systems' } },
        { title: 'Design Tokens', slug: { current: 'design-tokens' } },
        { title: 'process insight', slug: { current: 'process-insight' } },
      ],
    },
    {
      _key: 'card-2',
      eyebrow: 'EYEBROW',
      title: 'Card Heading 2',
      subtitle: 'Subtitle',
      body: bodyWithCitation,
      citations: [
        {
          _key: 'cit-1',
          index: 1,
          text: 'Source:',
          link: { type: 'external', externalUrl: 'https://docs.anthropic.com' },
          linkLabel: 'Anthropic Documentation',
        },
      ],
      tags: [{ title: 'Post Mortem', slug: { current: 'post-mortem' } }],
      tools: [
        { title: 'Claude Code', slug: { current: 'claude-code' } },
        { title: 'Sanity', slug: { current: 'sanity' } },
      ],
    },
  ],
};

// ─── Stories — one per named section type ──────────────────────────────────

/** Hero section — full-width duotone treatment with stat rail off, mirrors Regions/Hero Default. */
export const HeroSectionStory: Story = {
  name: 'Hero Section',
  parameters: { layout: 'fullscreen' },
  args: {
    sections: [HERO_SECTION],
    context: 'full',
  },
};

/** Text section with heading — optional section label above RichText prose. */
export const TextSection: Story = {
  args: {
    sections: [TEXT_SECTION],
    context: 'detail',
  },
};

/** CTA section — heading, description, and a 2-button group (primary + secondary). */
export const CtaSection: Story = {
  args: {
    sections: [CTA_SECTION],
    context: 'detail',
  },
};

/** Callout section — styled callout block. */
export const CalloutSection: Story = {
  args: {
    sections: [CALLOUT_SECTION],
    context: 'detail',
  },
};

/** Accordion section — collapsible FAQ-style items. */
export const AccordionSection: Story = {
  args: {
    sections: [ACCORDION_SECTION],
    context: 'detail',
  },
};

/** Stat card section — metric grid with bg-through-gap hairline dividers. */
export const StatCardSection: Story = {
  args: {
    sections: [STAT_CARD_SECTION],
    context: 'detail',
  },
};

/** Mermaid section — flowchart diagram rendered client-side. */
export const MermaidSection: Story = {
  parameters: { chromatic: { disableSnapshot: false, delay: 2000 } },
  args: {
    sections: [MERMAID_SECTION],
    context: 'detail',
  },
};

/** Card Builder section — grid layout, full card options (eyebrow, subtitle, linked title, citation, tags, tools). */
export const CardBuilderSectionStory: Story = {
  name: 'Card Builder Section',
  args: {
    sections: [CARD_BUILDER_SECTION],
    context: 'detail',
  },
};

// ─── Snapshot — one of each section type, for Chromatic VRT ────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false, delay: 2000 }, layout: 'fullscreen' },
  args: {
    sections: [
      HERO_SECTION,
      TEXT_SECTION,
      CTA_SECTION,
      CALLOUT_SECTION,
      ACCORDION_SECTION,
      STAT_CARD_SECTION,
      MERMAID_SECTION,
      CARD_BUILDER_SECTION,
    ],
    context: 'full',
  },
};
