import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { allNodesQuery } from '../lib/queries'

/**
 * Example component showing how to fetch and display Knowledge Graph Nodes
 *
 * Usage:
 * import NodesExample from './components/NodesExample'
 * <NodesExample />
 */
export default function NodesExample() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchNodes() {
      try {
        const data = await client.fetch(allNodesQuery)
        setNodes(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching nodes:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchNodes()
  }, [])

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading nodes...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Error loading nodes</h2>
        <p>{error}</p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Make sure you've created some nodes in Sanity Studio first!
        </p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>No nodes found</h2>
        <p>Create your first Knowledge Graph Node in Sanity Studio!</p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          Visit <a href="http://localhost:3333" target="_blank" rel="noopener noreferrer">
            http://localhost:3333
          </a> → 💎 Knowledge Graph → Nodes
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#FF69B4', marginBottom: '2rem' }}>
        💎 Knowledge Graph Nodes ({nodes.length})
      </h1>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {nodes.map((node) => (
          <article
            key={node._id}
            style={{
              border: '2px solid #FF69B4',
              borderRadius: '8px',
              padding: '1.5rem',
              background: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>
                {node.title}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getAIToolEmoji(node.aiTool)}
                {getStatusBadge(node.status)}
              </div>
            </div>

            {node.excerpt && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {node.excerpt}
              </p>
            )}

            {node.challenge && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FF69B4' }}>Challenge:</strong>{' '}
                <span style={{ color: '#555' }}>{node.challenge}</span>
              </div>
            )}

            {node.insight && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#2BD4AA' }}>Insight:</strong>{' '}
                <span style={{ color: '#555' }}>{node.insight}</span>
              </div>
            )}

            {node.categories && node.categories.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {node.categories.map((cat) => (
                  <span
                    key={cat._id}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      backgroundColor: cat.color || '#FF69B4',
                      color: 'white'
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
              {new Date(node.publishedAt).toLocaleDateString()}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// Helper functions
function getAIToolEmoji(tool) {
  const emojis = {
    claude: '🤖',
    chatgpt: '💬',
    gemini: '✨',
    mixed: '🔀'
  }
  return <span style={{ fontSize: '1.5rem' }}>{emojis[tool] || '🤖'}</span>
}

function getStatusBadge(status) {
  const colors = {
    explored: '#999',
    validated: '#4CAF50',
    implemented: '#2196F3',
    deprecated: '#FF9800',
    evergreen: '#9C27B0'
  }

  const labels = {
    explored: '🔍 Explored',
    validated: '✅ Validated',
    implemented: '🚀 Implemented',
    deprecated: '⚠️ Deprecated',
    evergreen: '♾️ Evergreen'
  }

  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        backgroundColor: colors[status] || '#999',
        color: 'white'
      }}
    >
      {labels[status] || status}
    </span>
  )
}
