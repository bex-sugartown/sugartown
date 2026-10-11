/**
 * ReleaseNotePage — renders a single Sanity `releaseNote` document.
 * Route: /releases/:slug
 *
 * Same shell as ArticlePage (vspec ST-147): hero heading is the page title,
 * MetadataCard carries Version and Released, sections render through PageSections.
 */
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { releaseNoteBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { getArchivePath } from '../lib/routes'
import { generateJsonLd } from '../lib/jsonLd'
import { extractLeadHero } from '../lib/heroUtils'
import { setPreviewDoc } from '../lib/previewDoc'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import PageSidebar, { hasSidebarContent } from '../components/PageSidebar'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function ReleaseNotePage() {
  const { slug } = useParams()
  const { data: note, loading, notFound } = useSanityDoc(releaseNoteBySlugQuery, { slug })

  useEffect(() => {
    if (note?._id) setPreviewDoc({ id: note._id, type: 'releaseNote' })
    return () => setPreviewDoc(null)
  }, [note?._id])
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(note?._id)

  const seo = resolveSeo(note ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !note) return <NotFoundPage />

  const { leadHero, restSections, heroImageUrl } = extractLeadHero(note.sections)
  const showMargin = hasSidebarContent({ ...note, sections: restSections })

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} jsonLd={generateJsonLd(note, siteSettings)} />
      {leadHero && <PageSections sections={[leadHero]} docMeta={{ date: note.publishedAt }} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined}>

        <MetadataCard
          authors={note.authors}
          contentType="Release note"
          contentTypeHref={getArchivePath('releaseNote')}
          version={note.version}
          publishedAt={note.publishedAt}
          draftBadge={<DraftBadge docId={note._id} hasDraft={hasDraft} />}
        />

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {note.citations?.length > 0 && (
          <div className={styles.detailPageFullSpan}>
            <CitationZone>
              {note.citations.map((cite, i) => (
                <CitationNote key={cite._key ?? i} index={i + 1}>
                  {cite.text}
                  {cite.url && (
                    <>
                      {' '}
                      <a href={cite.url} target="_blank" rel="noopener noreferrer">
                        {cite.label || cite.url}
                      </a>
                    </>
                  )}
                </CitationNote>
              ))}
            </CitationZone>
          </div>
        )}

        <PageSidebar
          sections={restSections}
          authors={note.authors}
          aiDisclosure={note.aiDisclosure}
        />

        <div className={styles.detailPageFullSpan}>
          <ContentNav prev={note.prev} next={note.next} docType="releaseNote" />
        </div>
      </div>
    </main>
  )
}
