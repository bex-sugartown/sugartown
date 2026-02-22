/**
 * SEO utilities — Auto-Extraction & Resolver System
 *
 * Single source of truth for:
 *   - GROQ fragments for querying SEO fields
 *   - extractPlainText()  — pure-JS Portable Text → plain string
 *   - resolveSeo()        — derives final title + description from doc content,
 *                           merging global site defaults as fallback
 *
 * ─── Resolution order ─────────────────────────────────────────────────────────
 *
 *   autoGenerate === true (or missing/null — missing is treated as true):
 *     title       → `${doc.title} | Sugartown Digital`
 *     description → doc.seo?.description (explicit override even in auto mode)
 *                   ?? doc.excerpt
 *                   ?? extractPlainText(doc.body, 160)
 *
 *   autoGenerate === false:
 *     title       → doc.seo?.title   (exact override)
 *     description → doc.seo?.description
 *
 *   Fallback (both modes):
 *     If title is still empty → siteSettings?.defaultMetaTitle ?? 'Sugartown Digital'
 *     If description is still empty → siteSettings?.defaultMetaDescription ?? ''
 *
 *   description is always plain text, trimmed to 160 chars (sentence-safe).
 *
 * ─── Backward compatibility ───────────────────────────────────────────────────
 *   Existing docs without autoGenerate set behave as autoGenerate === true.
 *   Call sites pass the full doc object + siteSettings; the resolver reads
 *   doc.seo (field name on Sanity documents), doc.title, doc.excerpt, doc.body.
 *
 * ─── SEO object shape (from seoMetadata Sanity schema) ───────────────────────
 *   doc.seo.autoGenerate  — new field (v0.12.0); missing → treated as true
 *   doc.seo.title         — meta title override (exact, used when autoGenerate: false)
 *   doc.seo.description   — meta description override (respected in both modes)
 *   doc.seo.canonicalUrl  — explicit canonical URL override
 *   doc.seo.noIndex       — robots: noindex
 *   doc.seo.noFollow      — robots: nofollow
 *   doc.seo.openGraph.title
 *   doc.seo.openGraph.description
 *   doc.seo.openGraph.image  { asset, alt }
 *   doc.seo.openGraph.type   — 'website' | 'article' | 'profile'
 */

import { getCanonicalPath } from './routes'

// ─── GROQ fragments ───────────────────────────────────────────────────────────

/**
 * SEO_FRAGMENT
 *
 * Drop into any GROQ projection targeting a document with a `seo` field of
 * type `seoMetadata`. Includes the new `autoGenerate` field (v0.12.0).
 *
 * Usage:
 *   import { SEO_FRAGMENT } from '../lib/seo'
 *
 *   export const pageBySlugQuery = `
 *     *[_type == "page" && slug.current == $slug][0] {
 *       title,
 *       ${SEO_FRAGMENT}
 *     }
 *   `
 */
export const SEO_FRAGMENT = `
  seo {
    autoGenerate,
    title,
    description,
    canonicalUrl,
    noIndex,
    noFollow,
    openGraph {
      title,
      description,
      image {
        asset->,
        alt
      },
      type
    }
  }
`.trim()

/**
 * SITE_SEO_FRAGMENT
 *
 * Fragment for querying global SEO defaults from siteSettings.
 */
export const SITE_SEO_FRAGMENT = `
  siteUrl,
  siteTitle,
  defaultMetaTitle,
  defaultMetaDescription,
  defaultOgImage {
    asset->,
    alt
  }
`.trim()

// ─── Portable Text extractor ──────────────────────────────────────────────────

/**
 * extractPlainText(body, maxLength) → string
 *
 * Accepts a Portable Text array (or null/undefined).
 * Returns plain text up to maxLength characters.
 *
 * Rules:
 * - Walks blocks array
 * - Only processes blocks where _type === 'block' AND style !== 'code'
 * - Extracts text from children[].text, joined with space
 * - Skips embedded objects (_type !== 'block')
 * - Strips any HTML tags (simple regex)
 * - Trims whitespace
 * - Truncates to maxLength backing up to last space (sentence-safe);
 *   if backing up would produce empty string, truncates hard instead
 * - Returns '' if body is null, undefined, or empty array
 *
 * @param {Array|null|undefined} body
 * @param {number} maxLength
 * @returns {string}
 */
