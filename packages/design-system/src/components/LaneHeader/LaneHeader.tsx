import React, { useRef, RefObject } from 'react';
import { useStickyState } from '../../hooks/useStickyState';
import styles from './LaneHeader.module.css';

export interface LaneHeaderProps {
  label: string;
  count?: number;
  scrollRoot?: RefObject<HTMLElement>;
}

export const LaneHeader: React.FC<LaneHeaderProps> = ({ label, count, scrollRoot }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useStickyState(ref, { root: scrollRoot?.current ?? null });

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
  );
};
