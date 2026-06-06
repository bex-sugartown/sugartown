/**
 * ProjectDetailPage — renders a dedicated detail page for a Sanity `project` document.
 * Route: /projects/:slug
 *
 * EPIC-0145: replaces TaxonomyPlaceholderPage for /projects/:slug.
 * Shows a colour-accented header, description, and a MetaCard (MetadataCard)
 * with status / ID / priority / categories / tags / KPIs, then a unified
 * content timeline (articles + nodes + caseStudies) using ContentCard.
 */
import { useParams, Link } from 'react-router-dom'
import { Grid, SectionLabel, Breadcrumb, PageHeader } from '../design-system'
import { projectDetailQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import MetadataCard from '../components/MetadataCard'
import NotFoundPage from './NotFoundPage'
import styles from './ProjectDetailPage.module.css'
import pageStyles from './pages.module.css'

// ─── SEO ─────────────────────────────────────────────────────────────────────

function buildProjectSeo(project, siteSettings) {
  if (!project) return null
  const siteSuffix  = siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''
  const title       = (project.seo?.metaTitle || project.name) + siteSuffix
  const description = project.seo?.metaDescription ?? project.description ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', image: null },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, loading, notFound } = useSanityDoc(projectDetailQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = buildProjectSeo(project ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !project) return <NotFoundPage />

  return (
    <main className={styles.projectPage}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Projects', href: '/projects' }]} />}
        title={project.name}
        description={project.description ?? undefined}
        tint={project.colorHex ?? undefined}
      />

      {/* ── MetaCard — structured metadata (status, ID, taxonomy) */}
      <MetadataCard
        projectId={project.projectId}
        status={project.status}
        categories={project.categories}
        tags={project.tags}
        tools={project.tools}
      />

      {/* ── Content sections by type ──────────────────────────────── */}
      {project.articles?.length > 0 && (
        <section className={styles.contentSection}>
          <SectionLabel title="Articles" kicker={String(project.articles.length)} />
          <Grid columns={2} spacing="lg">
            {project.articles.map((item) => (
              <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {project.nodes?.length > 0 && (
        <section className={styles.contentSection}>
          <SectionLabel title="Knowledge Nodes" kicker={String(project.nodes.length)} />
          <Grid columns={2} spacing="lg">
            {project.nodes.map((item) => (
              <ContentCard key={item._id} item={item} docType="node" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {project.caseStudies?.length > 0 && (
        <section className={styles.contentSection}>
          <SectionLabel title="Case Studies" kicker={String(project.caseStudies.length)} />
          <Grid columns={2} spacing="lg">
            {project.caseStudies.map((item) => (
              <ContentCard key={item._id} item={item} docType="caseStudy" showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      )}

      {!project.articles?.length && !project.nodes?.length && !project.caseStudies?.length && (
        <p className={pageStyles.archiveEmpty}>No content linked to this project yet.</p>
      )}
    </main>
  )
}
