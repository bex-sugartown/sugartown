import { useState, useEffect } from 'react'

/**
 * Returns the ID of the topmost visible section from the given list.
 *
 * Uses IntersectionObserver: fires `update()` on section entry/exit, then
 * walks targets in DOM order and picks the last one whose top has crossed
 * the trigger line (25% from viewport top). This correctly handles tall
 * sections that span the full intersection band without a clean enter/leave.
 *
 * @param {string[]} ids - Element IDs to observe (in document order, top-to-bottom)
 * @param {object} [options]
 * @param {string} [options.rootMargin='0px 0px -75% 0px'] - IO rootMargin
 * @param {string} [options.resetKey] - When this value changes, the observer re-attaches
 *   (needed when the same IDs appear on multiple pages, e.g. PlatformSidebar)
 * @returns {string|null}
 */
export default function useScrollspy(ids, { rootMargin = '0px 0px -75% 0px', resetKey } = {}) {
  const [activeId, setActiveId] = useState(null)
  // Stable string dep so a fresh array ref each render doesn't re-run the effect
  const idsKey = ids.join(',')

  useEffect(() => {
    if (!ids.length) return
    if (typeof IntersectionObserver === 'undefined') return

    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!targets.length) return

    const update = () => {
      const triggerLine = window.innerHeight * 0.25
      let active = null
      for (const t of targets) {
        if (t.getBoundingClientRect().top <= triggerLine) active = t.id
        else break
      }
      setActiveId(active)
    }

    const observer = new IntersectionObserver(update, { rootMargin, threshold: 0 })
    targets.forEach((t) => observer.observe(t))
    update()
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, rootMargin, resetKey])

  return activeId
}
