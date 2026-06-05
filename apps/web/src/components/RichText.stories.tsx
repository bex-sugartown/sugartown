/**
 * ## RichText
 *
 * Canonical PortableText prose renderer. Covers all text block types:
 * headings (H2–H4), normal paragraphs, blockquote, bold, italic, inline
 * code, links, unordered and ordered lists.
 *
 * Does NOT render images, tables, or citations — those are handled by
 * separate section-level renderers in PageSections.
 *
 * Replaces ContentBlock (deprecated). Used internally by TextSection.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react'
import RichText from './RichText'
import {
  allTextOptions,
  simpleParagraph,
  richContent,
  contentWithLink,
} from './__fixtures__/portableText'

const meta: Meta<typeof RichText> = {
  title: 'Patterns/RichText',
  component: RichText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    chromatic: { disableSnapshot: false },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RichText>

/** All text block types — H2, H3, H4, normal, bold, italic, inline code, link, blockquote, ordered list, unordered list. */
export const AllTextOptions: Story = {
  name: 'All text options',
  args: { content: allTextOptions },
}

/** Simple paragraph with inline code. */
export const SimpleParagraph: Story = {
  args: { content: simpleParagraph },
}

/** Multiple paragraphs with H2 and H3 headings. */
export const WithHeadings: Story = {
  args: { content: richContent },
}

/** Paragraph with an inline external link. */
export const WithLink: Story = {
  args: { content: contentWithLink },
}

/** Empty content — renders nothing. */
export const Empty: Story = {
  args: { content: [] },
}
