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
  groups: [
    {name: 'all', title: 'All', default: true},
    {name: 'basics', title: 'Basics'},
    {name: 'profile', title: 'Profile'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      description: 'The defined term (max 80 characters)',
      validation: (Rule) => Rule.required().max(80).error('Term is required and must be under 80 characters'),
      group: ['all', 'basics'],
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
      group: ['all', 'basics'],
    }),
    defineField({
      name: 'abbreviation',
      title: 'Abbreviation',
      type: 'string',
      description: 'If the term is an abbreviation or acronym (e.g. "CMS" for Content Management System)',
      validation: (Rule) => Rule.max(20),
      group: ['all', 'basics'],
    }),
    defineField({
      name: 'pronunciation',
      title: 'Pronunciation',
      type: 'string',
      description: 'IPA or phonetic pronunciation (optional)',
      group: ['all', 'basics'],
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'array',
      of: summaryPortableText,
      description: 'Concise definition (1–3 sentences). Reader-facing.',
      validation: (Rule) => Rule.required().error('Definition is required'),
      group: ['all', 'basics'],
    }),
    defineField({
      name: 'extendedDefinition',
      title: 'Extended Definition',
      type: 'array',
      of: standardPortableText,
      description: 'Optional deep-dive explanation with examples and context.',
      group: ['all', 'basics'],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Topical grouping for glossary archive filtering',
      group: ['all', 'profile'],
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related Terms',
      type: 'array',
      of: [
        {name: 'glossaryTermRef', type: 'reference', to: [{type: 'glossaryTerm'}]},
        {name: 'tagRef', type: 'reference', to: [{type: 'tag'}]},
        {name: 'categoryRef', type: 'reference', to: [{type: 'category'}]},
        {name: 'toolRef', type: 'reference', to: [{type: 'tool'}]},
      ],
      description: '"See also" cross-references. Links to other glossary terms, tags, categories, or tools that share vocabulary with this term.',
      group: ['all', 'profile'],
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'array',
      of: [
        {name: 'articleRef', type: 'reference', to: [{type: 'article'}]},
        {name: 'caseStudyRef', type: 'reference', to: [{type: 'caseStudy'}]},
        {name: 'nodeRef', type: 'reference', to: [{type: 'node'}]},
        {name: 'pageRef', type: 'reference', to: [{type: 'page'}]},
        {name: 'personRef', type: 'reference', to: [{type: 'person'}]},
        {name: 'projectRef', type: 'reference', to: [{type: 'project'}]},
        {name: 'toolContentRef', type: 'reference', to: [{type: 'tool'}]},
      ],
      description: 'Manually curated content that uses or exemplifies this term.',
      group: ['all', 'profile'],
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
      group: ['all', 'profile'],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: ['all', 'seo'],
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
