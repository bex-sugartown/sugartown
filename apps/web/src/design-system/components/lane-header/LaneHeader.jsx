import { useRef } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import styles from './LaneHeader.module.css'

/**
 * LaneHeader — sticky roadmap lane sub-header.
 *
 * Default: leading hairline (12×1px muted) + mono label + count.
 * Pinned: hairline grows to 22×2px pink, label turns pink, frosted backdrop,
 * PINNED badge fades in.
 */
export default function LaneHeader({ label, count, scrollRoot }) {
  const ref = useRef(null)
  const state = useStickyState(ref, { root: scrollRoot?.current ?? null })

  return (
    <div
      ref={ref}
      className={styles.laneHeader}
      data-state={state}
    >
      <span className={styles.lhs}>{label}</span>
      <span className={styles.rhs}>
        {count != null && (
          <span className={styles.count}>
            {count} epic{count !== 1 ? 's' : ''}
          </span>
        )}
        <span className={styles.pinnedBadge} aria-hidden="true">● Pinned</span>
      </span>
    </div>
  )
}
