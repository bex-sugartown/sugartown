// GROQ queries for fetching Sanity content
//
// All queries for Sugartown CMS: site settings, pages, nodes, articles, case studies, taxonomy.
// Site-wide config (header, footer, nav, preheader) comes from siteSettingsQuery.
// Page content uses composable sections fetched via pageBySlugQuery.
//
// SEO: detail queries embed SEO_FRAGMENT from src/lib/seo.js.
// Use resolveSeo() in page components to merge doc overrides with site defaults.

import { SEO_FRAGMENT, SITE_SEO_FRAGMENT } from './seo'

// ---- TAXONOMY FRAGMENTS (centralized — use in every query that expands categories/projects) ----
// Stage 4: PERSON_FRAGMENT and TAG_FRAGMENT added alongside existing fragments.
// All five taxonomy primitives (person, project, category, tag, tool) have canonical fragments.

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
 * parent-> is projected to support optional groupByParent in buildFilterModel().
 * Usage in GROQ: categories[]->{${CATEGORY_FRAGMENT}}
 */
export const CATEGORY_FRAGMENT = `
  _id,
  name,
  "slug": slug.current,
  colorHex,
  "parent": parent->{ _id, name, "slug": slug.current }
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
 * TOOL_FRAGMENT
 * Expand a single tool reference or an array item.
 * Usage in GROQ: tools[]->{${TOOL_FRAGMENT}}
 */
export const TOOL_FRAGMENT = `
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
  "slug": slug.current,
  status,
  colorHex
