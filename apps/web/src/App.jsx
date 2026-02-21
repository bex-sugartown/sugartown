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
import ArchivePage from './pages/ArchivePage'
import ArticlePage from './pages/ArticlePage'
import CaseStudyPage from './pages/CaseStudyPage'
import NodePage from './pages/NodePage'
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

        <Route path="/case-studies" element={<ArchivePage archiveSlug="case-studies" />} />
        <Route path="/case-studies/:slug" element={<CaseStudyPage />} />

        {/* /knowledge-graph is the canonical archive for nodes */}
        <Route path="/knowledge-graph" element={<ArchivePage archiveSlug="knowledge-graph" />} />
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
