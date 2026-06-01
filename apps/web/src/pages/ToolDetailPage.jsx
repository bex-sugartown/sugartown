/**
 * ToolDetailPage — dedicated detail page for a Sanity `tool` document.
 * Route: /tools/:slug
 *
 * SUG-104: folio (logo + identity: eyebrow + name + description + url)
 * then content sections by type using SectionLabel + Grid.
 * All layout via shared pageStyles — no page-specific CSS module needed.
 */
import { useParams, Link } from 'react-router-dom'
import { Grid, SectionLabel, Breadcrumb } from '../design-system'
import { toolBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import DraftBadge from '../components/DraftBadge'
import NotFoundPage from './NotFoundPage'
import pageStyles from './pages.module.css'
import styles from './ToolDetailPage.module.css'

// ─── Display label maps ───────────────────────────────────────────────────────

const TOOL_TYPE_LABELS = {
  ai:            'AI',
  cms:           'CMS',
  dam:           'DAM',
  data:          'Data',
  design:        'Design',
  development:   'Development',
  ecommerce:     'E-commerce',
  os:            'OS',
  pim:           'PIM',
  productivity:  'Productivity',
  visualization: 'Visualization',
  analytics:     'Analytics',
  other:         'Other',
}

const KIND_LABELS = {
  practitioner: 'Practitioner',
  platform:     'Platform',
}

// ─── SEO builder ─────────────────────────────────────────────────────────────

function buildToolSeo(tool, siteSettings) {
  if (!tool) return null
  const siteSuffix = siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''
  const title = tool.name + siteSuffix
  const description = tool.description ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', image: null },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolDetailPage() {
  const { slug } = useParams()
  const { data: tool, loading, notFound } = useSanityDoc(toolBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = buildToolSeo(tool ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !tool) return <NotFoundPage />

  const hasArticles    = tool.articles?.length > 0
  const hasNodes       = tool.nodes?.length > 0
  const hasCaseStudies = tool.caseStudies?.length > 0
  const hasContent     = hasArticles || hasNodes || hasCaseStudies

  const typeLabel = TOOL_TYPE_LABELS[tool.toolType] ?? tool.toolType ?? null
  const kindLabel = KIND_LABELS[tool.kind] ?? tool.kind ?? null
  const eyebrow   = [typeLabel, kindLabel].filter(Boolean).join(' · ')

  const logoUrl = tool.logo?.asset?.url ?? null

  return (
    <main className={pageStyles.entityDetailPage}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      <Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Tools & Platforms', href: '/tools' }]} />

      {/* ── Folio ─────────────────────────────────────────────────── */}
      <div className={pageStyles.entityFolio} style={{ '--entity-thumb-size': '72px' }}>
        {/* Logo — only when an actual image is available; no initial-letter fallback */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt={tool.logo?.alt ?? `${tool.name} logo`}
            className={styles.toolLogoImg}
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
          />
        )}

        {/* Identity — H1 first, metadata second */}
        <div className={pageStyles.folioIdentity}>
          <h1 className={pageStyles.narrativeHeading}>
            {tool.name}
            <DraftBadge docId={tool._id} />
          </h1>
          {eyebrow && (
            <p className={pageStyles.detailEyebrow}>{eyebrow}</p>
          )}
          {tool.description && (
            <p className={pageStyles.entityDescription}>{tool.description}</p>
          )}
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.toolUrl}
            >
              {tool.url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* ── Content sections ──────────────────────────────────────── */}
      {hasArticles && (
        <section className={styles.contentSection}>
          <SectionLabel title="Articles" kicker={String(tool.articles.length)} />
          <Grid columns={2} spacing="lg">
            {tool.articles.map((item) => (
              <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {hasNodes && (
        <section className={styles.contentSection}>
          <SectionLabel title="Knowledge Nodes" kicker={String(tool.nodes.length)} />
          <Grid columns={2} spacing="lg">
            {tool.nodes.map((item) => (
              <ContentCard key={item._id} item={item} docType="node" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {hasCaseStudies && (
        <section className={styles.contentSection}>
          <SectionLabel title="Case Studies" kicker={String(tool.caseStudies.length)} />
          <Grid columns={2} spacing="lg">
            {tool.caseStudies.map((item) => (
              <ContentCard key={item._id} item={item} docType="caseStudy" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {!hasContent && (
        <p className={pageStyles.archiveEmpty}>No content attributed to this tool yet.</p>
      )}
    </main>
  )
}
