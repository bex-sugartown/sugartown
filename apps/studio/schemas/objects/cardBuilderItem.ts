import {defineType, defineField, defineArrayMember} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'
import {summaryPortableText} from './portableTextConfig'

/**
 * Card Builder Item — EPIC-0160
 *
 * Composable card object for editor-assembled card grids.
 * Replaces the minimal editorialCard with a full-featured card model:
 * title link (internal/external), image effects, eyebrow, subtitle,
 * rich body, citation footer, and tag chips.
 *
 * Rendered via the DS Card → Web Card adapter pipeline.
 */
export default defineType({
  name: 'cardBuilderItem',
  title: 'Card',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    // ── Core ────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Card heading — required',
      validation: (Rule) => Rule.required().max(100)
    }),
    defineField({
      name: 'titleLink',
      title: 'Title Link',
      type: 'object',
      description: 'Primary card link — drives the full-card click target',
      fields: [
        defineField({
          name: 'type',
          title: 'Link Type',
          type: 'string',
          options: {
            list: [
              {title: 'Internal page', value: 'internal'},
              {title: 'External URL', value: 'external'}
            ],
            layout: 'radio'
          },
          initialValue: 'internal'
        }),
        defineField({
          name: 'internalRef',
          title: 'Internal Page',
          type: 'reference',
          to: [
            {type: 'page'},
            {type: 'article'},
            {type: 'caseStudy'},
            {type: 'node'}
          ],
          hidden: ({parent}) => parent?.type !== 'internal'
        }),
        defineField({
          name: 'externalUrl',
          title: 'External URL',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL'),
          hidden: ({parent}) => parent?.type !== 'external'
        })
      ]
    }),

    // ── Media ────────────────────────────────────────────────────────
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility'
        })
      ]
    }),
    defineField({
      name: 'imageEffect',
      title: 'Image Effect',
      type: 'string',
      description: 'Visual treatment applied to the card image',
      options: {
        list: [
          {title: 'Original (no filter)', value: 'original'},
          {title: 'Greyscale', value: 'greyscale'},
          {title: 'Greyscale + Brand Overlay', value: 'greyscale-overlay'}
        ],
        layout: 'radio'
      },
      initialValue: 'greyscale-overlay'
    }),

    // ── Text ─────────────────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small label above the title (e.g. category, date)',
      validation: (Rule) => Rule.max(50)
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Supporting line below the title',
      validation: (Rule) => Rule.max(150)
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Card body text — styled text only, no images',
      of: summaryPortableText
    }),

    // ── Footer ───────────────────────────────────────────────────────
    defineField({
      name: 'citation',
      title: 'Citation',
      type: 'object',
      description: 'Footnote citation displayed in the card footer',
      fields: [
        defineField({
          name: 'text',
          title: 'Citation Text',
          type: 'string',
          description: 'Source attribution or footnote text'
        }),
        defineField({
          name: 'url',
          title: 'Citation URL',
          type: 'url',
          description: 'Optional link to the source',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']})
        }),
        defineField({
          name: 'label',
          title: 'Link Label',
          type: 'string',
          description: 'Accessible label for the citation link (defaults to citation text)',
          validation: (Rule) => Rule.max(100)
        })
      ]
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Tag chips displayed at the bottom of the card',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      media: 'image'
    },
    prepare({title, eyebrow, media}) {
      return {
        title: title || 'Untitled Card',
        subtitle: eyebrow || '',
        media
      }
    }
  }
})
