/**
 * Box — web app adapter of the DS Box primitive.
 * Mirrors: packages/design-system/src/components/Box/Box.tsx
 */
import styles from './Box.module.css'

export default function Box({
  as,
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
}) {
  const Tag = as || 'div'
  const inlineVars = {}

  if (padding !== undefined) inlineVars['--box-padding'] = `var(--st-space-${padding})`
  if (paddingX !== undefined) inlineVars['--box-padding-x'] = `var(--st-space-${paddingX})`
  if (paddingY !== undefined) inlineVars['--box-padding-y'] = `var(--st-space-${paddingY})`
  if (margin !== undefined) inlineVars['--box-margin'] = `var(--st-space-${margin})`
  if (background !== undefined) inlineVars['--box-background'] = `var(--st-color-bg-${background})`
  if (borderRadius !== undefined) inlineVars['--box-border-radius'] = `var(--st-radius-${borderRadius})`
  if (borderWidth !== undefined) inlineVars['--box-border-width'] = `${borderWidth}px`
  if (borderColor !== undefined) inlineVars['--box-border-color'] = `var(--st-color-border-${borderColor})`

  return (
    <Tag
      className={[styles.box, className].filter(Boolean).join(' ')}
      style={{ ...inlineVars, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
