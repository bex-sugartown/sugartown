import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { client, urlFor } from './lib/sanity'
import { siteSettingsQuery } from './lib/queries'
import { SiteSettingsContext } from './lib/SiteSettingsContext'
import { isPreviewMode } from './lib/contentState'
import Header from './components/Header'
import Footer from './components/Footer'
import PreviewBanner from './components/PreviewBanner'

// Pages
import HomePage from './pages/HomePage'
import RootPage from './pages/RootPage'
import ArchivePage from './pages/ArchivePage'
import ArticlePage from './pages/ArticlePage'
import SeriesPage from './pages/SeriesPage'
import CaseStudyPage from './pages/CaseStudyPage'
import NodePage from './pages/NodePage'
import TaxonomyPlaceholderPage from './pages/TaxonomyPlaceholderPage'
import ToolDetailPage from './pages/ToolDetailPage'
import TaxonomyArchivePage from './pages/TaxonomyArchivePage'
import PersonProfilePage from './pages/PersonProfilePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import SiteGraphPage from './pages/SiteGraphPage'
import SchemaErdPage from './pages/SchemaErdPage'
import PlatformLayout from './components/PlatformLayout/PlatformLayout'
import GovernancePage from './pages/platform/GovernancePage'
import MonorepoPage from './pages/platform/MonorepoPage'
import CmsPage from './pages/platform/CmsPage'
import DesignSystemPage from './pages/platform/DesignSystemPage'

import DesignSystemRegistryPage from './pages/platform/DesignSystemRegistryPage'
import ContentModelsPage from './pages/platform/ContentModelsPage'
import SectionShowcasePage from './pages/platform/SectionShowcasePage'
import SitemapPage from './pages/SitemapPage'
import TablesDevPage from './pages/dev/TablesDevPage'
import NotFoundPage from './pages/NotFoundPage'
import GlossaryArchivePage from './pages/GlossaryArchivePage'
import GlossaryTermPage from './pages/GlossaryTermPage'

import './App.css'

