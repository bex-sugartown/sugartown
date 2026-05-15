import { useState, useEffect, useRef, RefObject } from 'react';

export type StickyState = 'default' | 'pinned';

interface UseStickyStateOptions {
  root?: Element | null;
  rootMargin?: string;
}

/**
 * useStickyState — IntersectionObserver-based sticky detection.
 * Inserts a 0-height sentinel before the sticky element and observes it.
 * Returns 'default' | 'pinned'.
 */
export function useStickyState(
  ref: RefObject<HTMLElement>,
  options: UseStickyStateOptions = {},
): StickyState {
  const [state, setState] = useState<StickyState>('default');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'height:0;width:100%;pointer-events:none;';
    sentinel.setAttribute('aria-hidden', 'true');
    el.parentNode!.insertBefore(sentinel, el);
    sentinelRef.current = sentinel;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.rootBounds) return;
        const pinned =
          !entry.isIntersecting &&
          entry.boundingClientRect.top < entry.rootBounds.top;
        setState(pinned ? 'pinned' : 'default');
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
        threshold: [0, 1],
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
      sentinelRef.current = null;
    };
  }, [ref, options.root, options.rootMargin]);

  return state;
}
