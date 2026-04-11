import {defineType, defineField, defineArrayMember} from 'sanity'
import {DiamondIcon} from '@sanity/icons'
import {standardPortableText, metadataPortableText} from '../objects/portableTextConfig'

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
    {name: 'metadata', title: 'Metadata'},
    {name: 'seo', title: 'SEO'},
    {name: 'migration', title: 'Migration'},
    {name: 'legacy', title: 'Legacy'},
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference title — used for SEO <title>, Studio previews, and slugs. The visible page title is the Hero Section heading.',
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
          .error('Slug is required. Click "Generate" to create from title.')
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Takeaway',
      type: 'text',
      description: 'One-sentence takeaway — the lesson this node teaches. Used for card displays, headless summaries, and AI search extraction. Lead with the principle, not the setup.',
      group: 'content',
      rows: 3,
      validation: (Rule) =>
        Rule.max(300)
          .warning('Keep to a single takeaway sentence — under 300 characters recommended')
    }),
    defineField({
      name: 'keyTakeaway',
      title: 'Key Takeaway (Deprecated)',
      type: 'string',
      description: '⚠️ Deprecated — use Excerpt / Takeaway instead. Single Field Authority: one summary field per document.',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Use Excerpt / Takeaway instead. Two summary fields violates Single Field Authority.'},
      validation: (Rule) =>
        Rule.max(200)
    }),
    defineField({
      name: 'content',
      title: 'Content (Legacy)',
      type: 'array',
      description: '⚠️ Deprecated — use Page Sections → Text Section instead. This field renders with different typography than sections. Existing content still displays but new content should use the sections array.',
      group: 'legacy',
      deprecated: {reason: 'Use a Text Section in the Page Sections array instead. Sections provide consistent typography and spacing.'},
      of: standardPortableText
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      description: 'Flexible section builder — used for migrated HTML and structured content blocks',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroSection'}),
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'ctaSection'}),
        defineArrayMember({type: 'htmlSection'}),
        defineArrayMember({type: 'cardBuilderSection'}),
        defineArrayMember({type: 'calloutSection'}),
        defineArrayMember({type: 'mermaidSection'}),
        defineArrayMember({type: 'accordionSection'}),
      ]
    }),
    defineField({
      name: 'citations',
      title: 'Citations / Endnotes',
      type: 'array',
      description: 'Endnote definitions for [1], [2] etc. markers placed in content via the Citation Reference annotation. Each entry appears in the endnote zone at the bottom of the node.',
      group: 'content',
      of: [
        defineArrayMember({type: 'citationItem'})
      ]
    }),

    // DEPRECATED — Agentic Caucus fields (SUG-48: hidden, tools[] is canonical for AI tools, categories/tags for conversation type)
    defineField({
      name: 'aiTool',
      title: 'AI Tool (Deprecated)',
      type: 'string',
      description: '⚠️ Deprecated — use Tools & Platforms taxonomy instead.',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Use the Tools & Platforms taxonomy field instead. AI tools are now first-class tool documents.'},
      options: {
        list: [
          {title: '🤖 Claude', value: 'claude'},
          {title: '💬 ChatGPT', value: 'chatgpt'},
          {title: '✨ Gemini', value: 'gemini'},
          {title: '🔀 Agentic Caucus', value: 'mixed'}
        ],
        layout: 'radio'
      },
      // validation removed — field is deprecated and hidden, required constraint would block publishing
    }),
    defineField({
      name: 'conversationType',
      title: 'Conversation Type (Deprecated)',
      type: 'string',
      description: '⚠️ Deprecated — use categories and tags for conversation classification.',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Use categories and tags for conversation classification instead of a dedicated enum.'},
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
      name: 'challenge',
      title: 'Challenge (Legacy)',
      type: 'array',
      description: '⚠️ Deprecated — work challenges into the node body (The Setup / The Failure). Existing content still displays but new nodes should use the narrative arc.',
      group: 'legacy',
      deprecated: {reason: 'Work challenges into the node narrative arc (The Setup / The Failure) instead of a separate metadata field.'},
      of: metadataPortableText,
    }),
    defineField({
      name: 'insight',
      title: 'Insight (Legacy)',
      type: 'array',
      description: '⚠️ Deprecated — work insights into the node body (The Lesson). Existing content still displays but new nodes should use the narrative arc.',
      group: 'legacy',
      deprecated: {reason: 'Work insights into the node narrative arc (The Lesson) instead of a separate metadata field.'},
      of: metadataPortableText,
    }),
    defineField({
      name: 'actionItem',
      title: 'Action Item (Legacy)',
      type: 'array',
      description: '⚠️ Deprecated — work action items into the node body (The Fix / closing paragraph). Existing content still displays but new nodes should use the narrative arc.',
      group: 'legacy',
      deprecated: {reason: 'Work action items into the node narrative arc (The Fix / closing paragraph) instead of a separate metadata field.'},
      of: metadataPortableText,
    }),

    // METADATA GROUP — dates, status, authors, taxonomy connections
    // SUG-48: cardImage deprecated — future: auto-derive from hero section image (SUG-50)
    defineField({
      name: 'cardImage',
      title: 'Card Image (Deprecated)',
      type: 'image',
      description: '⚠️ Deprecated — card thumbnails will be auto-derived from the hero section image (SUG-50).',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Card thumbnails will be auto-derived from the hero section image. See SUG-50.'},
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
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
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time',
      type: 'number',
      description: 'Estimated reading time in minutes. Manual entry or computed from word count.',
      group: 'metadata',
      validation: (Rule) => Rule.min(1).max(60).integer(),
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Select existing persons or create new — the canonical author field.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'person'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Canonical project taxonomy field. Prefer this over "Related Projects".',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),
    defineField({
      name: 'status',
      title: 'Evolution',
      type: 'string',
      description: "Where y'at?",
      group: 'metadata',
      options: {
        list: [
          {title: '🔍 Exploring', value: 'exploring'},
          {title: '✅ Validated', value: 'validated'},
          {title: '🚀 Operationalized', value: 'operationalized'},
          {title: '⚠️ Deprecated', value: 'deprecated'},
          {title: '♾️ Evergreen', value: 'evergreen'}
        ],
        layout: 'radio'
      },
      initialValue: 'exploring',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'tools',
      title: 'Tools & Platforms',
      type: 'array',
      // Note: The aiTool field (AI Context group) captures the AI model specifically.
      // tools[] captures the broader technology stack involved in this node.
      description: 'Tools and platforms involved in this node (beyond the primary AI tool). Select from published tool documents. Use tags for conceptual themes.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tool'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      // Guided multiplicity: 1–2 categories strongly preferred. Warning fires at 3+.
      // Nodes legitimately span multiple categories — do not hard-constrain to 1.
      description: 'Primary topic categorization. Aim for 1–2; a warning appears at 3 or more.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(2)
          .warning('Prefer 1–2 categories per node for clarity. Nodes spanning domains are intentional — just be deliberate.')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      // Tags must be references to published tag documents — no freeform strings.
      // The controlled vocabulary lives in the tag document collection.
      // See docs/taxonomy/controlled-vocabulary.md for the canonical list.
      description: 'Conceptual and thematic tags from the controlled vocabulary. Do not create new tags without editorial review.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'relatedNodes',
      title: 'Related Nodes',
      type: 'array',
      description: 'Explicit cross-references to other knowledge graph nodes. Makes the graph queryable without body text parsing.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'node'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    // SUG-48: relatedProjects deprecated — projects[] is canonical
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects (Deprecated)',
      type: 'array',
      description: '⚠️ Deprecated — use "Projects" field instead.',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Use the Projects taxonomy field instead.'},
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),

    // SEO GROUP — shared seoMetadata object (Schema 1: SEO Metadata)
    // Identical across page / post / caseStudy / node for Studio UI consistency.
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),

    // MIGRATION GROUP — populated by migrate:import, read-only in Studio
    defineField({
      name: 'legacySource',
      title: 'Legacy Source',
      type: 'legacySource',
      group: 'migration',
      description: 'Migration metadata from WordPress. Read-only — set by import script.',
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
        exploring: '🔍 Exploring',
        validated: '✅ Validated',
        operationalized: '🚀 Operationalized',
        deprecated: '⚠️ Deprecated',
        evergreen: '♾️ Evergreen',
        // legacy values — kept so existing docs don't show blank in preview
        explored: '🔍 Explored (legacy)',
        implemented: '🚀 Implemented (legacy)',
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
