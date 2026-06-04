import React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'block' | 'circle';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Width as a CSS value — defaults vary by variant */
  width?: string;
  /** Height as a CSS value — defaults vary by variant */
  height?: string;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <div
      className={[styles.skeleton, styles[variant], className].filter(Boolean).join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
