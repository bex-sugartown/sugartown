// GROQ queries for fetching Sanity content
//
// This file contains both legacy queries (header, footer, hero, contentBlock)
// and new Sugartown CMS queries (nodes, posts, pages, case studies)

// Fetch singleton header
export const headerQuery = `
  *[_type == "header" && _id == "singleton-header"][0]{
    logo{
      image{
        asset,
        alt
      },
      linkUrl,
      width
    },
    navigation[]{
      label,
      url,
      isActive,
      openInNewTab
    },
    ctaButton{
      label,
      url,
      openInNewTab
    }
  }
`

// Fetch singleton footer
export const footerQuery = `
  *[_type == "footer" && _id == "singleton-footer"][0]{
    logo{
      image{
        asset,
        alt
      },
      linkUrl,
      width
    },
    tagline,
    navigationColumns[]{
      heading,
      links[]{
        label,
        url,
        openInNewTab
      }
    },
    socialLinks[]{
      platform,
      url,
      label
    },
    copyrightText,
    legalLinks[]{
      label,
      url,
      openInNewTab
    }
  }
`

// Fetch all hero banners
export const heroesQuery = `
  *[_type == "hero"] | order(_createdAt desc){
    _id,
    heading,
    subheading,
    ctas[]{
      label,
      url,
      openInNewTab
    },
    backgroundMedia{
      image{
        asset,
        alt,
        crop,
        hotspot
      },
      caption
    },
    backgroundStyle
  }
`

// Fetch single hero by ID
export const heroQuery = `
  *[_type == "hero" && _id == $id][0]{
    heading,
    subheading,
    ctas[]{
      label,
      url,
      openInNewTab
    },
    backgroundMedia{
      image{
        asset,
        alt,
        crop,
        hotspot
      },
      caption
    },
    backgroundStyle
  }
`

// Fetch all content blocks
export const contentBlocksQuery = `
  *[_type == "contentBlock"] | order(_createdAt desc){
    _id,
    title,
    content
  }
`

// Fetch single content block by ID
export const contentBlockQuery = `
  *[_type == "contentBlock" && _id == $id][0]{
    title,
    content
  }
`

// ============================================================================
// NEW SUGARTOWN CMS QUERIES
// ============================================================================

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
    categories[]->{
      name,
      slug,
      "color": color.hex
    },
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
    categories[]->{
      name,
      slug,
      "color": color.hex
    },
    tags[]->{
      name,
      slug
    },
    relatedProjects[]->{
      projectId,
      name,
      status
    }
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
    categories[]->{
      name,
      slug
    }
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
    categories[]->{
      name,
      slug,
      "color": color.hex
    },
    tags[]->{
      name,
      slug
    }
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
    "seoTitle": coalesce(seo.metaTitle, title),
    "seoDescription": seo.metaDescription,
    "ogImage": seo.ogImage.asset->
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
    categories[]->{
      name,
      slug
    }
  }
`

// ---- TAXONOMY ----

export const allCategoriesQuery = `
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    slug,
    "color": color.hex,
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

export const allProjectsQuery = `
  *[_type == "project"] | order(priority asc) {
    _id,
    projectId,
    name,
    description,
    status,
    priority,
    kpis
  }
`

// ---- SITE SETTINGS ----

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    siteTitle,
    siteLogo {
      asset->
    },
    "brandPink": brandColors.pink.hex,
    "brandSeafoam": brandColors.seafoam.hex,
    headerStyle,
    primaryNav->{
      title,
      items[]{
        _key,
        label,
        link {
          url,
          label,
          openInNewTab
        },
        children[]{
          _key,
          label,
          link {
            url,
            label,
            openInNewTab
          }
        }
      }
    },
    headerCta->{
      "label": coalesce(link.label, internalTitle),
      "url": link.url,
      "openInNewTab": link.openInNewTab,
      style
    },
    announcementBar {
      show,
      message,
      link {
        url,
        label,
        openInNewTab
      }
    },
    footerColumns[]->{
      title,
      items[]{
        _key,
        label,
        link {
          url,
          label,
          openInNewTab
        }
      }
    },
    socialLinks[]{
      _key,
      label,
      url,
      icon,
      openInNewTab
    },
    copyrightText,
    defaultMetaTitle,
    defaultMetaDescription
  }
`
