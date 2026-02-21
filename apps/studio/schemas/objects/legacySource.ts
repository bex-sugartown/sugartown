import {defineType, defineField} from 'sanity'

/**
 * legacySource — Migration metadata block
 *
 * Attached to every document migrated from WordPress during the
 * WordPress → Sanity migration (Epic 6). Never created manually.
 *
 * Fields:
 *   system          — always "wp" for WordPress-originated content
 *   wpId            — WordPress post/term numeric ID
 *   wpType          — original WP type: post | page | gem | case_study | term
 *   wpUrl           — original WordPress permalink (for audit/redirect gen)
 *   legacySlug      — original WordPress slug (may differ from Sanity slug
 *                     if a collision was resolved)
 *   importHash      — MD5 of the source HTML content — used for change detection
 *                     on subsequent re-import runs
 *   importedAt      — datetime the document was written to Sanity
 *   legacyHtml      — raw HTML fallback — present ONLY if Portable Text conversion
 *                     was skipped (risky content). Body content may be incomplete
 *                     in `content` field; this field is the canonical source.
 *   legacyFeaturedImageUrl — original WP featured image URL — audit only.
 *                     NOT used for rendering. Actual image is in mainImage/featuredImage
 *                     as a Sanity asset reference.
 */
export default defineType({
  name: 'legacySource',
  title: 'Legacy Source (Migration)',
  type: 'object',
  fields: [
    defineField({
      name: 'system',
      title: 'Source System',
      type: 'string',
      description: 'Always "wp" for WordPress-originated content.',
      readOnly: true,
      initialValue: 'wp',
    }),
    defineField({
      name: 'wpId',
      title: 'WordPress ID',
      type: 'number',
      description: 'Original WordPress post or term numeric ID.',
      readOnly: true,
    }),
    defineField({
      name: 'wpType',
      title: 'WordPress Type',
      type: 'string',
      description: 'Original WP object type: post | page | gem | case_study | term',
      readOnly: true,
    }),
    defineField({
      name: 'wpUrl',
      title: 'Original WP URL',
      type: 'url',
      description: 'Original WordPress permalink. Audit use only.',
      readOnly: true,
    }),
    defineField({
      name: 'legacySlug',
      title: 'Original WP Slug',
      type: 'string',
      description: 'Original WordPress slug. May differ from Sanity slug if a collision was resolved.',
      readOnly: true,
    }),
    defineField({
      name: 'importHash',
      title: 'Import Hash',
      type: 'string',
      description: 'MD5 of source HTML content at time of import. Used for change detection on re-import.',
      readOnly: true,
    }),
    defineField({
      name: 'importedAt',
      title: 'Imported At',
      type: 'datetime',
      description: 'When this document was written to Sanity.',
      readOnly: true,
    }),
    defineField({
      name: 'legacyHtml',
      title: 'Legacy HTML (Fallback)',
      type: 'text',
      description: 'Raw HTML source. Empty = Portable Text conversion succeeded (this is normal and correct). Only populated when conversion was skipped due to complex markup (tables, shortcodes, embeds) — in those cases this field is the canonical content source and the content field may be incomplete.',
      readOnly: true,
      rows: 6,
    }),
    defineField({
      name: 'legacyFeaturedImageUrl',
      title: 'Original Featured Image URL',
      type: 'url',
      description: 'Original WordPress featured image URL. Audit only — NOT used for rendering. Actual image is stored as a Sanity asset reference.',
      readOnly: true,
    }),
  ],
  // Collapsed by default — migration metadata should stay out of the way
  options: {
    collapsible: true,
    collapsed: true,
  },
})
