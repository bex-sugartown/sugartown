import {defineType, defineField} from 'sanity'
import {defineIncomingReferenceDecoration} from 'sanity/structure'
import {WrenchIcon} from '@sanity/icons'
import {createRemoveReferenceAction} from '../../components/RemoveReferenceAction'

/**
 * Tool Document
 *
 * Tools, platforms, and technologies used across content.
 * Tools are the 5th taxonomy primitive (alongside tag, category, project, person).
 *
 * Unlike tags (which are conceptual/thematic), tools represent specific named
 * software, platforms, languages, or frameworks (e.g., "Claude Code", "React", "Sanity").
 *
 * Editors can create new tool documents directly in Studio — no code changes required.
 * Tools participate in the knowledge graph as first-class nodes.
 */
export default defineType({
  name: 'tool',
  title: 'Tool',
  type: 'document',
  icon: WrenchIcon,
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'media', title: 'Media'},
  ],
  renderMembers: (members) => [
    ...members,
    defineIncomingReferenceDecoration({
      name: 'assignedContent',
      title: 'Assigned content',
      types: [{type: 'article'}, {type: 'node'}, {type: 'caseStudy'}],
      actions: [createRemoveReferenceAction('tools')],
      onLinkDocument: (doc, reference) => {
        const existing = ((doc as any).tools ?? []) as Array<{_ref: string}>
        if (existing.some((r) => r._ref === reference._ref)) return false
        return {...doc, tools: [...existing, {...reference, _key: reference._ref}]}
      },
    }),
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tool Name',
      type: 'string',
      group: 'basics',
      description: 'The tool, platform, or technology name (e.g., "Claude Code", "React", "Figma")',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('Tool name is required and must be under 60 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basics',
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
      name: 'kind',
      title: 'Kind',
      type: 'string',
      group: 'basics',
      description: 'Relationship context: "platform" = client-operated infrastructure Bex worked on (Drupal, Salesforce, Oracle ATG). "practitioner" = tools Bex uses directly in her practice (Figma, Sanity, Storybook).',
      options: {
        list: [
          {title: 'Practitioner — Bex\'s own tool', value: 'practitioner'},
          {title: 'Platform — client-operated system', value: 'platform'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'toolType',
      title: 'Tool Type',
      type: 'string',
      group: 'basics',
      description: 'Categorises tools by function — used for filtering and grouping on archive pages.',
      options: {
        list: [
          {title: 'AI', value: 'ai'},
          {title: 'CMS', value: 'cms'},
          {title: 'DAM', value: 'dam'},
          {title: 'Data', value: 'data'},
          {title: 'Design', value: 'design'},
          {title: 'Development', value: 'development'},
          {title: 'E-commerce', value: 'ecommerce'},
          {title: 'OS', value: 'os'},
          {title: 'PIM', value: 'pim'},
          {title: 'Productivity', value: 'productivity'},
          {title: 'Visualization', value: 'visualization'},
          {title: 'Analytics', value: 'analytics'},
          {title: 'MarTech', value: 'martech'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'dropdown',
      },
      validation: (Rule) =>
        Rule.required()
          .error('Tool type is required — choose the best-fit category.')
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'basics',
      description: 'What is this tool and when should it be tagged? Helps editors maintain consistent vocabulary.',
      rows: 2,
      validation: (Rule) => Rule.max(300)
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      group: 'basics',
      description: 'Official website or documentation link for this tool.',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'media',
      description: 'Tool logo or icon. Square aspect ratio recommended.',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      toolType: 'toolType',
      media: 'logo',
    },
    prepare({title, toolType, media}) {
      const typeLabels: Record<string, string> = {
        ai: 'AI',
        cms: 'CMS',
        dam: 'DAM',
        data: 'Data',
        design: 'Design',
        development: 'Development',
        ecommerce: 'E-commerce',
        os: 'OS',
        pim: 'PIM',
        productivity: 'Productivity',
        visualization: 'Visualization',
        analytics: 'Analytics',
        martech: 'MarTech',
        other: 'Other',
      }
      return {
        title: title || 'Untitled Tool',
        subtitle: toolType ? typeLabels[toolType] ?? toolType : 'Tool',
        media,
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
