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
          link: {
            type: 'external',
            externalUrl: '/contact',
          },
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
        content: simpleParagraph,
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
          {
            _key: 'faq-1',
            title: 'What is a headless CMS?',
            content: simpleParagraph,
          },
          {
            _key: 'faq-2',
            title: 'How does structured content differ from HTML?',
            content: simpleParagraph,
          },
          {
            _key: 'faq-3',
            title: 'What are design tokens?',
            content: simpleParagraph,
          },
        ],
      },
    ],
    context: 'detail',
  },
};

/** Multiple sections — demonstrates vertical rhythm between section types. */
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
        content: simpleParagraph,
      },
      {
        _type: 'accordionSection',
        _key: 'acc-1',
        heading: 'Common Questions',
        items: [
          {
            _key: 'faq-1',
            title: 'How do I get started?',
            content: simpleParagraph,
          },
          {
            _key: 'faq-2',
            title: 'What tools do you use?',
            content: simpleParagraph,
          },
        ],
      },
    ],
    context: 'detail',
  },
};
