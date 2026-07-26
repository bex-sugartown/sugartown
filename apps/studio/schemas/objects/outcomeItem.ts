import {defineType, defineField} from 'sanity'

/**
 * outcomeItem — shared atomic stat object.
 *
 * Used in one place: cardSection.items[] (section builder block, editorial
 * placement) — cardSection is registered in sections[] on page, article,
 * caseStudy, and node.
 *
 * Renders via the same StatCard + Grid primitives in the DS. Field names are
 * the canonical mapping contract for that component:
 *   metric          → StatCard label
 *   valueAfter      → StatCard value (large display)
 *   valueBefore     → StatCard sub ("Was:" label — SUG-96)
 *   impactStatement → StatCard body (visible, below the value — SUG-248)
 *   evidenceType    → StatCard foot (footer, bottom-aligned — last field, SUG-192)
 *
 * SUG-94: extracted from inline outcome object on caseStudy
 * SUG-151: statTileSection renamed to cardSection; usage consolidated to
 *   cardSection.items[] only. This comment previously referenced a
 *   caseStudy.outcomes[] field and a proofPointSection type — neither exists
 *   in the current schema (SUG-248).
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
      description: 'What was measured (e.g. "Analyst prep time", "Conversion rate", max. 100 characters)',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'valueAfter',
      title: 'Value',
      type: 'string',
      description: 'The result — keep stat-length: "+40%", "4 months", "Zero rework" (not a sentence, max. 60 characters)',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'valueBefore',
      title: 'Value Before',
      type: 'string',
      description: 'State before the engagement — short contrast phrase (e.g. "14 manual steps"). Renders as "Was:" label. (max. 100 characters)',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'impactStatement',
      title: 'Impact Statement',
      type: 'text',
      description: 'Plain-language sentence explaining what changed for the client. Renders visibly on the tile below the value (max. 400 characters)',
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
