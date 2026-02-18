import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { client } from './lib/sanity'
import { siteSettingsQuery } from './lib/queries'
import { SiteSettingsContext } from './lib/SiteSettingsContext'
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import HomePage from './pages/HomePage'
import RootPage from './pages/RootPage'
import ArticlePage from './pages/ArticlePage'
import ArticlesArchivePage from './pages/ArticlesArchivePage'
import CaseStudyPage from './pages/CaseStudyPage'
import CaseStudiesArchivePage from './pages/CaseStudiesArchivePage'
import NodePage from './pages/NodePage'
import KnowledgeGraphArchivePage from './pages/KnowledgeGraphArchivePage'
import TaxonomyPlaceholderPage from './pages/TaxonomyPlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'

import './App.css'

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

  // Site settings can still be loading while page content renders.
  // Context provides siteSettings (null while loading) to all page components
  // for SEO resolution. Header/Footer gracefully handle null siteSettings.
  return (
    <SiteSettingsContext.Provider value={siteSettings}>
    <div className="app">
      <Header siteSettings={siteSettings} settingsLoading={settingsLoading} />

      <Routes>
        {/* ── Homepage ─────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Articles (post type) ──────────────────────────────────── */}
        <Route path="/articles" element={<ArticlesArchivePage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />

        {/* ── Case Studies ─────────────────────────────────────────── */}
        <Route path="/case-studies" element={<CaseStudiesArchivePage />} />
        <Route path="/case-studies/:slug" element={<CaseStudyPage />} />

        {/* ── Knowledge Graph / Nodes ───────────────────────────────── */}
        <Route path="/knowledge-graph" element={<KnowledgeGraphArchivePage />} />
        {/* /nodes redirects to /knowledge-graph (alias — canonical is /knowledge-graph) */}
        <Route path="/nodes" element={<Navigate to="/knowledge-graph" replace />} />
        <Route path="/nodes/:slug" element={<NodePage />} />

        {/* ── Reserved taxonomy routes (placeholders) ───────────────── */}
        <Route path="/tags" element={<TaxonomyPlaceholderPage />} />
        <Route path="/tags/:slug" element={<TaxonomyPlaceholderPage />} />
        <Route path="/categories" element={<TaxonomyPlaceholderPage />} />
        <Route path="/categories/:slug" element={<TaxonomyPlaceholderPage />} />
        <Route path="/projects" element={<TaxonomyPlaceholderPage />} />
        <Route path="/projects/:slug" element={<TaxonomyPlaceholderPage />} />
        <Route path="/people" element={<TaxonomyPlaceholderPage />} />
        <Route path="/people/:slug" element={<TaxonomyPlaceholderPage />} />

        {/* ── Root pages (page type) — must come last among /:slug ─── */}
        {/* NOTE: This catches any single-segment path not matched above */}
        <Route path="/:slug" element={<RootPage />} />

        {/* ── 404 catch-all ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer siteSettings={siteSettings} />
    </div>
    </SiteSettingsContext.Provider>
  )
}

export default App
