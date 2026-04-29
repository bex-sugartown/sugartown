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
 * category stores colorHex as a @sanity/color-input object; projected as .hex string.
 * parent-> is projected to support optional groupByParent in buildFilterModel().
 * Usage in GROQ: categories[]->{${CATEGORY_FRAGMENT}}
 */
export const CATEGORY_FRAGMENT = `
  _id,
  name,
  "slug": slug.current,
  "colorHex": colorHex.hex,
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
 * project stores colorHex as a @sanity/color-input object; projected as .hex string.
 * Usage in GROQ: projects[]->{${PROJECT_FRAGMENT}}
 */
export const PROJECT_FRAGMENT = `
  _id,
  projectId,
  name,
  "slug": slug.current,
  status,
  "colorHex": colorHex.hex
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

// ---- LINK ITEM RESOLUTION ----
// Resolves a linkItem object to the flat { url, label, openInNewTab } shape
// that web components expect. Handles both internal refs and external URLs.
// Usage: "url": ${LINKITEM_URL}, or spread the full fragment.
//
// For internal refs the URL is built from the referenced doc's _type + slug.
// page and archivePage are root-level (/:slug), others have type prefixes.

const LINKITEM_URL_EXPR = `select(
  link.type == "internal" => select(
    link.internalRef->_type == "page" => "/" + link.internalRef->slug.current,
    link.internalRef->_type == "archivePage" => "/" + link.internalRef->slug.current,
    link.internalRef->_type == "article" => "/articles/" + link.internalRef->slug.current,
    link.internalRef->_type == "caseStudy" => "/case-studies/" + link.internalRef->slug.current,
    link.internalRef->_type == "node" => "/knowledge-graph/" + link.internalRef->slug.current,
    "/" + link.internalRef->slug.current
  ),
  link.type == "external" => link.externalUrl
)`

/**
 * LINKITEM_URL_EXPR_BARE — same routing logic as LINKITEM_URL_EXPR but with
 * bare field paths (no `link.` prefix). Use inside a `link { ... }` sub-projection
 * where the linkItem fields are at root level of the projection context.
 */
const LINKITEM_URL_EXPR_BARE = `select(
  type == "internal" => select(
    internalRef->_type == "page" => "/" + internalRef->slug.current,
    internalRef->_type == "archivePage" => "/" + internalRef->slug.current,
    internalRef->_type == "article" => "/articles/" + internalRef->slug.current,
    internalRef->_type == "caseStudy" => "/case-studies/" + internalRef->slug.current,
    internalRef->_type == "node" => "/knowledge-graph/" + internalRef->slug.current,
    "/" + internalRef->slug.current
  ),
  type == "external" => externalUrl
)`

/**
 * LINKITEM_FRAGMENT — resolves linkItem to flat shape for web components.
 * Use inside a ctaButtonDoc or any doc that has a `link` field of type linkItem.
 * Produces: { url, label, openInNewTab }
 */
export const LINKITEM_FRAGMENT = `
  "url": ${LINKITEM_URL_EXPR},
  "label": link.label,
  "openInNewTab": link.openInNewTab
`

// ---- PORTABLE TEXT INTERNAL LINK RESOLUTION ----
// When PortableText content contains link marks with type === 'internal',
// the markDefs need dereferencing to resolve internalRef → _type + slug.
// This projection is spread inside content[] array projections.

