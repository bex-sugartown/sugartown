// GROQ queries for fetching Sanity content
//
// All queries for Sugartown CMS: site settings, pages, nodes, posts, case studies, taxonomy.
// Site-wide config (header, footer, nav, preheader) comes from siteSettingsQuery.
// Page content uses composable sections fetched via pageBySlugQuery.
//
// SEO: detail queries embed SEO_FRAGMENT from src/lib/seo.js.
// Use resolveSeo() in page components to merge doc overrides with site defaults.

import { SEO_FRAGMENT, SITE_SEO_FRAGMENT } from './seo'

// ---- TAXONOMY FRAGMENTS (centralized — use in every query that expands categories/projects) ----
// Stage 4: PERSON_FRAGMENT and TAG_FRAGMENT added alongside existing fragments.
// All four taxonomy primitives (person, project, category, tag) now have canonical fragments.

/**
 * PERSON_FRAGMENT
 * Expand a single person (author) reference or an array item.
 * Usage in GROQ: authors[]->{${PERSON_FRAGMENT}}
 */
export const PERSON_FRAGMENT = `
  _id,
  name,
  shortName,
  "slug": slug.current,
  titles,
  "primaryTitle": titles[0],
  image{
    asset->{_id, url},
    alt
  },
  links[]{
    label,
    url,
    kind
  }
`

/**
 * CATEGORY_FRAGMENT
 * Expand a single category reference or an array item.
 * category stores colorHex as a plain hex string field (Stage 2).
 * Usage in GROQ: categories[]->{${CATEGORY_FRAGMENT}}
 */
export const CATEGORY_FRAGMENT = `
  _id,
  name,
  "slug": slug.current,
  colorHex
`

/**
 * TAG_FRAGMENT
 * Expand a single tag reference or an array item.
 * Usage in GROQ: tags[]->{${TAG_FRAGMENT}}
 */
export const TAG_FRAGMENT = `
  _id,
  name,
  "slug": slug.current
`

/**
 * PROJECT_FRAGMENT
 * Expand a single project reference or an array item.
 * project stores colorHex as a plain hex string field.
 * Usage in GROQ: projects[]->{${PROJECT_FRAGMENT}}
 */
export const PROJECT_FRAGMENT = `
  _id,
  projectId,
  name,
  status,
  colorHex
`

// ---- SITE SETTINGS (header, footer, nav, preheader, branding) ----
export const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    siteTitle,
    tagline,
    siteLogo{
      asset,
      alt,
      hotspot,
      crop
    },
    favicon{
      asset
    },
    primaryNav->{
      title,
      items[]{
        label,
        link{
          url,
          label,
          openInNewTab
        },
        children[]{
          label,
          link{
            url,
            label,
            openInNewTab
          }
        }
      }
    },
    headerCta->{
      _id,
      internalTitle,
      link{
        url,
        label,
        openInNewTab
      },
      style
    },
    preheader->{
      _id,
      title,
      message,
      link{
        url,
        label,
        openInNewTab
      },
      backgroundColor,
      publishAt,
      unpublishAt,
      timezone
    },
    footerColumns[]->{
      title,
      items[]{
        label,
        link{
          url,
          label,
          openInNewTab
        }
      }
    },
    socialLinks[]{
      url,
      label,
      openInNewTab,
      icon
    },
    copyrightText,
    // SEO defaults (used by resolveSeo() as fallback for all pages)
    ${SITE_SEO_FRAGMENT}
  }
`

// ---- KNOWLEDGE GRAPH NODES ----

export const allNodesQuery = `
  *[_type == "node"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    aiTool,
    conversationType,
    status,
    challenge,
    insight,
    publishedAt,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

export const nodeBySlugQuery = `
  *[_type == "node" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    content,
    excerpt,
    aiTool,
    conversationType,
    challenge,
    insight,
    actionItem,
    status,
    publishedAt,
    updatedAt,
    conversationLink,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    ${SEO_FRAGMENT}
  }
`

// ---- BLOG POSTS ----

export const allPostsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage {
      asset->,
      alt,
      caption
    },
    author,
    authors[]->{${PERSON_FRAGMENT}},
    publishedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    content,
    excerpt,
    featuredImage {
      asset->,
      alt,
      caption,
      credit
    },
    author,
    authors[]->{${PERSON_FRAGMENT}},
    publishedAt,
    updatedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    ${SEO_FRAGMENT}
  }
`

// ---- PAGES ----

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    template,
    sections[]{
      _type,
      _key,
      // Support both "heroSection" (deployed) and "hero" (local schema)
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        // Support both embedded cta object and ctas array of references
        cta {
          text,
          link {
            url,
            label,
            openInNewTab
          },
          style
        },
        "ctas": ctas[]->{
          _id,
          "label": coalesce(link.label, internalTitle),
          "url": link.url,
          "openInNewTab": link.openInNewTab,
          style
        }
      },
      _type == "textSection" => {
        heading,
        content
      },
      _type == "imageGallery" => {
        layout,
        images[] {
          asset->,
          alt,
          caption
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] {
          text,
          link {
            url,
            label,
            openInNewTab
          },
          style
        }
      }
    },
    ${SEO_FRAGMENT}
  }
`

