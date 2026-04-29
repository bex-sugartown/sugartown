import { defineType, defineField } from 'sanity'
import { BarChartIcon } from '@sanity/icons'

/**
 * Trust Report Section — SUG-87
 *
 * Section-builder-insertable block that renders one of two trust data report variants.
 * Data is build-time dynamic from stats.json — no authored content needed.
 * Editors only pick which report to show.
 *
 * Variants:
 *   recent-releases   — release history table via DataTable + KindBadge
 *   design-system-stats — DS health tiles via StatTile grid
 */
export default defineType({
  name: 'trustReportSection',
  title: 'Trust Report',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading rendered above the report (h2). Leave blank for no heading.',
    }),
    defineField({
      name: 'reportType',
      title: 'Report type',
      type: 'string',
      options: {
        list: [
          { title: 'Recent releases — release history table', value: 'recent-releases' },
          { title: 'Design system stats — token + component health', value: 'design-system-stats' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Select a report type'),
      initialValue: 'recent-releases',
    }),
  ],
  preview: {
    select: { heading: 'heading', reportType: 'reportType' },
    prepare({ heading, reportType }) {
      const labels: Record<string, string> = {
        'recent-releases':     'Recent releases',
        'design-system-stats': 'Design system stats',
      }
      return {
        title: heading || (labels[reportType] ?? 'Trust Report'),
        subtitle: 'Data from stats.json — no authored content',
      }
    },
  },
})
