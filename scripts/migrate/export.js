#!/usr/bin/env node
/**
 * migrate:export — Step 1: Export all live content from WordPress
 *
 * Output: artifacts/wp_export.ndjson
 *
 * Each exported record:
 *   { wpId, postType, status, slug, permalink, title, excerpt,
 *     rawHtml, featuredMediaUrl, imageUrls[], categories[], tags[],
 *     authorLogin, authorName, publishedAt, modifiedAt, seoTitle, seoDesc }
 *
 * Content types exported:
 *   - posts          → article
 *   - pages          → page
 *   - gems (CPT)     → node
 *   - case-studies   → caseStudy
 *   - categories     → category taxonomy
 *   - tags           → tag taxonomy
 *   - users/authors  → person
 *
 * Usage:
 *   node scripts/migrate/export.js
 *   pnpm migrate:export   (from repo root)
 *
 * Requirements:
 *   WP_BASE_URL env var (default: https://sugartown.io)
 *   WP REST API must be publicly accessible for published content
 */

import {
  banner, section, ok, warn, info, fail,
  getWpBase, wpFetchAll,
  writeNdjson, writeCsv, ensureDir,
  ARTIFACTS_DIR, extractImageUrls,
} from './lib.js'
import { resolve } from 'path'

const OUTPUT_FILE         = resolve(ARTIFACTS_DIR, 'wp_export.ndjson')
const SLUG_COLLISION_FILE = resolve(ARTIFACTS_DIR, 'slug_collision_report.csv')

// ─── WP REST routes for each content type ────────────────────────────────────
// Update these if your WP instance uses different CPT REST slugs.
// Verify available types at: GET /wp-json/wp/v2/types

const POST_TYPES = [
  { restRoute: 'posts',         sanityType: 'article',   wpType: 'post'       },
  { restRoute: 'pages',         sanityType: 'page',       wpType: 'page'       },
  { restRoute: 'gems',          sanityType: 'node',       wpType: 'gem'        },  // ← confirm CPT key with WP admin
  { restRoute: 'case-studies',  sanityType: 'caseStudy',  wpType: 'case_study' },  // ← confirm CPT key with WP admin
]

const TAXONOMY_TYPES = [
  { restRoute: 'categories',          sanityType: 'category', wpType: 'category'           },
  { restRoute: 'tags',                sanityType: 'tag',      wpType: 'tag'                },
  // Uncomment and correct the base if there's a case-study-specific category taxonomy:
  // { restRoute: 'case-study-categories', sanityType: 'category', wpType: 'case_study_category' },
]

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchUsers(wpBase) {
  try {
    const users = await wpFetchAll(`${wpBase}/wp-json/wp/v2/users`)
    return new Map(users.map((u) => [u.id, { login: u.slug, name: u.name, email: u.email }]))
  } catch (err) {
    warn(`Could not fetch WP users: ${err.message} — author info will be omitted`)
    return new Map()
  }
}

/**
 * Extract Yoast SEO (most common WP SEO plugin) meta from _yoast_wpseo_* fields.
 * The WP REST API exposes custom meta under post.meta if the plugin enables it.
 * If Yoast meta isn't present, falls back to empty strings.
 */
function extractSeo(post) {
  const meta = post.meta ?? {}
  // Yoast SEO fields (registered with REST visibility)
  return {
    seoTitle: meta._yoast_wpseo_title ?? meta.yoast_wpseo_title ?? '',
    seoDesc:  meta._yoast_wpseo_metadesc ?? meta.yoast_wpseo_metadesc ?? '',
  }
}

async function fetchFeaturedMediaUrl(wpBase, mediaId) {
  if (!mediaId) return null
  try {
    const media = await fetch(`${wpBase}/wp-json/wp/v2/media/${mediaId}`, {
      headers: { 'User-Agent': 'sugartown-migration/1.0', Accept: 'application/json' }
    })
    if (!media.ok) return null
    const data = await media.json()
    return data.source_url ?? data.guid?.rendered ?? null
  } catch {
    return null
  }
}

// ─── Export post types ────────────────────────────────────────────────────────

async function exportPostType(wpBase, { restRoute, sanityType, wpType }, usersMap) {
  const endpoint = `${wpBase}/wp-json/wp/v2/${restRoute}`
  info(`Fetching ${wpType} (/${restRoute})...`)

  let posts
  try {
    posts = await wpFetchAll(endpoint, { status: 'publish', _embed: 'true' })
  } catch (err) {
    warn(`HTTP error fetching ${wpType}: ${err.message} — skipping this type`)
    return []
  }

  info(`  → ${posts.length} published ${wpType}(s) found`)

  const records = []
  for (const post of posts) {
    const rawHtml = post.content?.rendered ?? ''
    const imageUrls = extractImageUrls(rawHtml)

    // Featured media — prefer _embedded, fall back to API call
    let featuredMediaUrl = null
    const embedded = post._embedded?.['wp:featuredmedia']?.[0]
    if (embedded?.source_url) {
      featuredMediaUrl = embedded.source_url
    } else if (post.featured_media) {
      featuredMediaUrl = await fetchFeaturedMediaUrl(wpBase, post.featured_media)
    }

    // Author info
    const authorId = post.author
    const author = usersMap.get(authorId) ?? { login: String(authorId), name: '', email: '' }

    // Taxonomy terms
    const termCategoryIds = post.categories ?? []
    const termTagIds      = post.tags ?? []

    const { seoTitle, seoDesc } = extractSeo(post)

    records.push({
      wpId:             post.id,
      postType:         wpType,
      sanityType,
      status:           post.status,
      slug:             post.slug,
      permalink:        post.link,
      title:            post.title?.rendered ?? '',
      excerpt:          (post.excerpt?.rendered ?? '').replace(/<[^>]+>/g, '').trim(),
      rawHtml,
      featuredMediaUrl,
      imageUrls,
      termCategoryIds,
      termTagIds,
      authorLogin:      author.login,
      authorName:       author.name,
      publishedAt:      post.date_gmt ? `${post.date_gmt}Z` : null,
      modifiedAt:       post.modified_gmt ? `${post.modified_gmt}Z` : null,
      seoTitle,
      seoDesc,
    })
  }

  return records
}

