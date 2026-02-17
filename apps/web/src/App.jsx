import { useEffect, useState } from 'react'
import { client } from './lib/sanity'
import { siteSettingsQuery, pageBySlugQuery } from './lib/queries'
import Header from './components/Header'
import Footer from './components/Footer'
import PageSections from './components/PageSections'
import NodesExample from './components/NodesExample'
import './App.css'

function App() {
  const [siteSettings, setSiteSettings] = useState(null)
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.fetch(siteSettingsQuery),
      client.fetch(pageBySlugQuery, { slug: 'about' }),
    ])
      .then(([settingsData, pageData]) => {
        setSiteSettings(settingsData)
        setPage(pageData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching content:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <Header siteSettings={siteSettings} />

      <main>
        {page?.sections && page.sections.length > 0 ? (
          <PageSections sections={page.sections} />
        ) : (
          <div className="empty-state">
            <h2>No homepage content yet</h2>
            <p>Add homepage content in Sanity Studio to see it here!</p>
          </div>
        )}

        {/* Knowledge Graph Nodes */}
        <NodesExample />
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  )
}

export default App
