import {defineType, defineField, defineArrayMember} from 'sanity'
import {DiamondIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Node Document - Knowledge Graph Node
 *
 * Documents AI collaboration conversations as part of the "Agentic Caucus" methodology.
 * Tracks interactions with Claude, ChatGPT, Gemini, and other AI tools.
 * Creates a knowledge graph of insights, challenges, and learnings.
 *
 * SEO: uses the shared `seoMetadata` object (Schema 1: SEO Metadata).
 */
export default defineType({
  name: 'node',
  title: 'Knowledge Graph Node',
  type: 'document',
  icon: DiamondIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'aiContext', title: 'AI Context'},
    {name: 'agenticCaucus', title: 'Agentic Caucus'},
    {name: 'connections', title: 'Connections'},
    {name: 'metadata', title: 'Metadata'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Clear, descriptive title for this node',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Title is required and must be under 100 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title)',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) =>
        Rule.required()
          .custom(async (value, context) => {
            if (!value?.current) return true
            const {document, getClient} = context
            const client = getClient({apiVersion: '2024-01-01'})
            const id = document._id.replace(/^drafts\./, '')
            const existing = await client.fetch(
              `*[_type == "node" && slug.current == $slug && !(_id in [$id, $draftId])][0]`,
              {slug: value.current, id, draftId: `drafts.${id}`}
            )
            return existing ? `The slug "${value.current}" is already used by another node` : true
          })
          .error('Slug is required. Click "Generate" to create from title.')
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief summary for card displays and previews',
      group: 'content',
      rows: 3,
      validation: (Rule) =>
        Rule.max(300)
          .warning('Keep excerpts concise - under 300 characters recommended')
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Full content of the node',
      group: 'content',
      of: standardPortableText
    }),

    // AI CONTEXT GROUP
    defineField({
      name: 'aiTool',
      title: 'AI Tool',
      type: 'string',
      description: 'Which AI tool(s) were used for this conversation',
      group: 'aiContext',
      options: {
        list: [
          {title: '🤖 Claude', value: 'claude'},
          {title: '💬 ChatGPT', value: 'chatgpt'},
          {title: '✨ Gemini', value: 'gemini'},
          {title: '🔀 Mixed Tools', value: 'mixed'}
        ],
        layout: 'radio'
      },
      validation: (Rule) => Rule.required().error('AI tool selection is required')
    }),
    defineField({
      name: 'conversationType',
      title: 'Conversation Type',
      type: 'string',
      description: 'What kind of interaction was this?',
      group: 'aiContext',
      options: {
        list: [
          {title: '🤔 Problem Solving', value: 'problem'},
          {title: '📚 Learning/Research', value: 'learning'},
          {title: '💻 Code Generation', value: 'code'},
          {title: '🎨 Design Discussion', value: 'design'},
          {title: '🏗️ Architecture Planning', value: 'architecture'},
          {title: '🐛 Debugging', value: 'debug'},
          {title: '💭 Reflection', value: 'reflection'}
        ]
      }
    }),
    defineField({
      name: 'conversationLink',
      title: 'Conversation Link',
      type: 'url',
      description: 'Link to shared conversation (Claude.ai share, ChatGPT share, etc.)',
      group: 'aiContext',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https']
        })
    }),

    // AGENTIC CAUCUS GROUP
    defineField({
      name: 'challenge',
      title: 'Challenge',
      type: 'text',
      description: 'What were you trying to figure out? What problem were you solving?',
      group: 'agenticCaucus',
      rows: 2,
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'insight',
      title: 'Insight',
      type: 'text',
      description: 'What did you learn from this interaction? Key takeaways?',
      group: 'agenticCaucus',
      rows: 3,
      validation: (Rule) => Rule.max(1000)
    }),
    defineField({
      name: 'actionItem',
      title: 'Action Item',
      type: 'string',
      description: 'Next step or operational hook - what do you need to do with this?',
      group: 'agenticCaucus',
      validation: (Rule) => Rule.max(200)
    }),

    // CONNECTIONS GROUP
    // Stage 4: Canonical taxonomy primitives — authors, categories, tags, projects
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Select existing persons or create new — the canonical author field.',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'person'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Primary topic categorization',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(3)
          .warning('Consider using 1-3 categories for clarity')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Cross-cutting themes and topics',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ]
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Canonical project taxonomy field. Prefer this over "Related Projects".',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects (Legacy)',
      type: 'array',
      description: 'Legacy field — kept for backward compatibility. Prefer "Projects" above.',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),

    // METADATA GROUP
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Where is this knowledge in your workflow?',
      group: 'metadata',
      options: {
        list: [
          {title: '🔍 Explored', value: 'explored'},
          {title: '✅ Validated', value: 'validated'},
          {title: '🚀 Implemented', value: 'implemented'},
          {title: '⚠️ Deprecated', value: 'deprecated'},
          {title: '♾️ Evergreen', value: 'evergreen'}
        ],
        layout: 'radio'
      },
      initialValue: 'explored',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this node created/published?',
      group: 'metadata',
      validation: (Rule) => Rule.required().error('Published date is required'),
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last significant update to this node',
      group: 'metadata',
    }),

    // SEO GROUP — shared seoMetadata object (Schema 1: SEO Metadata)
    // Identical across page / post / caseStudy / node for Studio UI consistency.
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      aiTool: 'aiTool',
      status: 'status',
      date: 'publishedAt',
      excerpt: 'excerpt'
    },
    prepare({title, aiTool, status, date, excerpt}) {
      const aiToolLabels = {
        claude: '🤖 Claude',
        chatgpt: '💬 ChatGPT',
        gemini: '✨ Gemini',
        mixed: '🔀 Mixed'
      }
      const statusLabels = {
        explored: '🔍 Explored',
        validated: '✅ Validated',
        implemented: '🚀 Implemented',
        deprecated: '⚠️ Deprecated',
        evergreen: '♾️ Evergreen'
      }
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'

      return {
        title: title || 'Untitled Node',
        subtitle: `${aiToolLabels[aiTool as keyof typeof aiToolLabels] || aiTool} • ${statusLabels[status as keyof typeof statusLabels] || status} • ${formattedDate}`,
        description: excerpt
      }
    }
  },
  orderings: [
    {
      title: 'Published Date (Newest First)',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}]
    },
    {
      title: 'Published Date (Oldest First)',
      name: 'publishedAsc',
      by: [{field: 'publishedAt', direction: 'asc'}]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    }
  ]
})
