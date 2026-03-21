import {defineType, defineField} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons'
import {summaryPortableText} from '../objects/portableTextConfig'

/**
 * calloutSection — section builder block for highlighted callouts.
 *
 * Renders via the DS Callout component. Five variants:
 *   default (pink/Heart), info (muted/Info), tip (seafoam/Lightbulb),
 *   warn (amber/AlertTriangle), danger (red/AlertOctagon).
 *
 * Body uses summaryPortableText (inline links, bold, italic — no headings,
 * no lists, no images). Upgraded from plain text in EPIC-0173.
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
      type: 'array',
      of: summaryPortableText,
      description: 'The callout content. Supports bold, italic, and inline links.',
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
      // Extract first text span from Portable Text body for preview
      const block = Array.isArray(body) ? body.find((b: any) => b._type === 'block') : null
      const previewText = block?.children?.[0]?.text ?? ''
      return {
        title: title || 'Callout',
        subtitle: `Callout · ${VARIANT_LABELS[variant] ?? variant ?? 'Default'}${previewText ? ` — ${previewText.slice(0, 60)}` : ''}`,
      }
    },
  },
})
