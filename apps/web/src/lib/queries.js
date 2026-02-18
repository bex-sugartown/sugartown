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

/**
 * CATEGORY_FRAGMENT
 * Expand a single category reference or an array item.
 * category stores color via @sanity/color-input: color.hex → aliased to colorHex.
 * Usage in GROQ: categories[]->{${CATEGORY_FRAGMENT}}
 */
export const CATEGORY_FRAGMENT = `
  _id,
  name,
  "slug": slug.current,
  colorHex
`

/**
 * PROJECT_FRAGMENT
 * Expand a single project reference or an array item.
 * project stores colorHex as a plain hex string field.
 * Usage in GROQ: relatedProjects[]->{${PROJECT_FRAGMENT}}
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
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{
      name,
      slug
    }
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
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{
      name,
      slug
    },
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
    publishedAt,
    categories[]->{${CATEGORY_FRAGMENT}}
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
    publishedAt,
    updatedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{
      name,
      slug
    },
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
    categories[]->{${CATEGORY_FRAGMENT}}
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
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{
      name,
      slug
    },
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    ${SEO_FRAGMENT}
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
