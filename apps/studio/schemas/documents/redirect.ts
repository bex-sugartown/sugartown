import {defineType, defineField} from 'sanity'
import {ArrowRightIcon} from '@sanity/icons'

/**
 * Redirect Document
 *
 * Manages URL redirects for the Sugartown site, primarily for the
 * WordPress → Sanity migration. Active redirects are compiled at build
 * time into apps/web/public/_redirects (Netlify format) by
 * scripts/build-redirects.js.
 *
 * Routing model:
 *   - 301 Permanent: legacy WP URLs, canonical changes — use for SEO-safe moves
 *   - 302 Temporary: placeholder redirects during migration
 *   - 410 Gone: pages intentionally removed (rendered as Netlify 404)
 *
 * Notes:
 *   - fromPath must be a root-relative path (starts with "/", no domain)
 *   - Exact match only — no wildcard or prefix matching in this schema
 *   - isActive: false excludes the redirect from the next build output
 *   - Deactivated redirects are kept for historical reference
 */
export default defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: ArrowRightIcon,
  fields: [
    defineField({
      name: 'fromPath',
      title: 'From Path',
      type: 'string',
      description: 'Legacy URL path (root-relative, starting with "/"). No protocol or domain.',
      placeholder: '/old-page-slug/',
      validation: (Rule) =>
        Rule.required()
          .custom((value) => {
            if (!value) return true // required handles this
            if (!value.startsWith('/')) return 'Path must start with "/"'
            if (/^https?:\/\//i.test(value)) return 'Path must be root-relative (no protocol or domain)'
            return true
          })
          .error('From path is required'),
    }),
    defineField({
      name: 'toPath',
      title: 'To Path',
      type: 'string',
      description: 'Destination path (root-relative). Leave blank only for 410 Gone redirects.',
      placeholder: '/articles/my-article',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as {statusCode?: number; fromPath?: string}
          const statusCode = doc?.statusCode
          // toPath is required for 301 and 302
          if ((statusCode === 301 || statusCode === 302) && !value) {
            return 'Destination path is required for 301/302 redirects'
          }
          if (value) {
            if (/^https?:\/\//i.test(value)) return 'Destination must be root-relative (no protocol or domain)'
            if (value === doc?.fromPath) return 'Destination path cannot match source path'
          }
          return true
        }),
    }),
    defineField({
      name: 'statusCode',
      title: 'Status Code',
      type: 'number',
      description: '301 = Permanent (SEO-safe, use for WP migration). 302 = Temporary. 410 = Gone (no toPath needed).',
      options: {
        list: [
          {title: '301 — Permanent Redirect', value: 301},
          {title: '302 — Temporary Redirect', value: 302},
          {title: '410 — Gone (removed)', value: 410},
        ],
        layout: 'radio',
      },
      initialValue: 301,
      validation: (Rule) => Rule.required().error('Status code is required'),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Inactive redirects are excluded from the next Netlify _redirects build. Kept for historical reference.',
      initialValue: true,
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Optional. Migration context, reason for redirect, WP post ID, etc.',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      fromPath: 'fromPath',
      toPath: 'toPath',
      statusCode: 'statusCode',
      isActive: 'isActive',
    },
    prepare({fromPath, toPath, statusCode, isActive}) {
      const status = isActive === false ? ' (inactive)' : ''
      const arrow = toPath ? ` → ${toPath}` : ' → [gone]'
      return {
        title: `${fromPath}${arrow}`,
        subtitle: `${statusCode ?? '?'}${status}`,
      }
    },
  },
  orderings: [
    {
      title: 'From Path (A–Z)',
      name: 'fromPathAsc',
      by: [{field: 'fromPath', direction: 'asc'}],
    },
    {
      title: 'Status Code',
      name: 'statusCodeAsc',
      by: [{field: 'statusCode', direction: 'asc'}],
    },
  ],
})
