import {defineType, defineField, defineArrayMember} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'
import {summaryPortableText} from './portableTextConfig'

/**
 * answerBlock — inline Q&A section type.
 *
 * A single question + answer unit in sections[]. Editors add one block
 * per Q&A pair; multiple consecutive blocks form a Q&A series.
 *
 * Distinct from keyQuestions[] (deprecated) and accordionSection with
 * semantic: 'faq'. answerBlock is for editorial Q&As embedded in the
 * narrative content flow. No JSON-LD output.
 *
 * Available in: caseStudy, article, node sections[]
 *
 * SUG-94
 */
export default defineType({
  name: 'answerBlock',
  title: 'Answer Block',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'The question being answered',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: summaryPortableText,
      description: 'Direct answer — supports bold, italic, and inline links',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'evidence',
      title: 'Evidence',
      type: 'array',
      description: 'Optional related content links shown as "Further reading" below the answer',
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
      question: 'question',
    },
    prepare({question}) {
      return {
        title: question || 'Untitled question',
        subtitle: 'Answer Block',
      }
    },
  },
})
