/**
 * PersonProfilePage — renders a dedicated profile page for a Sanity `person` document.
 * Route: /people/:slug
 *
 * SUG-104: linear stack — folio head (flex row: avatar + identity) → bio → roles → expertise
 * → content sections (2-col grid).
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { SiGithub, SiX, SiInstagram, SiYoutube, SiFacebook, SiDribbble, SiBehance, SiBluesky, SiMastodon } from '@icons-pack/react-simple-icons'
import { Globe, Mail, Rss, ExternalLink } from 'lucide-react'

/**
 * Solid LinkedIn icon — Simple Icons v13 dropped SiLinkedin.
 * SVG path from Simple Icons (CC0 licence). Renders the filled "in" logotype.
 */
function LinkedInIcon({ size = 24, color = 'currentColor', className, ...props }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>LinkedIn</title>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
import { Grid, SectionLabel, Breadcrumb, Avatar } from '../design-system'
import sharedPTComponents from '../lib/portableTextComponents'
import { personProfileQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { urlFor } from '../lib/sanity'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import DraftBadge from '../components/DraftBadge'
import NotFoundPage from './NotFoundPage'
import styles from './PersonProfilePage.module.css'
import pageStyles from './pages.module.css'

// ─── Social link platform config ─────────────────────────────────────────────
const PLATFORM_CONFIG = {
  linkedin:  { label: 'LinkedIn',   icon: LinkedInIcon },
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

function buildPersonSeo(person, siteSettings) {
  if (!person) return null
  const title = `${person.shortName || person.name}${siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''}`
  const description = person.headline ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'profile', image: null },
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
  const hasBio         = person.bio?.length > 0
  const hasTitles      = person.titles?.length > 0
  const hasExpertise   = person.expertise?.length > 0

  let avatarUrl = null
  if (person.image?.asset) {
    try {
      avatarUrl = urlFor(person.image).width(176).height(176).fit('crop').url()
    } catch { /* malformed asset ref */ }
  }

  return (
    <main className={styles.profilePage}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(person, siteSettings)} />

      <Breadcrumb items={[{ label: 'People', href: '/people' }]} />

      {/* ── Folio ─────────────────────────────────────────────────── */}
      <section className={styles.profileFolio}>
        <div className={pageStyles.entityFolio}>
          {/* Avatar */}
          <Avatar src={avatarUrl ?? undefined} name={displayName} size="xl" />

          {/* Identity */}
          <div className={pageStyles.folioIdentity}>
            <h1 className={`${pageStyles.narrativeHeading} ${pageStyles.narrativeHeadingItalic}`}>
              {person.name}
              {person.shortName && (
                <span className={styles.profileShortName}> ({person.shortName})</span>
              )}
              <DraftBadge docId={person._id} />
            </h1>

            {person.headline && (
              <p className={pageStyles.detailEyebrow}>{person.headline}</p>
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
                        <IconComponent size={14} color="currentColor" aria-hidden="true" />
                        <span>{label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {hasBio && (
          <div className={styles.profileBio}>
            <div className={pageStyles.detailContent}>
              <PortableText value={person.bio} components={sharedPTComponents} />
            </div>
          </div>
        )}
      </section>

      {/* ── Roles & Titles ────────────────────────────────────────── */}
      {hasTitles && (
        <section className={styles.rolesSection}>
          <div className={styles.rolesHead}>Roles &amp; Titles</div>
          <ul className={styles.rolesList}>
            {person.titles.map((title, i) => (
              <li key={i}>{title}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Expertise chips ───────────────────────────────────────── */}
      {hasExpertise && (
        <section className={styles.expertiseSection}>
          <div className={styles.expertiseHead}>Expertise</div>
          <div className={styles.expertiseChips}>
            {person.expertise.map((item, i) => (
              item.slug ? (
                <Link key={i} to={getCanonicalPath({ docType: 'category', slug: item.slug })} className={styles.expertiseChip}>
                  {item.name ?? item}
                </Link>
              ) : (
                <span key={i} className={styles.expertiseChip}>
                  {item.name ?? item}
                </span>
              )
            ))}
          </div>
        </section>
      )}

      {/* ── Content sections ─────────────────────────────────────── */}
      {hasArticles && (
        <section className={styles.contentSection}>
          <SectionLabel title="Articles" kicker={String(person.articles.length)} />
          <Grid columns={2} spacing="lg">
            {person.articles.map((item) => (
              <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {hasNodes && (
        <section className={styles.contentSection}>
          <SectionLabel title="Knowledge Nodes" kicker={String(person.nodes.length)} />
          <Grid columns={2} spacing="lg">
            {person.nodes.map((item) => (
              <ContentCard key={item._id} item={item} docType="node" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {hasCaseStudies && (
        <section className={styles.contentSection}>
          <SectionLabel title="Case Studies" kicker={String(person.caseStudies.length)} />
          <Grid columns={2} spacing="lg">
            {person.caseStudies.map((item) => (
              <ContentCard key={item._id} item={item} docType="caseStudy" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {!hasArticles && !hasNodes && !hasCaseStudies && (
        <p className={pageStyles.archiveEmpty}>No content attributed yet.</p>
      )}
    </main>
  )
}
