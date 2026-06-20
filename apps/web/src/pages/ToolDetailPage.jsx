/**
 * ToolDetailPage — dedicated detail page for a Sanity `tool` document.
 * Route: /tools/:slug
 *
 * SUG-104: folio (logo + identity: eyebrow + name + description + url)
 * then content sections by type using SectionLabel + Grid.
 * All layout via shared pageStyles — no page-specific CSS module needed.
 */
import { useParams, Link } from 'react-router-dom'
import { Breadcrumb, PageHeader } from '../design-system'
import { toolBySlugQuery } from '../lib/queries'
import { useEffect } from 'react'
import { useSanityDoc } from '../lib/useSanityDoc'
import { setPreviewDoc } from '../lib/previewDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import ContentList from '../components/ContentList'
import DraftBadge from '../components/DraftBadge'
import NotFoundPage from './NotFoundPage'
import pageStyles from './pages.module.css'
import styles from './ToolDetailPage.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_INDEXABLE_ITEMS = 3

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

  // Register doc for the preview banner Studio deep-link (dev-only; no-op in prod).
  useEffect(() => {
    if (tool?._id) setPreviewDoc({ id: tool._id, type: 'tool' })
    return () => setPreviewDoc(null)
  }, [tool?._id])
  const siteSettings = useSiteSettings()

  const seo = buildToolSeo(tool ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !tool) return <NotFoundPage />

  const hasArticles    = tool.articles?.length > 0
  const hasNodes       = tool.nodes?.length > 0
  const hasCaseStudies = tool.caseStudies?.length > 0
  const hasContent     = hasArticles || hasNodes || hasCaseStudies

  const totalItems = (tool.articles?.length ?? 0) + (tool.nodes?.length ?? 0) + (tool.caseStudies?.length ?? 0)
  const finalSeo = totalItems < MIN_INDEXABLE_ITEMS
    ? { ...seo, robots: { index: false, follow: true } }
    : seo

  const typeLabel = TOOL_TYPE_LABELS[tool.toolType] ?? tool.toolType ?? null
  const kindLabel = KIND_LABELS[tool.kind] ?? tool.kind ?? null
  const eyebrow   = [typeLabel, kindLabel].filter(Boolean).join(' · ')

  const logoUrl = tool.logo?.asset?.url ?? null

  return (
    <main className={pageStyles.entityDetailPage}>
      <SeoHead seo={finalSeo} jsonLd={generateJsonLd(null, siteSettings)} />

      {/* ── Folio ─────────────────────────────────────────────────── */}
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Tools & Platforms', href: '/tools' }]} />}
        media={logoUrl ? (
          <img
            src={logoUrl}
            alt={tool.logo?.alt ?? `${tool.name} logo`}
            className={styles.toolLogoImg}
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
          />
        ) : undefined}
        eyebrow={eyebrow || undefined}
        title={<>{tool.name}<DraftBadge docId={tool._id} /></>}
        description={tool.description ?? undefined}
      >
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
      </PageHeader>

      {/* ── Content sections ──────────────────────────────────────── */}
      {hasArticles && (
        <section className={styles.contentSection}>
          <ContentList title="Articles" items={tool.articles} docType="article" />
        </section>
      )}

      {hasNodes && (
        <section className={styles.contentSection}>
          <ContentList title="Knowledge Nodes" items={tool.nodes} docType="node" />
        </section>
      )}

      {hasCaseStudies && (
        <section className={styles.contentSection}>
          <ContentList title="Case Studies" items={tool.caseStudies} docType="caseStudy" />
        </section>
      )}

      {!hasContent && (
        <p className={pageStyles.archiveEmpty}>No content attributed to this tool yet.</p>
      )}
    </main>
  )
}
