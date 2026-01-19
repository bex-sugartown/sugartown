import { useEffect, useState } from 'react'
import { client } from './lib/sanity'
import { heroesQuery, contentBlocksQuery } from './lib/queries'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ContentBlock from './components/ContentBlock'
import './styles/design-tokens.css'
import './App.css'

function App() {
  const [heroes, setHeroes] = useState([])
  const [contentBlocks, setContentBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    Promise.all([
      client.fetch(heroesQuery),
      client.fetch(contentBlocksQuery),
    ])
      .then(([heroesData, contentBlocksData]) => {
        setHeroes(heroesData || [])
        setContentBlocks(contentBlocksData || [])
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
      <Header />
      
      <main>
        {heroes.length > 0 && <Hero hero={heroes[0]} />}
        
        {contentBlocks.length > 0 && contentBlocks.map((block) => (
          <ContentBlock key={block._id} content={block.content} />
        ))}
        
        {heroes.length === 0 && contentBlocks.length === 0 && (
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
