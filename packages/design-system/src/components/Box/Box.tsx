import React from 'react';
import styles from './Box.module.css';

type SpaceToken = '0' | 'half' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type RadiusToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'button' | 'tag' | 'card' | 'callout';
type BackgroundToken =
  | 'canvas'
  | 'surface'
  | 'surface-strong'
  | 'surface-alt'
  | 'subtle'
  | 'secondary'
  | 'tertiary'
  | 'elevated'
  | 'midnight'
  | 'void';
type BorderToken = 'default';

export interface BoxProps {
  /** Polymorphic element — defaults to div */
  as?: React.ElementType;
  /** Uniform padding — maps to --st-space-{n} */
  padding?: SpaceToken;
  /** Horizontal padding — overrides padding on the inline axis */
  paddingX?: SpaceToken;
  /** Vertical padding — overrides padding on the block axis */
  paddingY?: SpaceToken;
  /** Uniform margin — maps to --st-space-{n} */
  margin?: SpaceToken;
  /** Background — maps to --st-color-bg-{token} */
  background?: BackgroundToken;
  /** Border radius — maps to --st-radius-{token} */
  borderRadius?: RadiusToken;
  /** Border width in px (1 or 2 only) */
  borderWidth?: 1 | 2;
  /** Border color — maps to --st-color-border-{token} */
  borderColor?: BorderToken;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

export function Box({
  as: Tag = 'div',
  padding,
  paddingX,
  paddingY,
  margin,
  background,
  borderRadius,
  borderWidth,
  borderColor,
  children,
  className,
  style,
  ...rest
}: BoxProps) {
  const inlineVars: Record<string, string> = {};

  if (padding !== undefined) inlineVars['--box-padding'] = `var(--st-space-${padding})`;
  if (paddingX !== undefined) inlineVars['--box-padding-x'] = `var(--st-space-${paddingX})`;
  if (paddingY !== undefined) inlineVars['--box-padding-y'] = `var(--st-space-${paddingY})`;
  if (margin !== undefined) inlineVars['--box-margin'] = `var(--st-space-${margin})`;
  if (background !== undefined) inlineVars['--box-background'] = `var(--st-color-bg-${background})`;
  if (borderRadius !== undefined) inlineVars['--box-border-radius'] = `var(--st-radius-${borderRadius})`;
  if (borderWidth !== undefined) inlineVars['--box-border-width'] = `${borderWidth}px`;
  if (borderColor !== undefined) inlineVars['--box-border-color'] = `var(--st-color-border-${borderColor})`;

  return (
    <Tag
      className={[styles.box, className].filter(Boolean).join(' ')}
      style={{ ...inlineVars, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
