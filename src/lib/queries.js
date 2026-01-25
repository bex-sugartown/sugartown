// GROQ queries for fetching Sanity content

// Fetch site settings with header configuration
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

// Fetch singleton header (legacy - use siteSettingsQuery instead)
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
