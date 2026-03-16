import { useState, useEffect } from 'react'
import { client, rawClient } from './sanity'
import { isPreviewMode } from './contentState'

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

/**
 * useDraftIds(type)
 *
 * Preview-mode-only hook. Queries the raw perspective to find all documents
 * of the given type whose _id starts with "drafts." — these are documents
 * with unpublished changes (draft-only or published-with-edits).
 *
 * Returns a Set of clean IDs (without the "drafts." prefix) for easy lookup.
 * Returns an empty Set when preview mode is off.
 */
export function useDraftIds(type) {
  const [draftIds, setDraftIds] = useState(new Set())

  useEffect(() => {
    if (!isPreviewMode() || !type) return

    rawClient
      .fetch(
        `*[_type == $type && _id in path("drafts.**")]._id`,
        { type }
      )
      .then((ids) => {
        // Strip "drafts." prefix so IDs match what previewDrafts perspective returns
        const cleaned = new Set(ids.map((id) => id.replace(/^drafts\./, '')))
        setDraftIds(cleaned)
      })
      .catch((err) => {
        console.error('[useDraftIds] fetch error:', err)
      })
  }, [type])

  return draftIds
}

/**
 * useDocHasDraft(docId)
 *
 * Preview-mode-only hook for detail pages. Checks if a specific document
 * has a draft version (by querying raw perspective for "drafts.{docId}").
 *
 * Returns boolean. Always false when preview mode is off.
 */
export function useDocHasDraft(docId) {
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    if (!isPreviewMode() || !docId) return

    rawClient
      .fetch(
        `defined(*[_id == $draftId][0])`,
        { draftId: `drafts.${docId}` }
      )
      .then((result) => setHasDraft(!!result))
      .catch((err) => {
        console.error('[useDocHasDraft] fetch error:', err)
      })
  }, [docId])

  return hasDraft
}
