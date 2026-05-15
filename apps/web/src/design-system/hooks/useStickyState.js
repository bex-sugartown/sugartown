import { useState, useEffect, useRef } from 'react'

/**
 * useStickyState — IntersectionObserver-based sticky detection.
 *
 * Inserts a 0-height sentinel <div> immediately before the sticky element,
 * then observes it. When the sentinel scrolls out of view above the root,
 * the element is "pinned".
 *
 * Returns 'default' | 'pinned'.
 *
 * @param {React.RefObject} ref — ref attached to the sticky element itself
 * @param {{ rootMargin?: string }} options
 */
export function useStickyState(ref, options = {}) {
  const [state, setState] = useState('default')
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'height:0;overflow:hidden;pointer-events:none;'
    el.parentNode.insertBefore(sentinel, el)
    sentinelRef.current = sentinel

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting ? 'default' : 'pinned')
      },
      { rootMargin: options.rootMargin ?? '0px', threshold: 0 },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [ref, options.rootMargin])

  return state
}
