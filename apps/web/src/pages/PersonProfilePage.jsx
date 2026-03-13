/**
 * PersonProfilePage — renders a dedicated profile page for a Sanity `person` document.
 * Route: /people/:slug
 *
 * EPIC-0145: replaces TaxonomyPlaceholderPage for /people/:slug.
 * Shows profile header (image, name, headline, location, pronouns, social links),
 * bio as PortableText, expertise chips, and content grouped by type (articles,
 * nodes, case studies) using ContentCard.
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { SiGithub, SiX, SiInstagram, SiYoutube, SiFacebook, SiDribbble, SiBehance, SiBluesky, SiMastodon } from '@icons-pack/react-simple-icons'
import { Linkedin, Globe, Mail, Rss, ExternalLink } from 'lucide-react'
import sharedPTComponents from '../lib/portableTextComponents'
import { personProfileQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { urlFor } from '../lib/sanity'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import TaxonomyChips from '../components/TaxonomyChips'
import NotFoundPage from './NotFoundPage'
import styles from './PersonProfilePage.module.css'
import pageStyles from './pages.module.css'

// ─── Social link platform config ─────────────────────────────────────────────
// Maps socialLinks[].platform values (from person.ts schema) to display labels
// and SVG icon components. Brand icons → Simple Icons, UI icons → Lucide.
const PLATFORM_CONFIG = {
  linkedin:  { label: 'LinkedIn',   icon: Linkedin },
  github:    { label: 'GitHub',     icon: SiGithub },
  x:         { label: 'X',          icon: SiX },
  twitter:   { label: 'Twitter/X',  icon: SiX },
  instagram: { label: 'Instagram',  icon: SiInstagram },
  youtube:   { label: 'YouTube',    icon: SiYoutube },
  facebook:  { label: 'Facebook',   icon: SiFacebook },
  dribbble:  { label: 'Dribbble',   icon: SiDribbble },
  behance:   { label: 'Behance',    icon: SiBehance },
  bluesky:   { label: 'Bluesky',    icon: SiBluesky },
  mastodon:  { label: 'Mastodon',   icon: SiMastodon },
  website:   { label: 'Website',    icon: Globe },
  email:     { label: 'Email',      icon: Mail },
  rss:       { label: 'RSS',        icon: Rss },
  other:     { label: 'Link',       icon: ExternalLink },
  external:  { label: 'Link',       icon: ExternalLink },
}

// ─── Helper: minimal SEO object for person pages ─────────────────────────────
// Person docs may have an seo field but we don't call resolveSeo() here because
// person.ts has no SEO_FRAGMENT in its query structure. We build a simple seo
// object directly from available fields so SeoHead still receives a valid shape.

function buildPersonSeo(person, siteSettings) {
  if (!person) return null
  const title = `${person.shortName || person.name}${siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''}`
  const description = person.headline ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'profile',
      image: null,
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonProfilePage() {
  const { slug } = useParams()
  const { data: person, loading, notFound } = useSanityDoc(personProfileQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = buildPersonSeo(person ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !person) return <NotFoundPage />

  const displayName = person.shortName || person.name
  const hasArticles    = person.articles?.length > 0
  const hasNodes       = person.nodes?.length > 0
  const hasCaseStudies = person.caseStudies?.length > 0

  // Build image URL if present
  let avatarUrl = null
  if (person.image?.asset) {
    try {
      avatarUrl = urlFor(person.image).width(240).height(240).fit('crop').url()
    } catch {
      // malformed asset ref — render without image
    }
  }

  // Expertise is now an array of expanded category references: { _id, name, slug, colorHex }
  // Pass directly as `categories` to TaxonomyChips so they render as linked, coloured chips.
  const expertiseCategories = person.expertise ?? []

  return (
    <main className={styles.profilePage}>
      <SeoHead seo={seo} />

      <Link to="/people" className={pageStyles.backLink}>
        ← All People
      </Link>

      {/* ── Profile Header ───────────────────────────────────────────── */}
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={person.image?.alt ?? `${displayName} profile photo`}
              className={styles.avatarImg}
              width={120}
              height={120}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className={styles.profileIdentity}>
          <h1 className={styles.profileName}>
            {person.name}
            {person.shortName && (
              <span className={styles.profileShortName}> ({person.shortName})</span>
            )}
          </h1>

          {person.headline && (
            <p className={styles.profileHeadline}>{person.headline}</p>
          )}

          {(person.location || person.pronouns) && (
            <p className={styles.profileMeta}>
              {[person.location, person.pronouns].filter(Boolean).join(' · ')}
            </p>
          )}

          {person.socialLinks?.length > 0 && (
            <ul className={styles.socialLinks} aria-label="Social profiles">
              {person.socialLinks.map((link, i) => {
                const config = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.other
                const label = link.label || config.label || link.platform
                const IconComponent = config.icon
                return (
                  <li key={i} className={styles.socialLinkItem}>
                    <a
                      href={link.url}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                    >
                      <IconComponent size={18} color="currentColor" aria-hidden="true" />
                      <span className={styles.socialPlatform}>
                        {label}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </header>

      {/* ── Bio ──────────────────────────────────────────────────────── */}
      {person.bio?.length > 0 && (
        <section className={styles.profileBio}>
          <div className={pageStyles.detailContent}>
            <PortableText value={person.bio} components={sharedPTComponents} />
          </div>
        </section>
      )}

      {/* ── Roles / Titles ───────────────────────────────────────────── */}
      {person.titles?.length > 0 && (
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Roles &amp; Titles</h2>
          <ul className={styles.titlesList}>
            {person.titles.map((title, i) => (
              <li key={i} className={styles.titlesItem}>{title}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Expertise ────────────────────────────────────────────────── */}
      {expertiseCategories.length > 0 && (
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Expertise</h2>
          <TaxonomyChips categories={expertiseCategories} />
        </section>
      )}

      {/* ── Content sections ─────────────────────────────────────────── */}

      {hasArticles && (
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Articles</h2>
          <ul className={styles.contentList}>
            {person.articles.map((item) => (
              <li key={item._id}>
                <ContentCard item={item} docType="article" showExcerpt={false} showHeroImage={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasNodes && (
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Knowledge Nodes</h2>
          <ul className={styles.contentList}>
            {person.nodes.map((item) => (
              <li key={item._id}>
                <ContentCard item={item} docType="node" showExcerpt={false} showHeroImage={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasCaseStudies && (
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Case Studies</h2>
          <ul className={styles.contentList}>
            {person.caseStudies.map((item) => (
              <li key={item._id}>
                <ContentCard item={item} docType="caseStudy" showExcerpt={false} showHeroImage={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
