import {defineType, defineField, defineArrayMember} from 'sanity'
import {BarChartIcon} from '@sanity/icons'

/**
 * statTileSection — mid-content stat/evidence cluster.
 *
 * Section builder block for 1–4 outcome/metric tiles (outcomeItem) in a grid.
 * Renders via the Tile + Grid primitives in the DS (see SUG-96 for implementation).
 *
 * Uses outcomeItem as the item type — the same object used by caseStudy outcomes[].
 * Both surfaces share the same DS primitive; this is the editorial placement version.
 *
 * Available in: caseStudy, article, node sections[]
 *
 * SUG-94
 */
export default defineType({
  name: 'statTileSection',
  title: 'Stat Tiles',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Section Label',
      type: 'string',
      description: 'Optional label above the stat grid (e.g. "By the numbers", "Results at a glance")',
      validation: (Rule) => Rule.max(60),
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
      label: 'label',
      items: 'items',
    },
    prepare({label, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: label || 'Stat Tiles',
        subtitle: `${count} stat${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
