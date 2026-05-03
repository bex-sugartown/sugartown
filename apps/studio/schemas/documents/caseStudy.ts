import {defineType, defineField, defineArrayMember} from 'sanity'
import {CaseIcon} from '@sanity/icons'

/**
 * Case Study Document - Portfolio Work
 *
 * Showcase portfolio projects and client work with flexible section-based layout.
 * Similar to Page but with additional project-specific metadata.
 *
 * SEO: uses the shared `seoMetadata` object (Schema 1: SEO Metadata).
 */
export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  icon: CaseIcon,
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
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from title.')
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief project summary for portfolio listings',
      group: 'content',
      rows: 3,
      validation: (Rule) =>
        Rule.max(300)
          .warning('Keep excerpts concise - under 300 characters recommended')
    }),
    defineField({
      name: 'sections',
      title: 'Case Study Sections',
      type: 'array',
      description: 'Build your case study with flexible sections',
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
        defineArrayMember({type: 'trustReportSection'}),
        defineArrayMember({type: 'citedBlock'}),
        defineArrayMember({type: 'statTileSection'}),
      ]
    }),
    defineField({
      name: 'citations',
      title: 'Citations / Endnotes',
      type: 'array',
      description: 'Endnote definitions for [1], [2] etc. markers placed in section content via the Citation Reference annotation. Each entry appears in the endnote zone at the bottom of the case study.',
      group: 'content',
      of: [
        defineArrayMember({type: 'citationItem'})
      ]
    }),

    // METADATA GROUP — dates, project details, CV fields, authors, taxonomy connections
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
      description: 'When was this case study published?',
      group: 'metadata',
      validation: (Rule) => Rule.required().error('Published date is required'),
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last significant update to this case study',
      group: 'metadata',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Client or company name',
      group: 'metadata',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'employer',
      title: 'Employer',
      type: 'string',
      description: 'Employer or agency you worked through (for CV/resume context — e.g. "Freelance", "AKQA", "Accenture Song")',
      group: 'metadata',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'contractType',
      title: 'Contract Type',
      type: 'string',
      description: 'Employment relationship for this project — used in CV/resume engine',
      group: 'metadata',
      options: {
        list: [
          {title: 'Full-time Employment', value: 'full-time'},
          {title: 'Contract / Fixed Term', value: 'contract'},
          {title: 'Freelance / Self-employed', value: 'freelance'},
          {title: 'Advisory / Consulting', value: 'advisory'},
        ],
        layout: 'radio',
      }
    }),
    defineField({
      name: 'role',
      title: 'Your Role',
      type: 'string',
      description: 'What was your role on this project? (e.g., "Lead Designer", "Full Stack Developer")',
      group: 'metadata',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'dateRange',
      title: 'Project Date Range',
      type: 'object',
      description: 'When did this project take place?',
      group: 'metadata',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD',
          }
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'date',
          description: 'Leave blank if ongoing',
          options: {
            dateFormat: 'YYYY-MM-DD',
          }
        })
      ],
      preview: {
        select: {
          start: 'startDate',
          end: 'endDate'
        },
        prepare({start, end}) {
          if (!start) return {title: 'No dates set'}
          const startFormatted = new Date(start).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          })
          const endFormatted = end
            ? new Date(end).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })
            : 'Present'
          return {
            title: `${startFormatted} \u2013 ${endFormatted}`
          }
        }
      }
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'array',
      description: 'Industry sector(s) the client operates in. Used for discovery filtering.',
      group: 'metadata',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Healthcare', value: 'Healthcare'},
          {title: 'Fintech', value: 'Fintech'},
          {title: 'B2B SaaS', value: 'B2B SaaS'},
          {title: 'E-commerce / Retail', value: 'E-commerce / Retail'},
          {title: 'Media & Publishing', value: 'Media & Publishing'},
          {title: 'Food & Beverage', value: 'Food & Beverage'},
          {title: 'Travel & Hospitality', value: 'Travel & Hospitality'},
          {title: 'Education', value: 'Education'},
          {title: 'Government / Public Sector', value: 'Government / Public Sector'},
          {title: 'Non-profit', value: 'Non-profit'},
          {title: 'Professional Services', value: 'Professional Services'},
          {title: 'Agency / Consultancy', value: 'Agency / Consultancy'},
          {title: 'Internal / Product', value: 'Internal / Product'},
        ],
      },
    }),
    defineField({
      name: 'companySize',
      title: 'Company Size',
      type: 'string',
      description: 'Size of the client organisation at the time of the engagement.',
      group: 'metadata',
      options: {
        list: [
          {title: 'Startup', value: 'startup'},
          {title: 'SMB', value: 'smb'},
          {title: 'Enterprise', value: 'enterprise'},
          {title: 'Agency', value: 'agency'},
          {title: 'Internal', value: 'internal'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      description: 'Primary geography of the engagement (e.g. "UK", "US", "Remote", "US / UK / AU").',
      group: 'metadata',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'challengeSummary',
      title: 'Challenge Summary',
      type: 'text',
      description: 'One paragraph describing what the client needed to solve — the "why we were hired" context. Renders above body sections on the detail page.',
      group: 'metadata',
      rows: 4,
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: 'outcomes',
      title: 'Outcomes (Deprecated)',
      type: 'array',
      description: '⚠️ Deprecated — migrate to a Stat Tiles section in sections[]. Existing data still renders on the detail page until SUG-96 ships the Tile primitive.',
      group: 'legacy',
      hidden: true,
      deprecated: {reason: 'Use a Stat Tiles section (statTileSection) in sections[] instead. The StatTile component is being unified into the Tile DS primitive in SUG-96. Outcomes[] data preserved for migration.'},
      of: [
        defineArrayMember({
          type: 'object',
          name: 'outcome',
          title: 'Outcome',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
              description: 'What was measured (e.g. "Analyst prep time", "Conversion rate")',
              validation: (Rule) => Rule.required().max(100),
            }),
            defineField({
              name: 'valueBefore',
              title: 'Value Before',
              type: 'string',
              description: 'State before the engagement (e.g. "14 manual steps, ~3 hours per intake")',
              validation: (Rule) => Rule.max(150),
            }),
            defineField({
              name: 'valueAfter',
              title: 'Value After',
              type: 'string',
              description: 'State after — the result (e.g. "Automated pipeline, ~18 minutes per intake")',
              validation: (Rule) => Rule.required().max(150),
            }),
            defineField({
              name: 'impactStatement',
              title: 'Impact Statement',
              type: 'text',
              description: 'Plain-language sentence explaining what changed for the client.',
              rows: 2,
              validation: (Rule) => Rule.max(400),
            }),
            defineField({
              name: 'evidenceType',
              title: 'Evidence Type',
              type: 'string',
              description: 'How solid is this number?',
              options: {
                list: [
                  {title: 'Measured', value: 'measured'},
                  {title: 'Estimated', value: 'estimated'},
                  {title: 'Qualitative', value: 'qualitative'},
                ],
                layout: 'radio',
              },
            }),
          ],
          preview: {
            select: {title: 'metric', subtitle: 'valueAfter'},
          },
        }),
      ],
    }),
    defineField({
      name: 'aiDisclosure',
      title: 'AI Collaboration Disclosure',
      type: 'string',
      description: 'AI collaboration disclosure — e.g. "Drafted with Claude, edited by Bex Head." Renders below byline on detail pages. Leave blank for fully human-authored content.',
      group: 'metadata',
      validation: (Rule) => Rule.max(300),
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
    // STATUS REMOVED — editorial lifecycle (draft/published/archived) is handled
    // natively by Sanity's document state + perspective:'published' on the web client.
    // Semantic status fields are kept on node (evolution) and project (lifecycle) only.

    defineField({
      name: 'tools',
      title: "Bex's Tools",
      type: 'array',
      description: "Tools and technologies Bex used in this engagement (e.g. Storybook, Claude, dbt). Tag with kind=practitioner on the tool doc. Client-operated systems are tagged kind=platform on the tool doc.",
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
      description: 'Case study categories. Aim for 1–2; a warning appears at 3 or more.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(2)
          .warning('Prefer 1–2 categories per case study for clarity. Add more only if genuinely cross-domain.')
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
    // SUG-52: related content for margin column
    defineField({
      name: 'related',
      title: 'Related',
      type: 'array',
      description: 'Cross-references to related content. Populates the margin column on detail pages.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'node'}, {type: 'article'}, {type: 'caseStudy'}]
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

    // AEO/GEO retrieval fields — SUG-93
    // Machine-readable summaries for AI answer engines and LLMs.
    // aeoSummary: direct-answer paragraph for featured snippets + AI citation.
    // geoSummary: fact-dense third-person inventory for LLM extraction.
    // keyQuestions[]: FAQ pairs driving visible accordion + SUG-94 JSON-LD output.
    defineField({
      name: 'aeoSummary',
      title: 'AEO Summary',
      type: 'text',
      description: 'One paragraph answering "What did Bex do for [client]?" — written for AI citation and featured snippets. No em dashes, no jargon, no hedge stacking.',
      group: 'seo',
      rows: 5,
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: 'geoSummary',
      title: 'GEO Summary',
      type: 'text',
      description: 'LLM-optimised fact inventory. Third-person, fact-dense, no narrative. Format: "Client: X. Engagement: Y. Outcome: Z. Stack: A, B. Role: D (contract type)."',
      group: 'seo',
      rows: 4,
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: 'keyQuestions',
      title: 'Key Questions (Deprecated)',
      type: 'array',
      description: '⚠️ Deprecated — use an Accordion Section with semantic role "FAQ" in the Content sections instead. Existing data still displays but new content should use the section builder.',
      group: 'seo',
      hidden: true,
      deprecated: {reason: 'Replaced by accordionSection with semantic: "faq". Add a new Accordion Section in Content and set its Semantic Role to FAQ. Migration: SUG-94.'},
      of: [
        defineArrayMember({
          type: 'object',
          name: 'keyQuestion',
          title: 'Key Question',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required().max(200),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required().max(400),
            }),
          ],
          preview: {
            select: {title: 'question', subtitle: 'answer'},
          },
        }),
      ],
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
      client: 'client',
      role: 'role',
      startDate: 'dateRange.startDate'
    },
    prepare({title, client, role, startDate}) {
      const year = startDate ? new Date(startDate).getFullYear() : null

      return {
        title: title || 'Untitled Case Study',
        subtitle: [client, role, year].filter(Boolean).join(' • '),
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
      title: 'Project Start (Newest First)',
      name: 'startDateDesc',
      by: [{field: 'dateRange.startDate', direction: 'desc'}]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    }
  ]
})
