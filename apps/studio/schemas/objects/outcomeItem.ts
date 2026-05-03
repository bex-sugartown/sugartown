import {defineType, defineField} from 'sanity'

/**
 * outcomeItem — shared atomic stat object.
 *
 * Used in two places:
 *   - outcomes[] on caseStudy (document-level, fixed render position)
 *   - proofPointSection items[] (section builder block, editorial placement)
 *
 * Both surfaces render via the same StatTile + StatGrid primitives in the DS.
 * Field names are the canonical mapping contract for those components:
 *   metric      → StatTile label
 *   valueAfter  → StatTile value (large display)
 *   valueBefore → StatTile sub ("Was:" label — SUG-96)
 *   evidenceType → StatTile chip
 *
 * SUG-94: extracted from inline outcome object on caseStudy
 */
export default defineType({
  name: 'outcomeItem',
  title: 'Outcome / Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'metric',
      title: 'Metric',
      type: 'string',
      description: 'What was measured (e.g. "Analyst prep time", "Conversion rate")',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'valueAfter',
      title: 'Value',
      type: 'string',
      description: 'The result — keep stat-length: "+40%", "4 months", "Zero rework" (not a sentence)',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'valueBefore',
      title: 'Value Before',
      type: 'string',
      description: 'State before the engagement — short contrast phrase (e.g. "14 manual steps"). Renders as "Was:" label.',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'impactStatement',
      title: 'Impact Statement',
      type: 'text',
      description: 'Plain-language sentence explaining what changed for the client. Not shown on the tile — used for tooltips and retrieval.',
      rows: 2,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'evidenceType',
      title: 'Evidence Type',
      type: 'string',
      description: 'How solid is this number?',
      options: {
        list: [
          {title: 'Measured', value: 'measured'},
          {title: 'Estimated', value: 'estimated'},
          {title: 'Qualitative', value: 'qualitative'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      metric: 'metric',
      valueAfter: 'valueAfter',
      evidenceType: 'evidenceType',
    },
    prepare({metric, valueAfter, evidenceType}) {
      return {
        title: valueAfter ? `${valueAfter} — ${metric}` : metric || 'Untitled stat',
        subtitle: evidenceType ?? '',
      }
    },
  },
})
