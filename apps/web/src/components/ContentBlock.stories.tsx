import type { Meta, StoryObj } from '@storybook/react';
import ContentBlock from './ContentBlock';
import { simpleParagraph, richContent, contentWithLink } from './__fixtures__/portableText';

const meta: Meta<typeof ContentBlock> = {
  title: 'Patterns/ContentBlock',
  component: ContentBlock,
};

export default meta;
type Story = StoryObj<typeof ContentBlock>;

/** Simple paragraph with inline code. */
export const SimpleParagraph: Story = {
  args: {
    content: simpleParagraph,
  },
};

/** Rich content — headings, bold, multiple paragraphs. */
export const RichContent: Story = {
  args: {
    content: richContent,
  },
};

/** Content with an inline link. */
export const WithLink: Story = {
  args: {
    content: contentWithLink,
  },
};

/** Empty content — renders nothing. */
export const Empty: Story = {
  args: {
    content: [],
  },
};