// ---- CASE STUDIES ----

export const allCaseStudiesQuery = `
  *[_type == "caseStudy"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    client,
    role,
    excerpt,
    featuredImage {
      asset->,
      alt
    },
    dateRange,
    publishedAt,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

export const caseStudyBySlugQuery = `
  *[_type == "caseStudy" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    role,
    excerpt,
    featuredImage {
      asset->,
      alt,
      caption,
      credit
    },
    dateRange,
    publishedAt,
    updatedAt,
    content,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    ${SEO_FRAGMENT}
  }
`

// ---- ARCHIVE PAGES ----

/**
 * archivePageBySlugQuery
 * Fetches an archivePage doc by its slug (no slashes).
 * Used by ArchivePage to drive heading, description, SEO, and contentTypes.
 * Returns null if unpublished → frontend renders 404.
 */
export const archivePageBySlugQuery = `
  *[_type == "archivePage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    contentTypes,
    listStyle,
    sortBy,
    itemsPerPage,
    hero {
      heading,
      subheading
    },
    filterConfig {
      facets[] {
        facet,
        label,
        enabled,
        order,
        selection,
        defaultSelectedSlugs
      }
    },
    ${SEO_FRAGMENT}
  }
`

/**
 * allPublishedArchivePagesQuery
 * Returns all published archivePage docs with their slugs + contentTypes.
 * Used by nav validation and validate-urls.js.
 */
export const allPublishedArchivePagesQuery = `
  *[_type == "archivePage"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    contentTypes
  }
`

// ---- URL VALIDATION (dev-time only) ----
// Fetches minimal slug + type data for all published docs that require unique URLs.
// Used by scripts/validate-urls.js

export const allPublishedSlugsQuery = `
  {
    "pages": *[_type == "page" && defined(slug.current)] {
      _id,
      _type,
      title,
      "slug": slug.current
    },
    "posts": *[_type == "post" && defined(slug.current)] {
      _id,
      _type,
      title,
      "slug": slug.current
    },
    "caseStudies": *[_type == "caseStudy" && defined(slug.current)] {
      _id,
      _type,
      title,
      "slug": slug.current
    },
    "nodes": *[_type == "node" && defined(slug.current)] {
      _id,
      _type,
      title,
      "slug": slug.current
    }
  }
`

// ---- TAXONOMY ----

// ---- PEOPLE ----

export const allPersonsQuery = `
  *[_type == "person"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    titles,
    "primaryTitle": titles[0],
    image{ asset->{ _id, url }, alt }
  }
`

export const personBySlugQuery = `
  *[_type == "person" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    titles,
    bio,
    image {
      asset->{ _id, url },
      alt
    },
    links[]{ label, url, kind }
  }
`

// ---- TAXONOMY BROWSING ----

export const allCategoriesQuery = `
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    colorHex,
    description
  }
`

export const allTagsQuery = `
  *[_type == "tag"] | order(name asc) {
    _id,
    name,
    slug
  }
`

export const tagBySlugQuery = `
  *[_type == "tag" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description
  }
`

export const categoryBySlugQuery = `
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    colorHex
  }
`

export const allProjectsQuery = `
  *[_type == "project"] | order(priority asc) {
    _id,
    projectId,
    name,
    description,
    status,
    priority,
    colorHex,
    kpis
  }
`

export const projectByIdQuery = `
  *[_type == "project" && projectId == $projectId][0] {
    _id,
    projectId,
    name,
    description,
    status,
    priority,
    colorHex,
    kpis
  }
`

// ---- DERIVED FACET AGGREGATION (Stage 4: Filter Model) ----
//
// These queries fetch raw taxonomy references from content items of a given type.
// Counts are aggregated in the frontend buildFilterModel() function (see filterModel.js)
// rather than in GROQ, which keeps the queries fast and aggregation logic testable.
//
// Usage: pass contentTypes[] from the archivePage.contentTypes field.
// Each query returns ALL items with their taxonomy arrays expanded.
// buildFilterModel() then derives per-facet option counts from this data.

/**
 * FACETS_RAW_QUERY
 * For a set of contentTypes (e.g., ['node'] or ['post', 'caseStudy']),
 * returns all items with their taxonomy references expanded.
 * Used by buildFilterModel() to derive available facet options + counts.
 *
 * Fetches all four taxonomy primitives: authors, categories, tags, projects.
 * Also fetches relatedProjects for backward compat with legacy data.
 */
export const facetsRawQuery = `
  *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    "slug": slug.current,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

/**
 * archivePageWithFilterConfigQuery
 * Fetches an archivePage document with its filterConfig and contentTypes.
 * Used by validate-filters.js and buildFilterModel() entry point.
 */
export const archivePageWithFilterConfigQuery = `
  *[_type == "archivePage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    contentTypes,
    filterConfig {
      facets[] {
        facet,
        label,
        enabled,
        order,
        selection,
        defaultSelectedSlugs
      }
    }
  }
`
