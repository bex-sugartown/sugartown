import {defineType, defineField, defineArrayMember} from 'sanity'
import {BlockContentIcon} from '@sanity/icons'

/**
 * Card Builder Item — EPIC-0160
 *
 * Composable card object for editor-assembled card grids.
 * Replaces the minimal editorialCard with a full-featured card model:
 * title link (internal/external), image effects, eyebrow, subtitle,
 * rich body, citation footer, and tag chips.
 *
 * titleLink uses the reusable `linkItem` object type — all link items
 * share the same reference list so adding a new linkable type (e.g.
 * archivePage) only needs one update.
 *
 * Body text supports a `citationRef` annotation for inline superscript
 * citation markers that link to the citation footnote.
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
      type: 'linkItem',
      description: 'Primary card link — drives the full-card click target'
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
      name: 'categoryPosition',
      title: 'Category Position',
      type: 'string',
      description: 'Controls whether the eyebrow/category label appears above or below the title.',
      options: {
        list: [
          {title: 'Before title (default)', value: 'before'},
          {title: 'After title', value: 'after'},
        ],
        layout: 'radio',
      },
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
      description: 'Card body text — styled text only, no images. Use Citation Reference to add superscript markers.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Underline', value: 'underline'}
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule: any) => Rule.required()
                      .uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                        allowRelative: true
                      })
                  }
                ]
              }),
              defineArrayMember({
                name: 'citationRef',
                type: 'object',
                title: 'Citation Reference',
                fields: [
                  {
                    name: 'index',
                    type: 'number',
                    title: 'Citation Number',
                    description: 'The footnote number (e.g. 1 for [1])',
                    initialValue: 1,
                    validation: (Rule: any) => Rule.required().min(1)
                  }
                ]
              })
            ]
          }
        })
      ]
    }),

    // ── Footer ───────────────────────────────────────────────────────
    defineField({
      name: 'citations',
      title: 'Citations',
      type: 'array',
      description: 'Footnote citations displayed in the card footer. Each item is a numbered footnote matching citationRef markers in the body.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cardCitation',
          title: 'Citation',
          fields: [
            defineField({
              name: 'text',
              title: 'Citation Prefix',
              type: 'string',
              description: 'Unlinked label text (e.g. "Source:", "Filter:", "See also:")'
            }),
            defineField({
              name: 'link',
              title: 'Citation Link',
              type: 'linkItem',
              description: 'Internal page or external URL for the citation source'
            }),
            defineField({
              name: 'linkLabel',
              title: 'Link Display Text',
              type: 'string',
              description: 'Visible linked text (e.g. "Resume Factory v2.0"). For internal links, defaults to the page title if empty.',
              validation: (Rule) => Rule.max(100)
            })
          ],
          preview: {
            select: {
              text: 'text',
              linkLabel: 'linkLabel',
              linkType: 'link.type'
            },
            prepare({text, linkLabel, linkType}) {
              return {
                title: `${text || ''} ${linkLabel || ''}`.trim() || 'Untitled citation',
                subtitle: linkType === 'internal' ? 'Internal link' : linkType === 'external' ? 'External link' : 'No link'
              }
            }
          }
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
