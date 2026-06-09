import {defineType, defineField} from 'sanity'
import {BookIcon} from '@sanity/icons'
import {summaryPortableText, standardPortableText} from '../objects/portableTextConfig'

/**
 * GlossaryTerm Document
 *
 * Controlled vocabulary for Sugartown Digital. Each term has a concise definition
 * (summaryPortableText) and an optional extended deep-dive (standardPortableText).
 *
 * Relations are stored HERE and surfaced bidirectionally via GROQ reverse lookups
 * at read time — no duplicate fields on tag/category/tool/article/etc.
 *
 * URL: /glossary/:slug
 * Related: tag (sibling vocab), category (parent grouping), node (knowledge graph)
 */
export default defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      description: 'The defined term (max 80 characters)',
      validation: (Rule) => Rule.required().max(80).error('Term is required and must be under 80 characters'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from term)',
      options: {
        source: 'term',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('Slug is required'),
    }),
    defineField({
      name: 'abbreviation',
      title: 'Abbreviation',
      type: 'string',
      description: 'If the term is an abbreviation or acronym (e.g. "CMS" for Content Management System)',
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'pronunciation',
      title: 'Pronunciation',
      type: 'string',
      description: 'IPA or phonetic pronunciation (optional)',
    }),
    defineField({
      name: 'status',
      title: 'Epistemic Status',
      type: 'string',
      description: 'How settled is this definition?',
      options: {
        list: [
          {title: 'Evergreen', value: 'evergreen'},
          {title: 'Validated', value: 'validated'},
          {title: 'Exploring', value: 'exploring'},
        ],
        layout: 'radio',
      },
      initialValue: 'evergreen',
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'array',
      of: summaryPortableText,
      description: 'Concise definition (1–3 sentences). Reader-facing.',
      validation: (Rule) => Rule.required().error('Definition is required'),
    }),
    defineField({
      name: 'extendedDefinition',
      title: 'Extended Definition',
      type: 'array',
      of: standardPortableText,
      description: 'Optional deep-dive explanation with examples and context.',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Topical grouping for glossary archive filtering',
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related Terms',
      type: 'array',
      of: [
        {type: 'reference', to: [{type: 'glossaryTerm'}]},
        {type: 'reference', to: [{type: 'tag'}]},
        {type: 'reference', to: [{type: 'category'}]},
        {type: 'reference', to: [{type: 'tool'}]},
      ],
      description: '"See also" cross-references. Links to other glossary terms, tags, categories, or tools that share vocabulary with this term.',
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'array',
      of: [
        {type: 'reference', to: [{type: 'article'}]},
        {type: 'reference', to: [{type: 'caseStudy'}]},
        {type: 'reference', to: [{type: 'node'}]},
        {type: 'reference', to: [{type: 'page'}]},
        {type: 'reference', to: [{type: 'person'}]},
        {type: 'reference', to: [{type: 'project'}]},
        {type: 'reference', to: [{type: 'tool'}]},
      ],
      description: 'Manually curated content that uses or exemplifies this term.',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [
        defineField({
          name: 'source',
          type: 'object',
          fields: [
            defineField({name: 'text', type: 'string', title: 'Source text', validation: (Rule) => Rule.required()}),
            defineField({name: 'url', type: 'url', title: 'URL'}),
          ],
          preview: {
            select: {title: 'text'},
          },
        }),
      ],
      description: 'Attribution for the definition',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
    }),
  ],
  preview: {
    select: {
      title: 'term',
      subtitle: 'abbreviation',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Untitled Term',
        subtitle: subtitle ? `${subtitle} — Glossary Term` : 'Glossary Term',
      }
    },
  },
  orderings: [
    {
      title: 'Term (A-Z)',
      name: 'termAsc',
      by: [{field: 'term', direction: 'asc'}],
    },
  ],
})
