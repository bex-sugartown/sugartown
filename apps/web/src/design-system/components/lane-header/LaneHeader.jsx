import { useRef } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import styles from './LaneHeader.module.css'

/**
 * LaneHeader — sticky roadmap lane sub-header.
 * Pinned state: 2px pink lead bar, frosted backdrop, PINNED badge.
 */
export default function LaneHeader({ label, count }) {
  const ref = useRef(null)
  const stickyState = useStickyState(ref)

  return (
    <div
      ref={ref}
      className={styles.laneHeader}
      data-pinned={stickyState === 'pinned' || undefined}
    >
      <span className={styles.label}>{label}</span>
      {count != null && (
        <span className={styles.count}>
          {count} epic{count !== 1 ? 's' : ''}
        </span>
      )}
      {stickyState === 'pinned' && (
        <span className={styles.pinnedBadge} aria-hidden="true">PINNED</span>
      )}
    </div>
  )
}
