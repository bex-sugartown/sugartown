import {defineType, defineField} from 'sanity'
import {defineIncomingReferenceDecoration} from 'sanity/structure'
import {TagsIcon} from '@sanity/icons'
import {createRemoveReferenceAction} from '../../components/RemoveReferenceAction'

/**
 * Tag Document
 *
 * Controlled vocabulary for cross-cutting conceptual and thematic classification.
 * Tags are bridges between content — they surface relationships in the Knowledge Graph.
 *
 * Vocabulary rules:
 * - Tags must be conceptual or thematic (not tool names, not statuses, not client names)
 * - Tags must be cross-cutting — useful across article, caseStudy, and node types
 * - Tool names belong in the tools[] enum field on each content type
 * - Status values belong in the status field on each content type
 * - New tags require editorial review before creation (see docs/taxonomy/controlled-vocabulary.md)
 *
 * Canonical vocabulary: ~60–100 approved tags. Do not create tags outside this list.
 */
export default defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagsIcon,
  renderMembers: (members) => [
    ...members,
    defineIncomingReferenceDecoration({
      name: 'assignedContent',
      title: 'Assigned content',
      types: [{type: 'article'}, {type: 'node'}, {type: 'caseStudy'}, {type: 'project'}],
      actions: [createRemoveReferenceAction('tags')],
    }),
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      type: 'string',
      description: 'The tag label — conceptual/thematic only (e.g., "AI Ethics", "Governance", "Content Modeling")',
      validation: (Rule) =>
        Rule.required()
          .max(50)
          .error('Tag name is required and must be under 50 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from name)',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from name.')
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'What does this tag mean and when should it be applied? Helps editors maintain consistent vocabulary.',
      rows: 2,
      validation: (Rule) => Rule.max(300)
    }),
  ],
  preview: {
    select: {
      title: 'name'
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Tag',
        subtitle: 'Tag'
      }
    }
  },
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}]
    },
    {
      title: 'Name (Z-A)',
      name: 'nameDesc',
      by: [{field: 'name', direction: 'desc'}]
    }
  ]
})
