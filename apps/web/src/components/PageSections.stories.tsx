import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';
import { simpleParagraph, richContent } from './__fixtures__/portableText';

const meta: Meta<typeof PageSections> = {
  title: 'Layout/PageSections',
  component: PageSections,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

/** Text section — simple PortableText content block. */
export const TextSection: Story = {
  args: {
    sections: [
      {
        _type: 'textSection',
        _key: 'ts-1',
        heading: 'About Our Approach',
        content: richContent,
      },
    ],
    context: 'detail',
  },
};

/** CTA section — heading with a call-to-action button. */
export const CtaSection: Story = {
  args: {
    sections: [
      {
        _type: 'ctaSection',
        _key: 'cta-1',
        heading: 'Ready to get started?',
        body: simpleParagraph,
        cta: {
          text: 'Get in touch',
          link: { type: 'external', externalUrl: '/contact' },
        },
      },
    ],
    context: 'detail',
  },
};

/** Callout section — styled callout block. */
export const CalloutSection: Story = {
  args: {
    sections: [
      {
        _type: 'calloutSection',
        _key: 'co-1',
        variant: 'info',
        title: 'A note on content strategy',
        body: simpleParagraph,
      },
    ],
    context: 'detail',
  },
};

/** Accordion section — collapsible FAQ-style items. */
export const AccordionSection: Story = {
  args: {
    sections: [
      {
        _type: 'accordionSection',
        _key: 'acc-1',
        heading: 'Frequently Asked Questions',
        items: [
          { _key: 'faq-1', title: 'What is a headless CMS?', content: simpleParagraph },
          { _key: 'faq-2', title: 'How does structured content differ from HTML?', content: simpleParagraph },
          { _key: 'faq-3', title: 'What are design tokens?', content: simpleParagraph },
        ],
      },
    ],
    context: 'detail',
  },
};

/** Cited block — headed section with body prose and optional further reading. */
export const CitedBlock: Story = {
  args: {
    sections: [
      {
        _type: 'citedBlock',
        _key: 'cb-1',
        heading: 'Why Token-Driven Systems Scale',
        body: richContent,
        references: [
          { _id: 'ref-1', _type: 'article', title: 'Design Token Architecture', slug: 'design-token-architecture' },
          { _id: 'ref-2', _type: 'node', title: 'The Validator Said Zero Errors', slug: 'validator-zero-errors' },
        ],
      },
    ],
    context: 'detail',
  },
};

/** Cited block with no references — further reading section hidden. */
export const CitedBlockNoRefs: Story = {
  args: {
    sections: [
      {
        _type: 'citedBlock',
        _key: 'cb-2',
        heading: 'Content Graph Fundamentals',
        body: simpleParagraph,
      },
    ],
    context: 'detail',
  },
};

/** Stat tile section — metric grid with bg-through-gap hairline dividers. */
export const StatTileSection: Story = {
  args: {
    sections: [
      {
        _type: 'statTileSection',
        _key: 'sts-1',
        label: 'Outcomes',
        items: [
          { _key: 'i1', metric: 'Accessibility score', valueAfter: '98', valueBefore: '71', evidenceType: 'Measured' },
          { _key: 'i2', metric: 'Page weight', valueAfter: '−42%', evidenceType: 'Measured' },
          { _key: 'i3', metric: 'Deploy time', valueAfter: '4 min', valueBefore: '18 min', evidenceType: 'Observed' },
        ],
      },
    ],
    context: 'detail',
  },
};

/** Multiple sections — demonstrates vertical rhythm across all section types. */
export const MultipleSections: Story = {
  args: {
    sections: [
      {
        _type: 'textSection',
        _key: 'ts-1',
        heading: 'Our Philosophy',
        content: richContent,
      },
      {
        _type: 'calloutSection',
        _key: 'co-1',
        variant: 'tip',
        title: 'Pro tip',
        body: simpleParagraph,
      },
      {
        _type: 'citedBlock',
        _key: 'cb-1',
        heading: 'Why Structured Content Scales',
        body: simpleParagraph,
        references: [
          { _id: 'ref-1', _type: 'article', title: 'Content Modelling Fundamentals', slug: 'content-modelling' },
        ],
      },
      {
        _type: 'statTileSection',
        _key: 'sts-1',
        label: 'Key Results',
        items: [
          { _key: 'i1', metric: 'Time to publish', valueAfter: '12 min', valueBefore: '3 hrs', evidenceType: 'Measured' },
          { _key: 'i2', metric: 'Content reuse', valueAfter: '×4', evidenceType: 'Estimated' },
        ],
      },
      {
        _type: 'accordionSection',
        _key: 'acc-1',
        heading: 'Common Questions',
        items: [
          { _key: 'faq-1', title: 'How do I get started?', content: simpleParagraph },
          { _key: 'faq-2', title: 'What tools do you use?', content: simpleParagraph },
        ],
      },
    ],
    context: 'detail',
  },
};
