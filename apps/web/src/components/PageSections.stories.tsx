import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';
import { simpleParagraph, richContent } from './__fixtures__/portableText';

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

/** Text section with heading — optional section label above RichText prose. */
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

/** Text section without heading — content only, no label. */
export const TextSectionContentOnly: Story = {
  args: {
    sections: [
      {
        _type: 'textSection',
        _key: 'ts-2',
        content: simpleParagraph,
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
        body: simpleParagraph,
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

/** Stat card section — metric grid with bg-through-gap hairline dividers. */
export const StatCardSection: Story = {
  args: {
    sections: [
      {
        _type: 'cardSection',
        _key: 'sts-1',
        label: 'Outcomes',
        items: [
          { _key: 'i1', metric: 'Accessibility score', valueAfter: '98', valueBefore: '71', evidenceType: 'Measured' },
          { _key: 'i2', metric: 'Page weight', valueAfter: '−42%', evidenceType: 'Measured' },
          { _key: 'i3', metric: 'Deploy time', valueAfter: '4 min', valueBefore: '18 min', evidenceType: 'Observed' },
          { _key: 'i4', metric: 'Lighthouse score', valueAfter: '100', valueBefore: '84', evidenceType: 'Measured' },
        ],
      },
    ],
    context: 'detail',
  },
};

/** CWV field metrics — p75 values as a stat tile section inside PageSections. */
export const CwvFieldMetrics: Story = {
  name: 'CWV field metrics (via StatCardSection)',
  args: {
    sections: [
      {
        _type: 'cardSection',
        _key: 'sts-cwv',
        name: 'Core Web Vitals',
        kicker: 'p75 · field data · desktop',
        items: [
          { _key: 'lcp', metric: 'LCP',  valueAfter: '1.9s',  valueBefore: 'Good threshold: < 2.5s',  evidenceType: 'measurement' },
          { _key: 'cls', metric: 'CLS',  valueAfter: '0.040', valueBefore: 'Good threshold: < 0.1',   evidenceType: 'measurement' },
          { _key: 'inp', metric: 'INP',  valueAfter: '160ms', valueBefore: 'Good threshold: < 200ms', evidenceType: 'measurement' },
        ],
      },
    ],
    context: 'detail',
  },
};

/** Multiple sections — demonstrates vertical rhythm across all section types. */
export const MermaidSection: Story = {
  parameters: { chromatic: { disableSnapshot: false, delay: 2000 } },
  args: {
    sections: [{ _type: 'mermaidSection', _key: 'md-1', code: 'flowchart LR\n  A[Token] --> B[Component]\n  B --> C[Page]' }],
    context: 'detail',
  },
};

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
        _type: 'cardSection',
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