const PT_CONTENT_PROJECTION = `[] {
  ...,
  // Project richImage asset metadata dimensions so InlineImage can render
  // width/height attrs on <img> for CLS prevention (SUG-63 Phase 1b).
  // richImage.asset is an image object with its own asset ref — dereference
  // the inner ref (asset.asset->) per MEMORY.md nested image rule.
  _type == "richImage" => {
    ...,
    "dimensions": asset.asset->metadata.dimensions
  },
  markDefs[] {
    ...,
    _type == "link" => {
      ...,
      "internalType": internalRef->_type,
      "internalSlug": internalRef->slug.current
    }
  }
}`

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
      ${LINKITEM_FRAGMENT},
      style
    },
    preheader->{
      _id,
      title,
      message,
      ${LINKITEM_FRAGMENT},
      backgroundColor,
      publishAt,
      unpublishAt,
      timezone
    },
    footerColumns[]->{
      title,
      header,
      items[]{
        label,
        linkType,
        "internalPage": internalPage->{ _type, "slug": slug.current },
        "archiveRef": archiveRef->{ _type, "slug": slug.current },
        externalUrl,
        openInNewTab,
        link{ url, openInNewTab }
      }
    },
    socialLinks[]{
      platform,
      url,
      label,
      "icon": platform
    },
    copyrightText,
    footerToolchain[]->{ _id, name, "slug": slug.current },
    licenseLabel,
    licenseUrl,
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
    "cardImageUrl": cardImage.asset->url,
    "cardImageAlt": cardImage.alt,
    aiTool,
    conversationType,
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    "content": content${PT_CONTENT_PROJECTION},
    "body": content${PT_CONTENT_PROJECTION},
    excerpt,
    sections[]{
      _type,
      _key,
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        eyebrow,
        imageTreatment,
        imageWidth,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        cta {
          text,
          "url": ${LINKITEM_URL_EXPR}, "label": link.label, "openInNewTab": link.openInNewTab,
          style
        },
        "ctas": ctas[]{ "label": coalesce(link.label, link.internalRef->title, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style },
        showStatRail
      },
      _type == "textSection" => {
        heading,
        "content": content${PT_CONTENT_PROJECTION}
      },
      _type == "imageGallery" => {
        heading,
        layout,
        treatment,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption,
          credit,
          "link": link {
            type,
            "url": ${LINKITEM_URL_EXPR_BARE},
            label,
            openInNewTab
          },
          "legacyLinkUrl": linkUrl
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { "text": coalesce(link.label, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style }
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
          overlay,
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
          tools[]->{ _id, "title": name, slug },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      },
      _type == "mermaidSection" => {
        code,
        caption,
        width
      },
      _type == "accordionSection" => {
        heading,
        multi,
        items[] {
          _key,
          title,
          "content": content${PT_CONTENT_PROJECTION}
        }
      },
      _type == "trustReportSection" => {
        reportType
      }
    },
    aiTool,
    conversationType,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    status,
    publishedAt,
    updatedAt,
    conversationLink,
    aiDisclosure,
    authors[]->{${PERSON_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    related[]->{_id, _type, title, "slug": slug.current},
    readingTime,
    series->{_id, title, "slug": slug.current},
    partNumber,
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
    "cardImageUrl": cardImage.asset->url,
    "cardImageAlt": cardImage.alt,
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
    "content": content${PT_CONTENT_PROJECTION},
    "body": content${PT_CONTENT_PROJECTION},
    excerpt,
    sections[]{
      _type,
      _key,
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        eyebrow,
        imageTreatment,
        imageWidth,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        cta {
          text,
          "url": ${LINKITEM_URL_EXPR}, "label": link.label, "openInNewTab": link.openInNewTab,
          style
        },
        "ctas": ctas[]{ "label": coalesce(link.label, link.internalRef->title, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style },
        showStatRail
      },
      _type == "textSection" => {
        heading,
        "content": content${PT_CONTENT_PROJECTION}
      },
      _type == "imageGallery" => {
        heading,
        layout,
        treatment,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption,
          credit,
          "link": link {
            type,
            "url": ${LINKITEM_URL_EXPR_BARE},
            label,
            openInNewTab
          },
          "legacyLinkUrl": linkUrl
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { "text": coalesce(link.label, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style }
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
          overlay,
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
          tools[]->{ _id, "title": name, slug },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      },
      _type == "mermaidSection" => {
        code,
        caption,
        width
      },
      _type == "accordionSection" => {
        heading,
        multi,
        items[] {
          _key,
          title,
          "content": content${PT_CONTENT_PROJECTION}
        }
      },
      _type == "trustReportSection" => {
        reportType
      }
    },
    author,
    aiDisclosure,
    authors[]->{${PERSON_FRAGMENT}},
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    publishedAt,
    updatedAt,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    related[]->{_id, _type, title, "slug": slug.current},
    readingTime,
    series->{_id, title, "slug": slug.current},
    partNumber,
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
        eyebrow,
        imageTreatment,
        imageWidth,
        backgroundImage {
          asset->,
          alt,
          crop,
          hotspot
        },
        // Support both embedded cta object and ctas array of inline buttons
        cta {
          text,
          "url": ${LINKITEM_URL_EXPR}, "label": link.label, "openInNewTab": link.openInNewTab,
          style
        },
        "ctas": ctas[]{
          "label": coalesce(link.label, link.internalRef->title, text),
          "url": ${LINKITEM_URL_EXPR},
          "openInNewTab": link.openInNewTab,
          style
        },
        showStatRail
      },
      _type == "textSection" => {
        heading,
        "content": content${PT_CONTENT_PROJECTION}
      },
      _type == "imageGallery" => {
        heading,
        layout,
        treatment,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption,
          credit,
          "link": link {
            type,
            "url": ${LINKITEM_URL_EXPR_BARE},
            label,
            openInNewTab
          },
          "legacyLinkUrl": linkUrl
        }
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { "text": coalesce(link.label, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style }
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
          overlay,
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
          tools[]->{ _id, "title": name, slug },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      },
      _type == "mermaidSection" => {
        code,
        caption,
        width
      },
      _type == "accordionSection" => {
        heading,
        multi,
        items[] {
          _key,
          title,
          "content": content${PT_CONTENT_PROJECTION}
        }
      },
      _type == "trustReportSection" => {
        reportType
      }
    },
    publishedAt,
    authors[]->{${PERSON_FRAGMENT}},
    aiDisclosure,
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    "cardImageUrl": cardImage.asset->url,
    "cardImageAlt": cardImage.alt,
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
    employer,
    contractType,
    excerpt,
    dateRange,
    publishedAt,
    updatedAt,
    sections[]{
      _type,
      _key,
      _type == "textSection" => {
        heading,
        "content": content${PT_CONTENT_PROJECTION}
      },
      _type == "imageGallery" => {
        heading,
        layout,
        treatment,
        images[] {
          "asset": asset.asset->,
          "hotspot": asset.hotspot,
          "crop": asset.crop,
          alt,
          caption,
          credit,
          "link": link {
            type,
            "url": ${LINKITEM_URL_EXPR_BARE},
            label,
            openInNewTab
          },
          "legacyLinkUrl": linkUrl
        }
      },
      _type in ["heroSection", "hero"] => {
        heading,
        subheading,
        eyebrow,
        imageTreatment,
        imageWidth,
        backgroundImage { asset->, alt, crop, hotspot },
        "ctas": ctas[]{ "label": coalesce(link.label, link.internalRef->title, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style },
        showStatRail
      },
      _type == "ctaSection" => {
        heading,
        description,
        buttons[] { "text": coalesce(link.label, text), "url": ${LINKITEM_URL_EXPR}, "openInNewTab": link.openInNewTab, style }
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
          overlay,
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
          tools[]->{ _id, "title": name, slug },
          tags[]->{ _id, "title": name, slug }
        }
      },
      _type == "calloutSection" => {
        variant,
        title,
        body
      },
      _type == "mermaidSection" => {
        code,
        caption,
        width
      },
      _type == "accordionSection" => {
        heading,
        multi,
        items[] {
          _key,
          title,
          "content": content${PT_CONTENT_PROJECTION}
        }
      },
      _type == "trustReportSection" => {
        reportType
      }
    },
    aiDisclosure,
    authors[]->{${PERSON_FRAGMENT}},
    status,
    "tools": tools[]->{${TOOL_FRAGMENT}},
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    projects[]->{${PROJECT_FRAGMENT}},
    relatedProjects[]->{${PROJECT_FRAGMENT}},
    related[]->{_id, _type, title, "slug": slug.current},
    readingTime,
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
    "colorHex": colorHex.hex,
    kpis,
    categories[]->{${CATEGORY_FRAGMENT}},
    tags[]->{${TAG_FRAGMENT}},
    "tools": tools[]->{${TOOL_FRAGMENT}},
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
    "colorHex": colorHex.hex,
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
    "colorHex": colorHex.hex
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
    "colorHex": colorHex.hex,
    kpis,
    "tools": tools[]->{${TOOL_FRAGMENT}}
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
    "colorHex": colorHex.hex,
    kpis,
    "tools": tools[]->{${TOOL_FRAGMENT}}
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
    "categories": categories[]->{_id, name, "slug": slug.current, "colorHex": colorHex.hex},
    "tags": tags[]->{_id, name, "slug": slug.current},
    "projects": projects[]->{_id, name, "slug": slug.current, "colorHex": colorHex.hex},
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

// ─── Sitemap (HTML sitemap page — SUG-15) ────────────────────────────────────

export const sitemapQuery = `
  {
    "content": *[
      _type in [
        "page", "article", "caseStudy", "node", "archivePage",
        "category", "tag", "project", "person", "tool"
      ]
      && defined(slug.current)
    ] | order(_type asc, title asc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      _updatedAt,
      "noIndex": coalesce(seo.noIndex, false)
    },
    "stats": {
      "totalPublished": count(*[
        _type in [
          "page", "article", "caseStudy", "node", "archivePage",
          "category", "tag", "project", "person", "tool"
        ]
        && defined(slug.current)
      ]),
      "hiddenFromSearch": count(*[
        _type in [
          "page", "article", "caseStudy", "node", "archivePage",
          "category", "tag", "project", "person", "tool"
        ]
        && defined(slug.current)
        && seo.noIndex == true
      ])
    }
  }
`

// ── Recent Content Ticker (SUG-76) ─────────────────────────────────────────
// Minimal projections — one latest doc per type, used by recentContentSection.

export const latestArticleQuery = `
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc) [0] {
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    "category": categories[0]->{ "title": name, "slug": slug.current }
  }
`

export const latestNodeQuery = `
  *[_type == "node" && defined(slug.current)] | order(publishedAt desc) [0] {
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    "category": categories[0]->{ "title": name, "slug": slug.current }
  }
`
