import {defineType, defineField, defineArrayMember} from 'sanity'
import {BarChartIcon} from '@sanity/icons'

/**
 * proofPointSection — stat/evidence cluster section type.
 *
 * Section builder block for showing 1–4 evidence stats in a grid mid-content.
 * Uses outcomeItem as the item type — the same object used in caseStudy outcomes[].
 * Both surfaces render via the same StatTile + StatGrid primitives in the DS.
 *
 * Contrast with outcomes[] on caseStudy:
 *   outcomes[]         = document-level, fixed position, the canonical project result record
 *   proofPointSection  = section builder block, editorial placement, any doc type
 *
 * Available in: caseStudy, article, node sections[]
 *
 * SUG-94
 */
export default defineType({
  name: 'proofPointSection',
  title: 'Proof Points',
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
        title: label || 'Proof Points',
        subtitle: `${count} stat${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