`

/**
 * TAXONOMY_FRAGMENT
 * Composite canonical taxonomy projection for all top-level content types.
 * Bundles all five taxonomy primitives into a single reusable spread.
 * Usage in GROQ: spread at document level — ${TAXONOMY_FRAGMENT}
 */
export const TAXONOMY_FRAGMENT = `
  "authors": authors[]->{${PERSON_FRAGMENT}},
  "categories": categories[]->{${CATEGORY_FRAGMENT}},
  "tags": tags[]->{${TAG_FRAGMENT}},
  "projects": projects[]->{${PROJECT_FRAGMENT}},
  "tools": tools[]->{${TOOL_FRAGMENT}}
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
    footerLogo{
      asset,
      alt,
      hotspot,
      crop
    },
    primaryNav->{
      title,
      items[]{
        label,
        linkType,
        "internalPage": internalPage->{ _type, "slug": slug.current },
        "archiveRef": archiveRef->{ _type, "slug": slug.current },
        externalUrl,
        openInNewTab,
        link{ url, openInNewTab },
        children[]{
          label,
          linkType,
          "internalPage": internalPage->{ _type, "slug": slug.current },
          "archiveRef": archiveRef->{ _type, "slug": slug.current },
          externalUrl,
          openInNewTab,
          link{ url, openInNewTab }
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
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    _type,
    title,
    slug,
    content,
    "body": content[],
    excerpt,
    sections[]{
      _type,
      _key,
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        imageWidth,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        cta {
          text,
          link { url, label, openInNewTab },
          style
        },
        "ctas": ctas[]->{ _id, "label": coalesce(link.label, internalTitle), "url": link.url, "openInNewTab": link.openInNewTab, style }
      },
      _type == "textSection" => {
        heading,
        content
      },
      _type == "imageGallery" => {
        layout,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { text, link { url, label, openInNewTab }, style }
      },
      _type == "htmlSection" => {
        html,
        label
      },
      _type == "cardBuilderSection" => {
        heading,
        layout,
        cards[]{
          title,
          titleLink {
            type,
            "internalUrl": internalRef->slug.current,
            "internalType": internalRef->_type,
            externalUrl
          },
          image { asset->, alt, crop, hotspot },
          imageEffect,
          eyebrow,
          categoryPosition,
          subtitle,
          body,
          citations[]{
            text,
            link {
              type,
              "internalUrl": internalRef->slug.current,
              "internalType": internalRef->_type,
              "internalTitle": internalRef->title,
              externalUrl
            },
            linkLabel
          },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      }
    },
    aiTool,
    conversationType,
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    citations[],
    "prev": *[_type == "node" && defined(slug.current) && publishedAt < ^.publishedAt] | order(publishedAt desc)[0] {
      title, "slug": slug.current
    },
    "next": *[_type == "node" && defined(slug.current) && publishedAt > ^.publishedAt] | order(publishedAt asc)[0] {
      title, "slug": slug.current
    },
    ${SEO_FRAGMENT}
  }
`

// ---- ARTICLES ----

export const allArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    // TODO: card thumbnail — revisit in card revamp epic
    author,
    authors[]->{${PERSON_FRAGMENT}},
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    publishedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}}
  }
`

export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    content,
    "body": content[],
    excerpt,
    sections[]{
      _type,
      _key,
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        imageWidth,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        cta {
          text,
          link { url, label, openInNewTab },
          style
        },
        "ctas": ctas[]->{ _id, "label": coalesce(link.label, internalTitle), "url": link.url, "openInNewTab": link.openInNewTab, style }
      },
      _type == "textSection" => {
        heading,
        content
      },
      _type == "imageGallery" => {
        layout,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { text, link { url, label, openInNewTab }, style }
      },
      _type == "htmlSection" => {
        html,
        label
      },
      _type == "cardBuilderSection" => {
        heading,
        layout,
        cards[]{
          title,
          titleLink {
            type,
            "internalUrl": internalRef->slug.current,
            "internalType": internalRef->_type,
            externalUrl
          },
          image { asset->, alt, crop, hotspot },
          imageEffect,
          eyebrow,
          categoryPosition,
          subtitle,
          body,
          citations[]{
            text,
            link {
              type,
              "internalUrl": internalRef->slug.current,
              "internalType": internalRef->_type,
              "internalTitle": internalRef->title,
              externalUrl
            },
            linkLabel
          },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      }
    },
    author,
    authors[]->{${PERSON_FRAGMENT}},
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    publishedAt,
    updatedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    citations[],
    "prev": *[_type == "article" && defined(slug.current) && publishedAt < ^.publishedAt] | order(publishedAt desc)[0] {
      title, "slug": slug.current
    },
    "next": *[_type == "article" && defined(slug.current) && publishedAt > ^.publishedAt] | order(publishedAt asc)[0] {
      title, "slug": slug.current
    },
    ${SEO_FRAGMENT}
  }
`

// ---- PAGES ----

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
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
        imageWidth,
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
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
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
      },
      _type == "htmlSection" => {
        html,
        label
      },
      _type == "cardBuilderSection" => {
        heading,
        layout,
        cards[]{
          title,
          titleLink {
            type,
            "internalUrl": internalRef->slug.current,
            "internalType": internalRef->_type,
            externalUrl
          },
          image { asset->, alt, crop, hotspot },
          imageEffect,
          eyebrow,
          categoryPosition,
          subtitle,
          body,
          citations[]{
            text,
            link {
              type,
              "internalUrl": internalRef->slug.current,
              "internalType": internalRef->_type,
              "internalTitle": internalRef->title,
              externalUrl
            },
            linkLabel
          },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
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
    // TODO: card thumbnail — revisit in card revamp epic
    dateRange,
    publishedAt,
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    _type,
    title,
    slug,
    client,
    role,
    excerpt,
    dateRange,
    publishedAt,
    updatedAt,
    sections[]{
      _type,
      _key,
      _type == "textSection" => {
        heading,
        content
      },
      _type == "imageGallery" => {
        layout,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption
        }
      },
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        imageWidth,
        backgroundImage { asset->, alt, crop, hotspot },
        "ctas": ctas[]->{ _id, "label": coalesce(link.label, internalTitle), "url": link.url, "openInNewTab": link.openInNewTab, style }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { text, link { url, label, openInNewTab }, style }
      },
      _type == "htmlSection" => {
        html,
        label
      },
      _type == "cardBuilderSection" => {
        heading,
        layout,
        cards[]{
          title,
          titleLink {
            type,
            "internalUrl": internalRef->slug.current,
            "internalType": internalRef->_type,
            externalUrl
          },
          image { asset->, alt, crop, hotspot },
          imageEffect,
          eyebrow,
          categoryPosition,
          subtitle,
          body,
          citations[]{
            text,
            link {
              type,
              "internalUrl": internalRef->slug.current,
              "internalType": internalRef->_type,
              "internalTitle": internalRef->title,
              externalUrl
            },
            linkLabel
          },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      }
    },
    authors[]->{${PERSON_FRAGMENT}},
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    citations[],
    "prev": *[_type == "caseStudy" && defined(slug.current) && publishedAt < ^.publishedAt] | order(publishedAt desc)[0] {
      title, "slug": slug.current
    },
    "next": *[_type == "caseStudy" && defined(slug.current) && publishedAt > ^.publishedAt] | order(publishedAt asc)[0] {
      title, "slug": slug.current
    },
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
    _type,
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
    cardOptions {
      showExcerpt,
      showHeroImage,
      categoryPosition,
      imageOverride { asset-> }
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
    "articles": *[_type == "article" && defined(slug.current)] {
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

/**
 * personProfileQuery
 * Fetches a full person profile by slug, including all Stage 7 fields and
 * backreferences to articles, nodes, and caseStudies that reference this person.
 *
 * Backreferences use references(^._id) so any content type that stores
 * authors[] as reference[] to person will be picked up.
 *
 * Usage: client.fetch(personProfileQuery, { slug })
 */
export const personProfileQuery = `
  *[_type == "person" && slug.current == $slug][0] {
    _id,
    name,
    shortName,
    "slug": slug.current,
    headline,
    location,
    pronouns,
    titles,
    "primaryTitle": titles[0],
    bio,
    "expertise": expertise[]->{${CATEGORY_FRAGMENT}},
    featured,
    image {
      asset->{ _id, url },
      alt,
      hotspot,
      crop
    },
    socialLinks[]{
      platform,
      url,
      label
    },
    links[]{ label, url, kind },
    seo,
    "articles": *[_type == "article" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    },
    "nodes": *[_type == "node" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    },
    "caseStudies": *[_type == "caseStudy" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    }
  }
`

/**
 * projectDetailQuery
 * Fetches a full project detail by slug, including all project fields and
 * backreferences to articles, caseStudies, and nodes that reference this project.
 *
 * Usage: client.fetch(projectDetailQuery, { slug })
 */
export const projectDetailQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    projectId,
    name,
    "slug": slug.current,
    description,
    status,
    priority,
    colorHex,
    kpis,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    seo,
    "articles": *[_type == "article" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    },
    "caseStudies": *[_type == "caseStudy" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    },
    "nodes": *[_type == "node" && references(^._id)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      status,
      publishedAt
    }
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
    "slug": slug.current,
    description
  }
`

export const tagBySlugQuery = `
  *[_type == "tag" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
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

// ---- TOOLS ----

export const allToolsQuery = `
  *[_type == "tool"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description
  }
`

export const toolBySlugQuery = `
  *[_type == "tool" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description
  }
`

export const allProjectsQuery = `
  *[_type == "project"] | order(priority asc) {
    _id,
    projectId,
    name,
    "slug": slug.current,
    description,
    status,
    priority,
    colorHex,
    kpis
  }
`

/**
 * projectBySlugQuery
 * Fetches a project by slug.current — standard routing convention.
 * projectId (PROJ-XXX) is retained as operator-facing metadata, displayed
 * on the project detail page and Studio UI, but is not the URL key.
 */
export const projectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    projectId,
    name,
    "slug": slug.current,
    description,
    status,
    priority,
    colorHex,
    kpis
  }
`

/**
 * contentByTaxonomyQuery
 * Fetches all published content items (article, caseStudy, node) that reference
 * a given taxonomy document by its Sanity _id.
 *
 * Works for any taxonomy type — tag, category, project, person, or tool — because
 * all content types use the same canonical taxonomy fields:
 *   authors[], categories[], tags[], projects[], tools[], relatedProjects[]
 *
 * Usage:
 *   client.fetch(contentByTaxonomyQuery, { taxonomyId: taxDoc._id })
 *
 * Returns items ordered by publishedAt desc with full taxonomy projections
 * so TaxonomyChips can render on each listing card.
 */
export const contentByTaxonomyQuery = `
  *[
    _type in ["article", "caseStudy", "node"] &&
    defined(slug.current) &&
    $taxonomyId in [
      ...authors[]._ref,
      ...categories[]._ref,
      ...tags[]._ref,
      ...projects[]._ref,
      ...tools[]._ref,
      ...relatedProjects[]._ref
    ]
  ] | order(publishedAt desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    status,
    "authors": authors[]->{_id, name, "slug": slug.current},
    "categories": categories[]->{_id, name, "slug": slug.current, colorHex},
    "tags": tags[]->{_id, name, "slug": slug.current},
    "projects": projects[]->{_id, name, "slug": slug.current, colorHex},
    "tools": tools[]->{_id, name, "slug": slug.current}
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
 * For a set of contentTypes (e.g., ['node'] or ['article', 'caseStudy']),
 * returns all items with their taxonomy references expanded.
 * Used by buildFilterModel() to derive available facet options + counts.
 *
 * Fetches all five taxonomy primitives: authors, categories, tags, projects, tools.
 * Also fetches relatedProjects for backward compat with legacy data.
 */
export const facetsRawQuery = `
  *[_type in $contentTypes && defined(slug.current)] {
    _id,
    _type,
    "slug": slug.current,
    client,
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
