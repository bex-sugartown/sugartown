/**
 * Card — web app adapter of the DS Card visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Card/Card.tsx
 * CSS sync: Card.module.css must match DS Card.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Card.module.css'

export default function Card({
  eyebrow,
  title,
  titleHref,
  subtitle,
  children,
  footer,
  variant = 'default',
  href,
  as: Root,
  className,
  ...restProps
}) {
  const cardClassNames = [
    styles.card,
    variant === 'compact' && styles.compact,
    variant === 'listing' && styles.listing,
    variant === 'dark' && styles.dark,
    variant === 'metadata' && styles.metadata,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const titleNode = titleHref
    ? <a href={titleHref} className={styles.titleLink}>{title}</a>
    : title

  const inner = (
    <div className={styles.inner}>
      {/* Header — eyebrow + title + subtitle (omitted when all are absent) */}
      {(eyebrow || title || subtitle) && (
        <div className={styles.header}>
          {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
          {title && <h3 className={styles.title}>{titleNode}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {/* Body content */}
      {children && <div className={styles.content}>{children}</div>}

      {/* Footer — pinned to bottom */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )

  // Determine root element: caller override > <a> when href > <article>
  const Element = Root ?? (href ? 'a' : 'article')

  return (
    <Element
      className={cardClassNames}
      {...(href && !Root ? { href } : {})}
      {...(!Root && href ? { 'aria-label': title } : {})}
      {...restProps}
    >
      {inner}
    </Element>
  )
}
