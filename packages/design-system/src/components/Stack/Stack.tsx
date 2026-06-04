import React from 'react';
import styles from './Stack.module.css';

export type StackGap = '0' | 'half' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

export interface StackProps {
  /** Spacing between children — maps to --st-space-{n} */
  gap?: StackGap;
  /** Layout direction. Accepts a responsive object: { base: 'vertical', md: 'horizontal' }. Default: vertical. */
  direction?: StackDirection | { base: StackDirection; md?: StackDirection; lg?: StackDirection };
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  /** Polymorphic element — defaults to div */
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}

export function Stack({
  gap = '4',
  direction = 'vertical',
  align,
  justify,
  wrap = false,
  as,
  children,
  className,
}: StackProps) {
  const Tag = as || 'div';

  const resolvedDir = typeof direction === 'object' ? direction.base : direction;

  const inlineVars: Record<string, string> = {
    '--stack-gap': `var(--st-space-${gap})`,
    '--stack-direction': resolvedDir === 'horizontal' ? 'row' : 'column',
  };

  if (typeof direction === 'object' && direction.md) {
    inlineVars['--stack-direction-md'] = direction.md === 'horizontal' ? 'row' : 'column';
  }
  if (typeof direction === 'object' && direction.lg) {
    inlineVars['--stack-direction-lg'] = direction.lg === 'horizontal' ? 'row' : 'column';
  }
  if (align) inlineVars['--stack-align'] = align;
  if (justify) inlineVars['--stack-justify'] = justify;
  if (wrap) inlineVars['--stack-wrap'] = 'wrap';

  return (
    <Tag
      className={[
        styles.stack,
        typeof direction === 'object' && direction.md && styles.responsive,
        className,
      ].filter(Boolean).join(' ')}
      style={inlineVars as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
