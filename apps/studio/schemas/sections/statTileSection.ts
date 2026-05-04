import {defineType, defineField, defineArrayMember} from 'sanity'
import {BarChartIcon} from '@sanity/icons'

/**
 * statTileSection — mid-content stat/evidence cluster.
 *
 * Section builder block for 1–4 outcome/metric tiles (outcomeItem) in a grid.
 * Renders via Tile + SectionContainer primitives (SUG-96 / SUG-99).
 * SectionLabel above the container takes: number, name, title, kicker.
 *
 * Available in: caseStudy, article, node sections[]
 *
 * SUG-94 / SUG-99
 */
export default defineType({
  name: 'statTileSection',
  title: 'Stat Tiles',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'number',
      title: 'Section Number',
      type: 'string',
      description: 'Optional folio number shown on the left, e.g. § 03',
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'name',
      title: 'Section Name',
      type: 'string',
      description: 'Short mono-caps label, e.g. "Outcomes" or "By the numbers"',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional Cormorant centre title, e.g. "What changed for the client"',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Optional right-aligned note, e.g. "Measured 90 days post-launch"',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      description: '1–4 stat tiles. Each uses the same fields as Outcomes: metric name, value, optional before/context, evidence type.',
      of: [defineArrayMember({type: 'outcomeItem'})],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      number: 'number',
      items: 'items',
    },
    prepare({name, number, items}) {
      const count = Array.isArray(items) ? items.length : 0
      const label = [number, name].filter(Boolean).join(' · ') || 'Stat Tiles'
      return {
        title: label,
        subtitle: `${count} stat${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