// ─── Export taxonomy terms ────────────────────────────────────────────────────

async function exportTaxonomy(wpBase, { restRoute, sanityType, wpType }) {
  const endpoint = `${wpBase}/wp-json/wp/v2/${restRoute}`
  info(`Fetching ${wpType} terms (/${restRoute})...`)

  let terms
  try {
    terms = await wpFetchAll(endpoint, { hide_empty: 'false' })
  } catch (err) {
    warn(`HTTP error fetching ${wpType} terms: ${err.message} — skipping`)
    return []
  }

  info(`  → ${terms.length} ${wpType} term(s) found`)

  return terms.map((term) => ({
    wpId:        term.id,
    postType:    wpType,
    sanityType,
    slug:        term.slug,
    name:        term.name,
    description: term.description ?? '',
    permalink:   term.link ?? '',
    count:       term.count ?? 0,
  }))
}

// ─── Slug collision detection ─────────────────────────────────────────────────

/**
 * Detect slug collisions within namespaces that share URL space.
 * Sanity articles, nodes, caseStudies each have their own /articles|nodes|case-studies
 * namespace — no cross-type collision possible there.
 * Pages share /:slug with nothing else, so collision is only within the same type.
 *
 * The only collision risk is:
 *   - Two records of the same sanityType with the same slug
 *   - A page slug colliding with an article/node/caseStudy slug (they use different prefixes, so no conflict)
 *
 * We report intra-type collisions only.
 */
function detectCollisions(allRecords) {
  const byTypeAndSlug = new Map()
  for (const r of allRecords) {
    if (!r.slug || !r.sanityType) continue
    const key = `${r.sanityType}::${r.slug}`
    if (!byTypeAndSlug.has(key)) byTypeAndSlug.set(key, [])
    byTypeAndSlug.get(key).push(r)
  }
  const collisions = []
  for (const [key, records] of byTypeAndSlug.entries()) {
    if (records.length > 1) {
      const [type, slug] = key.split('::')
      for (const r of records) {
        collisions.push({
          sanityType: type,
          slug,
          wpId:       r.wpId,
          permalink:  r.permalink ?? r.slug,
          resolution: 'PENDING — use most-recent publishedAt; suffix older with -<wpId>',
        })
      }
    }
  }
  return collisions
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  banner('Sugartown — WP Export (Step 1 of 5)')

  const wpBase = getWpBase()
  info(`Source: ${wpBase}`)
  info(`Output: ${OUTPUT_FILE}`)

  // Connectivity check
  info('\nChecking WP REST API...')
  try {
    await fetch(`${wpBase}/wp-json/`)
    ok('WP REST API reachable')
  } catch (err) {
    fail(`Cannot reach ${wpBase}/wp-json/ — ${err.message}`)
    fail('Set WP_BASE_URL env var if site is at a different URL')
    process.exit(1)
  }

  ensureDir(ARTIFACTS_DIR)

  // Fetch users/authors first — needed to populate authorLogin on posts
  section('Authors')
  const usersMap = await fetchUsers(wpBase)
  info(`  → ${usersMap.size} user(s) found`)

  // Export post types
  section('Post Types')
  const postRecords = []
  for (const cfg of POST_TYPES) {
    const records = await exportPostType(wpBase, cfg, usersMap)
    postRecords.push(...records)
  }

  // Export taxonomy terms
  section('Taxonomy Terms')
  const termRecords = []
  for (const cfg of TAXONOMY_TYPES) {
    const records = await exportTaxonomy(wpBase, cfg)
    termRecords.push(...records)
  }

  // Export users as person records
  section('People (Authors)')
  const personRecords = []
  for (const [wpId, u] of usersMap.entries()) {
    personRecords.push({
      wpId,
      postType:    'user',
      sanityType:  'person',
      slug:        u.login,
      name:        u.name,
      email:       u.email,
      permalink:   `${wpBase}/author/${u.login}/`,
    })
  }
  info(`  → ${personRecords.length} person record(s) from WP users`)

  // Combine and write
  const allRecords = [...postRecords, ...termRecords, ...personRecords]
  writeNdjson(OUTPUT_FILE, allRecords)

  // Slug collision report
  section('Slug Collision Detection')
  const collisions = detectCollisions(allRecords)
  if (collisions.length === 0) {
    ok('No slug collisions detected')
  } else {
    warn(`${collisions.length} collision(s) found — see ${SLUG_COLLISION_FILE}`)
    writeCsv(SLUG_COLLISION_FILE, collisions, ['sanityType', 'slug', 'wpId', 'permalink', 'resolution'])
    warn('Review slug_collision_report.csv before running migrate:transform')
  }

  // Summary
  section('Summary')
  ok(`${postRecords.length} content records exported`)
  ok(`${termRecords.length} taxonomy term records exported`)
  ok(`${personRecords.length} person records exported`)
  ok(`Total: ${allRecords.length} records → ${OUTPUT_FILE}`)
  console.log()
  info('Next step: pnpm migrate:images  (then migrate:transform)')
  console.log('══════════════════════════════════════════════\n')
}

main().catch((err) => {
  fail(`Unexpected error: ${err.message}`)
  console.error(err)
  process.exit(1)
})
