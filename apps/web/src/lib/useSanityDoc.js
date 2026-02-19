import { useState, useEffect } from 'react'
import { client } from './sanity'

/**
 * useSanityDoc(query, params)
 *
 * Minimal hook for fetching a single Sanity document by GROQ query.
 * Returns { data, loading, notFound } — notFound is true when the query
 * resolved but returned null (doc doesn't exist or has no matching slug).
 */
export function useSanityDoc(query, params) {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setData(undefined)

    client
      .fetch(query, params)
      .then((result) => {
        if (cancelled) return
        if (result === null || result === undefined) {
          setNotFound(true)
        } else {
          setData(result)
        }
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[useSanityDoc] fetch error:', err)
        setNotFound(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, JSON.stringify(params)])

  return { data, loading, notFound }
}

/**
 * useSanityList(query, params)
 *
 * Minimal hook for fetching an array of documents.
 * Returns { data: [], loading }.
 */
export function useSanityList(query, params) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    client
      .fetch(query, params)
      .then((result) => {
        if (cancelled) return
        setData(result ?? [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[useSanityList] fetch error:', err)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, JSON.stringify(params)])

  return { data, loading }
}
