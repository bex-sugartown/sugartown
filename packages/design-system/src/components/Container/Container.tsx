import React from 'react';
import styles from './Container.module.css';

export type ContainerSize = 'reading' | 'detail' | 'archive' | 'site' | 'bleed';

export interface ContainerProps {
  /** Max-width constraint. reading=760px, detail=1080px, archive=960px, bleed=unconstrained. */
  size?: ContainerSize;
  /** Polymorphic element — defaults to div */
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  /** Inline style passthrough, for one-off overrides the size prop cannot express. */
  style?: React.CSSProperties;
}

const SIZE_CLASS: Record<ContainerSize, string> = {
  reading: styles.reading,
  detail:  styles.detail,
  archive: styles.archive,
  site:    styles.site,
  bleed:   styles.bleed,
};

export function Container({ size = 'reading', as, children, className, style }: ContainerProps) {
  const Tag = as || 'div';
  return (
    <Tag className={[styles.container, SIZE_CLASS[size], className].filter(Boolean).join(' ')} style={style}>
      {children}
    </Tag>
  );
}
