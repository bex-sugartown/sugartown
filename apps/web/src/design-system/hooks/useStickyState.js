import { useState, useEffect, useRef } from 'react'

/**
 * useStickyState — IntersectionObserver-based sticky detection.
 *
 * Inserts a 0-height sentinel <div> immediately before the sticky element,
 * then observes it. When the sentinel scrolls out of the root's top edge,
 * the element is "pinned".
 *
 * Returns 'default' | 'pinned'.
 *
 * @param {React.RefObject} ref — ref attached to the sticky element itself
 * @param {{ root?: Element|null, rootMargin?: string }} options
 */
export function useStickyState(ref, options = {}) {
  const [state, setState] = useState('default')
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'height:0;width:100%;pointer-events:none;'
    sentinel.setAttribute('aria-hidden', 'true')
    el.parentNode.insertBefore(sentinel, el)
    sentinelRef.current = sentinel

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.rootBounds) return
        const pinned =
          !entry.isIntersecting &&
          entry.boundingClientRect.top < entry.rootBounds.top
        setState(pinned ? 'pinned' : 'default')
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
        threshold: [0, 1],
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
      sentinelRef.current = null
    }
  }, [ref, options.root, options.rootMargin])

  return state
}
