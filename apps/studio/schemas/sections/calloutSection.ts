import {defineType, defineField} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons'

/**
 * calloutSection — section builder block for highlighted callouts.
 *
 * Renders via the DS Callout component. Five variants:
 *   default (pink/Heart), info (muted/Info), tip (seafoam/Lightbulb),
 *   warn (amber/AlertTriangle), danger (red/AlertOctagon).
 *
 * Body is plain text (multiline string). Rich text body is a future
 * enhancement requiring nested PortableText config.
 *
 * EPIC-0164: Callout Section Type
 */
export default defineType({
  name: 'calloutSection',
  title: 'Callout Section',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          {title: 'Default (pink)', value: 'default'},
          {title: 'Info', value: 'info'},
          {title: 'Tip', value: 'tip'},
          {title: 'Warning', value: 'warn'},
          {title: 'Danger', value: 'danger'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional bold title above the callout body.',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      description: 'The callout content. Plain text; line breaks are preserved.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      variant: 'variant',
      body: 'body',
    },
    prepare({title, variant, body}) {
      const VARIANT_LABELS: Record<string, string> = {
        default: 'Default',
        info: 'Info',
        tip: 'Tip',
        warn: 'Warning',
        danger: 'Danger',
      }
      return {
        title: title || 'Callout',
        subtitle: `${VARIANT_LABELS[variant] ?? variant ?? 'Default'}${body ? ` — ${body.slice(0, 60)}` : ''}`,
      }
    },
  },
})
