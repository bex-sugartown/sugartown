import styles from './Stack.module.css'

export default function Stack({
  gap = '4',
  direction = 'vertical',
  align,
  justify,
  wrap = false,
  as,
  children,
  className,
}) {
  const Tag = as || 'div'
  const resolvedDir = typeof direction === 'object' ? direction.base : direction

  const inlineVars = {
    '--stack-gap': `var(--st-space-${gap})`,
    '--stack-direction': resolvedDir === 'horizontal' ? 'row' : 'column',
  }
  if (typeof direction === 'object' && direction.md) {
    inlineVars['--stack-direction-md'] = direction.md === 'horizontal' ? 'row' : 'column'
  }
  if (typeof direction === 'object' && direction.lg) {
    inlineVars['--stack-direction-lg'] = direction.lg === 'horizontal' ? 'row' : 'column'
  }
  if (align) inlineVars['--stack-align'] = align
  if (justify) inlineVars['--stack-justify'] = justify
  if (wrap) inlineVars['--stack-wrap'] = 'wrap'

  return (
    <Tag
      className={[styles.stack, typeof direction === 'object' && (direction.md || direction.lg) && styles.responsive, className].filter(Boolean).join(' ')}
      style={inlineVars}
    >
      {children}
    </Tag>
  )
}
