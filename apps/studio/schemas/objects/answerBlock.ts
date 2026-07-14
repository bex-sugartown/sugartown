import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {summaryPortableText} from './portableTextConfig'

/**
 * citedBlock — inline headed section with body text and optional reference links.
 *
 * General-purpose narrative block: a heading, body prose, and optional
 * "Further reading" references. Replaces the Q&A-specific answerBlock (SUG-96).
 * Previous fields: question → heading, answer → body, evidence → references.
 *
 * Available in: caseStudy, article, node sections[]
 *
 * SUG-94 / SUG-96
 */
export default defineType({
  name: 'citedBlock',
  title: 'Cited Block',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Section heading for this block (max. 200 characters)',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: summaryPortableText,
      description: 'Body content — supports bold, italic, and inline links',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'references',
      title: 'References',
      type: 'array',
      description: 'Optional related content links shown as "Further reading" below the body',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {type: 'article'},
            {type: 'node'},
            {type: 'caseStudy'},
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare({heading}) {
      return {
        title: heading || 'Untitled block',
        subtitle: 'Cited Block',
      }
    },
  },
})
