import { defineType, defineField } from 'sanity'
import { InlineElementIcon } from '@sanity/icons'

/**
 * Recent Content Section — SUG-76
 *
 * Renders a flush 3-column ticker showing the latest release, article, and node.
 * Data is sourced at runtime (article, node) and build time (release from stats.json).
 * No content authoring needed — data is always auto-derived from latest published docs.
 *
 * Phase 2: `contentTypes` field will allow editors to select which content types appear.
 */
export default defineType({
  name: 'recentContentSection',
  title: 'Recent Content Ticker',
  type: 'object',
  icon: InlineElementIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Displayed above the ticker. Leave blank to hide the heading.',
      placeholder: 'Recently shipped',
    }),
    // Phase 2: content type selector
    // defineField({
    //   name: 'contentTypes',
    //   title: 'Content types to show',
    //   type: 'array',
    //   of: [{ type: 'string', options: { list: ['release', 'article', 'node', 'caseStudy'] } }],
    //   description: 'Which content types appear as columns. Defaults to release + article + node.',
    //   initialValue: ['release', 'article', 'node'],
    // }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return {
        title: heading || 'Recent Content Ticker',
        subtitle: 'Latest release · article · node',
      }
    },
  },
})
