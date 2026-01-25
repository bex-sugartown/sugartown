import { useEffect, useState } from 'react'
import { client } from './lib/sanity'
import { homepageQuery } from './lib/queries'
import Header from './components/Header'
import Footer from './components/Footer'
import HomepageHero from './components/HomepageHero'
import Callout from './components/Callout'
import CardGrid from './components/CardGrid'
import './App.css'

function App() {
  const [homepage, setHomepage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(homepageQuery)
      .then((data) => {
        setHomepage(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching homepage:', error)
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
        {homepage ? (
          <>
            <HomepageHero title={homepage.title} subtitle={homepage.subtitle} />
            <Callout callout={homepage.callout} />
            <CardGrid cards={homepage.cards} />
          </>
        ) : (
          <div className="empty-state">
            <h2>No homepage content yet</h2>
            <p>Add homepage content in Sanity Studio to see it here!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
