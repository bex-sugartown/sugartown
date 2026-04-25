import type { Meta, StoryObj } from '@storybook/react';
import EditorialCard from './EditorialCard';

const meta: Meta<typeof EditorialCard> = {
  title: 'Legacy/EditorialCard',
  component: EditorialCard,
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
type Story = StoryObj<typeof EditorialCard>;

/** Card with title, description, and link. No image. */
export const TextOnly: Story = {
  args: {
    card: {
      title: 'Content Strategy for Headless CMS',
      description:
        'A structured approach to planning content types, taxonomies, and editorial workflows before writing a single schema.',
      link: { label: 'Read more', url: '/articles/content-strategy' },
    },
  },
};

/** Card with a placeholder image. */
export const WithImage: Story = {
  args: {
    card: {
      title: 'Token-Driven Design Systems',
      description:
        'How design tokens create a single source of truth for colour, spacing, and typography across web and native platforms.',
      image: {
        asset: null, // no Sanity asset in stories
        alt: 'Design system tokens diagram',
      },
      link: {
        label: 'View case study',
        url: '/case-studies/design-tokens',
        openInNewTab: false,
      },
    },
  },
};

/** Card with no link — renders as a static div. */
export const NoLink: Story = {
  args: {
    card: {
      title: 'Agentic Workflows in Practice',
      description:
        'Exploring how AI agents orchestrate multi-step tasks through structured prompts and tool use.',
    },
  },
};
