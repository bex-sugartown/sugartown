import { useEffect, useState } from 'react'
import { useClient } from 'sanity'

interface ContentRef {
  _id: string
  _type: string
  title: string
  slug: string
}

const TYPE_PREFIX: Record<string, string> = {
  article: 'articles',
  node: 'nodes',
  caseStudy: 'case-studies',
}

const TYPE_LABEL: Record<string, string> = {
  article: 'Articles',
  node: 'Knowledge Nodes',
  caseStudy: 'Case Studies',
}

export function ProjectReferencesView({
  document,
}: {
  document: { displayed: Record<string, unknown> }
}) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [refs, setRefs] = useState<ContentRef[]>([])
  const [loading, setLoading] = useState(true)

  const docId = document.displayed?._id as string | undefined

  useEffect(() => {
    if (!docId) return
    // Strip the drafts. prefix so the query matches published IDs too
    const id = docId.replace(/^drafts\./, '')
    client
      .fetch<ContentRef[]>(
        `*[_type in ["article","node","caseStudy"] && references($id)] | order(_type asc, title asc) {
          _id, _type, title, "slug": slug.current
        }`,
        { id },
      )
      .then((results) => {
        setRefs(results)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [docId, client])

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', color: '#888', fontSize: '0.875rem' }}>
        Loading…
      </div>
    )
  }

  if (!refs.length) {
    return (
      <div style={{ padding: '1.5rem', color: '#999', fontSize: '0.875rem' }}>
        No content linked to this project yet.
      </div>
    )
  }

  const byType = refs.reduce<Record<string, ContentRef[]>>((acc, r) => {
    acc[r._type] = acc[r._type] || []
    acc[r._type].push(r)
    return acc
  }, {})

  return (
    <div style={{ padding: '1.5rem' }}>
      {Object.entries(byType).map(([type, items]) => (
        <div key={type} style={{ marginBottom: '2rem' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#888',
              margin: '0 0 0.75rem',
            }}
          >
            {TYPE_LABEL[type] ?? type} ({items.length})
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item._id}
                style={{
                  padding: '0.625rem 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.title}</span>
                {item.slug && (
                  <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.2rem' }}>
                    /{TYPE_PREFIX[type] ?? type}/{item.slug}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '1rem' }}>
        {refs.length} piece{refs.length !== 1 ? 's' : ''} total
      </p>
    </div>
  )
}
