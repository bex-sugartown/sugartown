import React from 'react';
import styles from './Surface.module.css';

export type SurfaceElevation = 0 | 1 | 2 | 3;

export interface SurfaceProps {
  /** Shadow depth. 0=flat, 1=subtle, 2=raised, 3=floating */
  elevation?: SurfaceElevation;
  /** Polymorphic element — defaults to div */
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}

const ELEVATION_CLASS: Record<SurfaceElevation, string> = {
  0: styles.elevation0,
  1: styles.elevation1,
  2: styles.elevation2,
  3: styles.elevation3,
};

export function Surface({ elevation = 1, as, children, className }: SurfaceProps) {
  const Tag = as || 'div';
  return (
    <Tag className={[styles.surface, ELEVATION_CLASS[elevation], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
