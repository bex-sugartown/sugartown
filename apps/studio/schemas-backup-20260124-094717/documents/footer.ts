import {defineType} from 'sanity'

export default defineType({
  name: 'footer',
  title: 'Site Footer',
  type: 'document',
  fields: [
    {
      name: 'logo',
      title: 'Footer Logo',
      type: 'logo',
      description: 'Optional logo in footer (can differ from header logo)',
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short brand statement or mission (e.g., "Building better resumes")',
    },
    {
      name: 'navigationColumns',
      title: 'Footer Navigation Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navColumn',
          fields: [
            {
              name: 'heading',
              title: 'Column Heading',
              type: 'string',
              description: 'E.g., "Company", "Resources", "Legal"',
            },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [{type: 'link'}],
            },
          ],
          preview: {
            select: {
              title: 'heading',
              links: 'links',
            },
            prepare({title, links}) {
              return {
                title: title,
                subtitle: `${links?.length || 0} links`,
              }
            },
          },
        },
      ],
      description: 'Organize footer links into columns',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{type: 'socialLink'}],
      description: 'Social media profiles',
    },
    {
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'E.g., © 2025 Sugartown. All rights reserved.',
      initialValue: `© ${new Date().getFullYear()} Sugartown. All rights reserved.`,
    },
    {
      name: 'legalLinks',
      title: 'Legal Links',
      type: 'array',
      of: [{type: 'link'}],
      description: 'Privacy Policy, Terms of Service, etc.',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Footer',
        subtitle: 'Global footer content',
      }
    },
  },
})
