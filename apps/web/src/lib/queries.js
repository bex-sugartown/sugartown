// GROQ queries for fetching Sanity content
//
// All queries for Sugartown CMS: site settings, pages, nodes, posts, case studies, taxonomy.
// Site-wide config (header, footer, nav, preheader) comes from siteSettingsQuery.
// Page content uses composable sections fetched via pageBySlugQuery.

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
    defaultMetaTitle,
    defaultMetaDescription,
    defaultOgImage{
      asset,
      alt,
      hotspot,
      crop
    }
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
