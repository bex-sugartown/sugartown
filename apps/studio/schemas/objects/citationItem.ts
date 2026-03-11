import {defineType, defineField} from 'sanity'

/**
 * Citation Item — reusable endnote object.
 *
 * Used in the document-level `citations[]` array on article, node, and caseStudy.
 * Each item represents a single endnote referenced by a `citationRef` inline
 * annotation in the content body (e.g. [1], [2]).
 *
 * Shape mirrors the card-builder citation footer (cardBuilderItem.citation)
 * but is extracted as a named type for reuse across document types.
 */
export default defineType({
  name: 'citationItem',
  title: 'Citation',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Citation Text',
      type: 'string',
      description: 'Source attribution or footnote text (e.g. "Core Web Vitals report, Google, 2024")',
      validation: (Rule) => Rule.required().error('Citation text is required'),
    }),
    defineField({
      name: 'url',
      title: 'Citation URL',
      type: 'url',
      description: 'Optional link to the source',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    }),
    defineField({
      name: 'label',
      title: 'Link Label',
      type: 'string',
      description: 'Optional display text for the URL link (defaults to "Source" if URL is provided but label is empty)',
    }),
  ],
  preview: {
    select: {
      text: 'text',
      url: 'url',
    },
    prepare({text, url}) {
      return {
        title: text || 'Untitled citation',
        subtitle: url || 'No URL',
      }
    },
  },
})