// Scroll to top on route change — BrowserRouter preserves scroll position by default,
// which causes prev/next navigation (e.g. case study footer links) to land mid-page.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Redirect /knowledge-graph/:slug → /nodes/:slug (SUG-81 Phase 1 URL migration).
function KnowledgeGraphSlugRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/nodes/${slug}`} replace />
}

function App() {
  const [siteSettings, setSiteSettings] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(siteSettingsQuery)
      .then((data) => {
        setSiteSettings(data)
        setSettingsLoading(false)
      })
      .catch((err) => {
        console.error('[App] Error fetching site settings:', err)
        setSettingsLoading(false)
      })
  }, [])

  // ── Favicon: replace Vite default with Sanity siteSettings.favicon ────────
  useEffect(() => {
    if (!siteSettings?.favicon?.asset) return
    try {
      const faviconUrl = urlFor(siteSettings.favicon).width(64).height(64).url()
      const link = document.querySelector('link[rel="icon"]')
      if (link) {
        link.setAttribute('href', faviconUrl)
        link.setAttribute('type', 'image/png')
      }
    } catch {
      // urlFor may throw if asset ref is malformed — keep default favicon
    }
  }, [siteSettings])

  // Site settings can still be loading while page content renders.
  // Context provides siteSettings (null while loading) to all page components
  // for SEO resolution. Header/Footer gracefully handle null siteSettings.
  return (
    <SiteSettingsContext.Provider value={siteSettings}>
    <div className="app">
      {isPreviewMode() && <PreviewBanner />}
      <Header siteSettings={siteSettings} settingsLoading={settingsLoading} />
      <ScrollToTop />

      <Routes>
        {/* ── Homepage ─────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Legacy post/blog redirects (Stage 6: post → article rename) ── */}
        <Route path="/blog" element={<Navigate to="/articles" replace />} />
        <Route path="/blog/:slug" element={<Navigate to="/articles" replace />} />
        <Route path="/posts" element={<Navigate to="/articles" replace />} />
        <Route path="/post/:slug" element={<Navigate to="/articles" replace />} />

        {/* ── Legacy WP slug redirects (percent-encoded / renamed slugs) ── */}
        {/* WP post 814 had an emoji slug that was decoded to luxury-dot-com */}
        <Route path="/articles/%f0%9f%92%8e-luxury-dot-com-%f0%9f%92%8e" element={<Navigate to="/articles/luxury-dot-com" replace />} />

        {/* ── Archive pages — driven by Sanity archivePage documents ── */}
        {/* Each archive slug is passed explicitly; 404 if doc unpublished */}
        <Route path="/articles" element={<ArchivePage archiveSlug="articles" />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/series/:slug" element={<SeriesPage />} />

        <Route path="/case-studies" element={<ArchivePage archiveSlug="case-studies" />} />
        <Route path="/case-studies/:slug" element={<CaseStudyPage />} />

        {/* /nodes is the canonical archive for Agentic Caucus Nodes (SUG-81) */}
        <Route path="/nodes" element={<ArchivePage archiveSlug="nodes" />} />
        <Route path="/nodes/:slug" element={<NodePage />} />

        {/* /library — unified archive of articles, nodes, and case studies (SUG-138) */}
        <Route path="/library" element={<ArchivePage archiveSlug="library" />} />

        {/* /glossary — term definitions, controlled vocabulary (SUG-35) */}
        <Route path="/glossary" element={<GlossaryArchivePage />} />
        <Route path="/glossary/:slug" element={<GlossaryTermPage />} />

        {/* /knowledge-graph — site-wide cross-type graph (SUG-81 Phase 3) */}
        <Route path="/knowledge-graph" element={<SiteGraphPage />} />
        <Route path="/knowledge-graph/:slug" element={<KnowledgeGraphSlugRedirect />} />

        {/* ── Taxonomy archive routes ─────────────────────────────────── */}
        <Route path="/tags" element={<TaxonomyArchivePage />} />
        <Route path="/tags/:slug" element={<TaxonomyPlaceholderPage />} />
        <Route path="/categories" element={<TaxonomyArchivePage />} />
        <Route path="/categories/:slug" element={<TaxonomyPlaceholderPage />} />
        <Route path="/projects" element={<TaxonomyArchivePage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/people" element={<TaxonomyArchivePage />} />
        <Route path="/people/:slug" element={<PersonProfilePage />} />
        <Route path="/tools" element={<TaxonomyArchivePage />} />
        <Route path="/tools/:slug" element={<ToolDetailPage />} />

        {/* ── Platform section ────────────────────────────────────── */}
        {/* All /platform/* routes share PlatformLayout (left rail nav).
            Right rail (PageSidebar) is suppressed via hideSidebar — left rail
            owns in-page navigation for this section. */}
        <Route path="/platform">
          <Route element={<PlatformLayout />}>
            <Route index element={<RootPage slugOverride="platform" hideSidebar />} />
            {/* /platform/schema → /platform/cms redirect (SUG-111) */}
            <Route path="schema" element={<Navigate to="/platform/cms" replace />} />
            <Route path="governance" element={<GovernancePage />} />
            <Route path="monorepo" element={<MonorepoPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="design-system" element={<DesignSystemPage />} />

            <Route path="design-system/registry" element={<DesignSystemRegistryPage />} />
            <Route path="design-system/sections" element={<SectionShowcasePage />} />
            <Route path="cms/content-models" element={<ContentModelsPage />} />
          </Route>
        </Route>

        {/* ── Code-driven pages ────────────────────────────────────── */}
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/dev/tables" element={<TablesDevPage />} />

        {/* ── Root pages (page type) — must come last among /:slug ─── */}
        {/* NOTE: This catches any single-segment path not matched above.         */}
        {/* RootPage fetches by slug; if no Sanity page doc is found it renders   */}
        {/* <NotFoundPage> directly (see RootPage.jsx: if notFound || !page).     */}
        <Route path="/:slug" element={<RootPage />} />

        {/* ── 404 catch-all ─────────────────────────────────────────── */}
        {/* Catches all multi-segment paths not matched by any route above. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer siteSettings={siteSettings} />
    </div>
    </SiteSettingsContext.Provider>
  )
}

export default App