export function extractPlainText(body, maxLength) {
  if (!body || !Array.isArray(body) || body.length === 0) return ''

  const parts = []

  for (const block of body) {
    // Skip non-block types (images, code blocks as custom types, etc.)
    if (!block || block._type !== 'block') continue
    // Skip code-style blocks
    if (block.style === 'code') continue

    // Extract text from children
    const children = block.children ?? []
    const blockText = children
      .filter((child) => typeof child.text === 'string')
      .map((child) => child.text)
      .join(' ')

    if (blockText) parts.push(blockText)
  }

  // Join blocks with a space, strip HTML tags, collapse whitespace
  let text = parts
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''

  if (text.length <= maxLength) return text

  // Truncate to maxLength
  let truncated = text.slice(0, maxLength)

  // Back up to last space for sentence-safe trim
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace)
  }
  // If backing up produced empty string, hard-truncate instead
  if (!truncated.trim()) {
    truncated = text.slice(0, maxLength)
  }

  return truncated.trim()
}

// ─── Description normaliser ───────────────────────────────────────────────────

/**
 * normaliseDescription(raw, maxLength) → string
 *
 * Ensures a description is plain text, trimmed to maxLength with sentence-safe
 * truncation. Accepts a string that may contain HTML tags.
 *
 * @param {string|null|undefined} raw
 * @param {number} [maxLength=160]
 * @returns {string}
 */
function normaliseDescription(raw, maxLength = 160) {
  if (!raw) return ''

  // Strip HTML tags and collapse whitespace
  let text = String(raw)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  let truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace)
  }
  if (!truncated.trim()) {
    truncated = text.slice(0, maxLength)
  }
  return truncated.trim()
}

// ─── SEO resolver ─────────────────────────────────────────────────────────────

/**
 * resolveSeo(doc, siteSettings) → SeoResolved
 *
 * Derives a fully resolved SEO object from a Sanity document + site defaults.
 * All page renderers call this before rendering <SeoHead />.
 *
 * @param {object|null} doc          — full Sanity document (has .title, .seo, .excerpt, .body)
 * @param {object|null} siteSettings — from siteSettingsQuery (has .siteTitle, .siteUrl, etc.)
 * @returns {SeoResolved}
 */
export function resolveSeo(doc, siteSettings) {
  const site = siteSettings ?? {}
  const docSeo = doc?.seo ?? null

  // autoGenerate: missing or null → treat as true (backward-compatible default)
  const autoGenerate = docSeo?.autoGenerate !== false

  // ── Title ──────────────────────────────────────────────────────────────────
  let title
  if (autoGenerate) {
    // Auto mode: always use doc.title with site suffix
    title = doc?.title
      ? `${doc.title} | Sugartown Digital`
      : null
  } else {
    // Manual override mode: use the exact seo.title value
    title = docSeo?.title || null
  }

  // Fallback: if still empty, use site defaults
  if (!title) {
    title = site.defaultMetaTitle || 'Sugartown Digital'
  }

  // ── Description ────────────────────────────────────────────────────────────
  // seo.description is respected as an explicit override in both auto and manual modes.
  let rawDescription =
    docSeo?.description ||              // explicit override (both modes)
    (autoGenerate
      ? (doc?.excerpt || extractPlainText(doc?.body, 160))
      : null) ||
    site.defaultMetaDescription ||
    ''

  // Ensure description is always plain text, trimmed to 160 chars
  const description = normaliseDescription(rawDescription, 160)

  // ── Canonical URL ──────────────────────────────────────────────────────────
  let canonicalUrl = docSeo?.canonicalUrl || null
  if (!canonicalUrl && doc?.slug && doc?._type) {
    const slugStr = typeof doc.slug === 'string' ? doc.slug : doc.slug?.current
    if (slugStr) {
      const path = getCanonicalPath({ docType: doc._type, slug: slugStr })
      const base = site.siteUrl ? site.siteUrl.replace(/\/$/, '') : ''
      canonicalUrl = base ? `${base}${path}` : null
    }
  }

  // ── Robots ─────────────────────────────────────────────────────────────────
  const robots = {
    index: docSeo?.noIndex !== true,
    follow: docSeo?.noFollow !== true,
  }

  // ── Open Graph ─────────────────────────────────────────────────────────────
  const ogTitle = docSeo?.openGraph?.title || title
  const ogDescription = docSeo?.openGraph?.description || description
  const ogImage = docSeo?.openGraph?.image || site.defaultOgImage || null
  const ogType = docSeo?.openGraph?.type || 'website'

  return {
    title,
    description,
    canonicalUrl,
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      type: ogType,
    },
  }
}
