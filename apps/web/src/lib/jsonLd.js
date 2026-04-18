/**
 * jsonLd.js — schema.org JSON-LD generation utilities (SUG-58)
 *
 * Usage:
 *   import { generateJsonLd } from '../lib/jsonLd'
 *   const jsonLd = generateJsonLd(doc, siteSettings)
 *   return <SeoHead seo={seo} jsonLd={jsonLd} />
 *
 * generateJsonLd() returns a JSON-LD @graph containing:
 *   - Organization (always, site-wide)
 *   - WebSite (always, site-wide)
 *   - Article | Person | WebPage | ProfilePage (per doc._type, if doc provided)
 *
 * Pass doc=null for pages without a Sanity document (e.g. archive pages).
 */
import { getCanonicalPath } from './routes'

// ─── helpers ──────────────────────────────────────────────────────────────────

function siteBase(siteSettings) {
  return (siteSettings?.siteUrl || 'https://sugartown.io').replace(/\/$/, '')
}

function resolveSlug(slug) {
  if (!slug) return null
  return typeof slug === 'string' ? slug : (slug.current ?? null)
}

// ─── site-level schemas ───────────────────────────────────────────────────────

function buildOrganization(siteSettings, base) {
  const logoUrl = siteSettings?.defaultOgImage?.asset?.url ?? null
  return {
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: siteSettings?.siteTitle || 'Sugartown',
    url: base,
    ...(siteSettings?.tagline ? { description: siteSettings.tagline } : {}),
    ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
  }
}

function buildWebSite(siteSettings, base) {
  return {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: base,
    name: siteSettings?.siteTitle || 'Sugartown',
    publisher: { '@id': `${base}/#organization` },
  }
}

// ─── page-level schemas ───────────────────────────────────────────────────────

function buildAuthorRef(person, base) {
  const slug = resolveSlug(person.slug)
  const path = slug ? getCanonicalPath({ docType: 'person', slug }) : null
  return {
    '@type': 'Person',
    name: person.name,
    ...(path ? { url: `${base}${path}` } : {}),
  }
}

function buildArticle(doc, base) {
  const slug = resolveSlug(doc.slug)
  const path = slug ? getCanonicalPath({ docType: doc._type, slug }) : null
  const authors = (doc.authors || []).map(a => buildAuthorRef(a, base))
  return {
    '@type': 'Article',
    headline: doc.title,
    ...(doc.excerpt ? { description: doc.excerpt } : {}),
    ...(path ? { url: `${base}${path}` } : {}),
    ...(doc.publishedAt ? { datePublished: doc.publishedAt } : {}),
    ...(doc.updatedAt ? { dateModified: doc.updatedAt } : {}),
    ...(authors.length === 1 ? { author: authors[0] } : {}),
    ...(authors.length > 1 ? { author: authors } : {}),
    publisher: { '@id': `${base}/#organization` },
    isPartOf: { '@id': `${base}/#website` },
  }
}

function buildPerson(doc, base) {
  const slug = resolveSlug(doc.slug)
  const path = slug ? getCanonicalPath({ docType: 'person', slug }) : null
  const sameAs = (doc.socialLinks || []).map(l => l.url).filter(Boolean)
  const imageUrl = doc.image?.asset?.url ?? null
  return {
    '@type': 'Person',
    name: doc.name,
    ...(doc.headline ? { description: doc.headline } : {}),
    ...(doc.titles?.[0] ? { jobTitle: doc.titles[0] } : {}),
    ...(path ? { url: `${base}${path}` } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(doc.location ? { address: doc.location } : {}),
    ...(doc.expertise?.length ? { knowsAbout: doc.expertise.map(e => e.name) } : {}),
  }
}

const PROFILE_PAGE_SLUGS = new Set(['about', 'services'])

function buildPage(doc, base) {
  const slug = resolveSlug(doc.slug)
  const path = slug ? getCanonicalPath({ docType: 'page', slug }) : null
  const isProfile = slug && PROFILE_PAGE_SLUGS.has(slug)
  return {
    '@type': isProfile ? 'ProfilePage' : 'WebPage',
    name: doc.title,
    ...(path ? { url: `${base}${path}` } : {}),
    isPartOf: { '@id': `${base}/#website` },
    publisher: { '@id': `${base}/#organization` },
  }
}

// ─── main export ──────────────────────────────────────────────────────────────

/**
 * generateJsonLd(doc, siteSettings) → JSON-LD @graph object
 *
 * Returns a single JSON-LD object with @context and @graph.
 * Pass directly as the jsonLd prop on SeoHead.
 * Pass doc=null for pages without a specific content document.
 */
export function generateJsonLd(doc, siteSettings) {
  const base = siteBase(siteSettings)
  const graph = [
    buildOrganization(siteSettings, base),
    buildWebSite(siteSettings, base),
  ]

  if (doc?._type) {
    let pageSchema = null
    switch (doc._type) {
      case 'article':
      case 'node':
      case 'caseStudy':
        pageSchema = buildArticle(doc, base)
        break
      case 'person':
        pageSchema = buildPerson(doc, base)
        break
      case 'page':
        pageSchema = buildPage(doc, base)
        break
    }
    if (pageSchema) graph.push(pageSchema)
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
