import { defineType, defineField, defineArrayMember } from 'sanity'
import { BarChartIcon } from '@sanity/icons'

/**
 * Trust Report Section — SUG-87 (initial), SUG-100 (dashboard refactor)
 *
 * Section-builder-insertable trust dashboard. Editors pick 1–3 report blocks;
 * each renders with its own SectionLabel header in array order.
 *
 * Reports:
 *   recent-releases     — MINOR/MAJOR release history table via DataTable + KindBadge
 *   mini-releases       — PATCH release history table (SUG-136)
 *   recently-shipped    — 3-col Tile grid: release / article / node (SUG-136)
 *   design-system-stats — DS health tiles via StatTile grid
 *   cwv-snapshot        — Lighthouse score rings + CrUX CWV tiles (SUG-100)
 */
export default defineType({
  name: 'trustReportSection',
  title: 'Trust Reports',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'Optional heading above all reports (h2). Leave blank for no heading.',
    }),
    defineField({
      name: 'reports',
      title: 'Reports',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Recent releases — release history table',       value: 'recent-releases' },
          { title: 'Mini-releases — PATCH release history',         value: 'mini-releases' },
          { title: 'Recently shipped — release / article / node tiles', value: 'recently-shipped' },
          { title: 'Design system stats — token + component health', value: 'design-system-stats' },
          { title: 'CWV snapshot — Lighthouse + Chrome UX Report',  value: 'cwv-snapshot' },
        ],
        layout: 'grid',
      },
      description: 'Select 1–5 reports. Each renders with its own label header, in display order.',
      validation: (Rule) => Rule.required().min(1).max(5).error('Select 1–5 reports'),
    }),
    defineField({
      name: 'defaultFormFactor',
      title: 'Default form factor',
      type: 'string',
      options: {
        list: [
          { title: 'Mobile (default)', value: 'mobile' },
          { title: 'Desktop',          value: 'desktop' },
        ],
        layout: 'radio',
      },
      initialValue: 'mobile',
      hidden: ({ parent }) => !parent?.reports?.includes('cwv-snapshot'),
      description: 'Initial state of the Mobile / Desktop toggle on page load.',
    }),
    defineField({
      name: 'cwvUrl',
      title: 'CWV URL (optional)',
      type: 'string',
      hidden: ({ parent }) => !parent?.reports?.includes('cwv-snapshot'),
      description: 'Specific URL to query CrUX for (e.g. https://sugartown.io/product). Falls back to origin-level data if blank or if the URL has insufficient traffic.',
      validation: (Rule) =>
        Rule.custom((val) => {
          if (!val) return true
          return /^https:\/\/.+/.test(val) ? true : 'Must be a full HTTPS URL'
        }),
    }),
    // Legacy field — hidden in Studio; migration maps reportType → reports: [reportType]
    defineField({
      name: 'reportType',
      title: 'Report type (legacy)',
      type: 'string',
      hidden: () => true,
    }),
  ],
  preview: {
    select: { heading: 'heading', reports: 'reports', reportType: 'reportType' },
    prepare({ heading, reports, reportType }: { heading?: string; reports?: string[]; reportType?: string }) {
      const labels: Record<string, string> = {
        'recent-releases':     'Recent releases',
        'mini-releases':       'Mini-releases',
        'recently-shipped':    'Recently shipped',
        'design-system-stats': 'Design system stats',
        'cwv-snapshot':        'CWV snapshot',
      }
      const active: string[] = reports?.length ? reports : (reportType ? [reportType] : [])
      const subtitle = active.map(r => labels[r] ?? r).join(' · ') || 'No reports selected'
      return {
        title:    heading || subtitle,
        subtitle: 'Data from stats.json — no authored content',
      }
    },
  },
})
