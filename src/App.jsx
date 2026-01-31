import { useEffect, useState } from 'react'
import { client } from './lib/sanity'
import { pageBySlugQuery } from './lib/queries'
import Header from './components/Header'
import Footer from './components/Footer'
import PageSections from './components/PageSections'
import NodesExample from './components/NodesExample'
import './App.css'

function App() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.fetch(pageBySlugQuery, { slug: 'about' })
      .then((pageData) => {
        setPage(pageData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching page:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <Header />

      <main>
        {page?.sections && <PageSections sections={page.sections} />}

        {/* Knowledge Graph Nodes */}
        <NodesExample />

        {!page && (
          <div className="empty-state">
            <h2>No content yet</h2>
            <p>Add some content in Sanity Studio to see it here!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
