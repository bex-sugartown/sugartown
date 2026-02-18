/**
 * SEO utilities — Stage 1: SEO Object Alignment
 *
 * Single source of truth for:
 *   - GROQ fragment for querying seoMetadata fields
 *   - resolveSeo() — merges global defaults + per-doc overrides into a
 *     consistent SeoResolved shape consumed by every page renderer
 *
 * SEO object shape (from seoMetadata Sanity schema):
 *   seo.title           — meta title override
 *   seo.description     — meta description override
 *   seo.canonicalUrl    — explicit canonical URL override
 *   seo.noIndex         — robots: noindex
 *   seo.noFollow        — robots: nofollow
 *   seo.openGraph.title
 *   seo.openGraph.description
 *   seo.openGraph.image  { asset, alt }
 *   seo.openGraph.type   — 'website' | 'article' | 'profile'
 */

import { getCanonicalPath } from './routes'

// ─── GROQ fragment ────────────────────────────────────────────────────────────

/**
 * SEO_FRAGMENT
 *
 * Drop this into any GROQ projection that targets a document with a `seo`
 * field of type `seoMetadata`. Copy-paste into query strings — GROQ does not
 * support parameterised fragments natively, so this is a JS template string
 * that gets interpolated into query strings at build time.
 *
 * Usage:
 *   import { SEO_FRAGMENT } from '../lib/seo'
 *
 *   export const pageBySlugQuery = `
 *     *[_type == "page" && slug.current == $slug][0] {
 *       title,
 *       slug,
 *       ${SEO_FRAGMENT}
 *     }
 *   `
 */
export const SEO_FRAGMENT = `
  seo {
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
 * Compose into siteSettingsQuery or fetch separately.
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

// ─── SEO resolver ─────────────────────────────────────────────────────────────

/**
 * resolveSeo({ docSeo, docTitle, docType, docSlug, siteDefaults }) → SeoResolved
 *
 * Merges per-document SEO overrides with global site defaults.
 * Every page renderer calls this before rendering <SeoHead />.
 *
 * Merge rules:
 *   title        doc seo.title → "{docTitle} | {siteTitle}" template → siteDefaults.defaultMetaTitle
 *   description  doc seo.description → siteDefaults.defaultMetaDescription
 *   canonicalUrl doc seo.canonicalUrl → siteUrl + getCanonicalPath(docType, docSlug)
 *   robots       { index: !noIndex, follow: !noFollow } — defaults true/true
 *   og.title     doc seo.openGraph.title → resolved title
 *   og.desc      doc seo.openGraph.description → resolved description
 *   og.image     doc seo.openGraph.image → siteDefaults.defaultOgImage
 *   og.type      doc seo.openGraph.type → 'website'
 *
 * @param {object} params
 * @param {object|null} params.docSeo         — raw seo field from Sanity doc
 * @param {string}      params.docTitle       — document title field
 * @param {string}      params.docType        — Sanity _type (page/post/caseStudy/node)
 * @param {string}      params.docSlug        — slug.current value
 * @param {object|null} params.siteDefaults   — from siteSettingsQuery SEO fields
 * @returns {SeoResolved}
 */
export function resolveSeo({ docSeo, docTitle, docType, docSlug, siteDefaults }) {
  const site = siteDefaults ?? {}

  // ── Title ──────────────────────────────────────────────────────────────────
  const title =
    docSeo?.title ||
    (docTitle && site.siteTitle
      ? `${docTitle} | ${site.siteTitle}`
      : docTitle || site.defaultMetaTitle || null)

  // ── Description ────────────────────────────────────────────────────────────
  const description = docSeo?.description || site.defaultMetaDescription || null

  // ── Canonical URL ──────────────────────────────────────────────────────────
  let canonicalUrl = docSeo?.canonicalUrl || null
  if (!canonicalUrl && docSlug && docType) {
    const path = getCanonicalPath({ docType, slug: docSlug })
    const base = site.siteUrl ? site.siteUrl.replace(/\/$/, '') : ''
    canonicalUrl = base ? `${base}${path}` : null
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
