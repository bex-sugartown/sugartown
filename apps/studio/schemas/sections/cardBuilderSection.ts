import {defineType, defineField, defineArrayMember} from 'sanity'
import {InlineIcon} from '@sanity/icons'

/**
 * Card Builder Section — EPIC-0160
 *
 * Page section that renders an editor-assembled grid (or list) of cards.
 * Each card is a `cardBuilderItem` object — fully composable with title link,
 * image effects, body text, citation, and tag chips.
 *
 * Replaces ad-hoc editorial card usage with a structured section type
 * backed by the DS Card → Web Card adapter pipeline.
 */
export default defineType({
  name: 'cardBuilderSection',
  title: 'Card Builder Section',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading displayed above the card grid',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      description: 'How cards are arranged',
      options: {
        list: [
          {title: 'Grid', value: 'grid'},
          {title: 'List', value: 'list'}
        ],
        layout: 'radio'
      },
      initialValue: 'grid'
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      description: 'Add one or more cards to this section',
      of: [
        defineArrayMember({type: 'cardBuilderItem'})
      ],
      validation: (Rule) =>
        Rule.min(1).error('Add at least one card to this section')
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      cards: 'cards'
    },
    prepare({heading, cards}) {
      const count = cards?.length ?? 0
      return {
        title: heading || 'Card Builder Section',
        subtitle: `${count} card${count === 1 ? '' : 's'}`
      }
    }
  }
})
