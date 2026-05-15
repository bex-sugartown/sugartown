import { useState, useEffect, useRef, RefObject } from 'react';

export type StickyState = 'default' | 'pinned';

interface UseStickyStateOptions {
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
    sentinel.style.cssText = 'height:0;overflow:hidden;pointer-events:none;';
    el.parentNode!.insertBefore(sentinel, el);
    sentinelRef.current = sentinel;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting ? 'default' : 'pinned');
      },
      { rootMargin: options.rootMargin ?? '0px', threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [ref, options.rootMargin]);

  return state;
}
