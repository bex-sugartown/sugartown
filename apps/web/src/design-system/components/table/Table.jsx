/**
 * Table — web app adapter of the DS Table visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Table/Table.tsx
 * CSS sync: Table.module.css must match DS Table.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Table.module.css'

export function TableWrap({ children, className }) {
  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      {children}
    </div>
  )
}

export default function Table({ variant = 'default', children, className }) {
  const classNames = [
    styles.table,
    variant === 'responsive' ? styles.responsive : '',
    variant === 'wide' ? styles.wide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <table className={classNames}>{children}</table>
}
