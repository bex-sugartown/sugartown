import { defineType, defineField } from 'sanity'
import { InlineElementIcon } from '@sanity/icons'

/**
 * Recent Content Section — SUG-76 / SUG-99
 *
 * Renders a 3-column SectionContainer showing the latest release, article, and node.
 * Data is sourced at runtime (article, node) and build time (release from stats.json).
 * SectionLabel above the container takes: number, name, title, kicker.
 */
export default defineType({
  name: 'recentContentSection',
  title: 'Recent Content Ticker',
  type: 'object',
  icon: InlineElementIcon,
  fields: [
    defineField({
      name: 'number',
      title: 'Section Number',
      type: 'string',
      description: 'Optional folio number shown on the left, e.g. § 04',
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'name',
      title: 'Section Name',
      type: 'string',
      description: 'Short mono-caps label shown in the section header. Leave blank to use "Recently shipped".',
      placeholder: 'Recently shipped',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional Cormorant centre title',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Optional right-aligned note',
      validation: (Rule) => Rule.max(80),
    }),
  ],
  preview: {
    select: { name: 'name', number: 'number' },
    prepare({ name, number }) {
      const label = [number, name].filter(Boolean).join(' · ')
      return {
        title: label || 'Recent Content Ticker',
        subtitle: 'Latest release · article · node',
      }
    },
  },
})
