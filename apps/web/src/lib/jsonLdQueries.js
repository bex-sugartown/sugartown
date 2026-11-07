// jsonLdQueries.js — the GROQ fields generateJsonLd() reads (#82).
// No imports on purpose: scripts/prerender-content.mjs runs in plain Node and
// shares these strings with queries.js, so the page and the prerender cannot
// ask Sanity for different shapes.

/** Fields buildPerson() in jsonLd.js reads. Used as `person{...}` projection. */
export const JSONLD_PERSON_PROJECTION = `
  _id,
  name,
  "slug": slug.current,
  titles,
  headline,
  location,
  socialLinks[]{ platform, url, label },
  image{ asset->{ _id, url }, alt },
  "expertise": expertise[]->{ name }
`

/** The page whose JSON-LD carries a mainEntity (jsonLd.js buildPage + PROFILE_PAGE_SLUGS). */
export const JSONLD_PRIMARY_PERSON_SELECT = `select(
      slug.current == "about" => *[_type == "person"][0] {${JSONLD_PERSON_PROJECTION}}
    )`

/** Fields the Organization and WebSite nodes read from siteSettings. */
export const JSONLD_SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0]{
    siteUrl,
    siteTitle,
    tagline,
    defaultOgImage{ asset->{ url } }
  }
`
