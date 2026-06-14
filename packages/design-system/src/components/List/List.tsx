import type { ReactNode } from 'react'
import styles from './List.module.css'

/**
 * List / ListItem — ledger "register" list presentation of a content collection.
 *
 * Sibling of Card (grid mode). This is the content-agnostic presentational
 * layer: it knows nothing about content types or status enums. The gutter
 * status dot is supplied by the caller via `leading` (its colour is a content
 * concern owned by the app adapter), keeping this primitive reusable.
 *
 * Variant model: `register` is the only variant today; it lives as a class on
 * the <ul>. Future variants extend the prop, never fork the component.
 *
 * SUG-167.
 */

export type ListVariant = 'register'

export interface ListRow {
  /** Stable key; falls back to array index. */
  key?: string
  /** Gutter label, rendered uppercase mono (e.g. a category or status). */
  tag?: string
  /** Full label for the title="" tooltip when the tag truncates. Defaults to `tag`. */
  tagTitle?: string
  /** Optional node rendered before the tag text — e.g. a status dot. */
  leading?: ReactNode
  /** Row title (narrative serif). */
  title: string
  /** Pre-formatted date string, e.g. "28 Apr 2026". */
  date?: string
  /** Destination. Build via getCanonicalPath() at the call site. */
  href?: string
}

export interface ListItemProps extends ListRow {}

export interface ListProps {
  variant?: ListVariant
  items?: ListRow[]
  /** Optional section-head title. Omit to render the list with no head. */
  title?: string
  /** Count shown right-aligned in the head; defaults to items.length. */
  count?: number
}

export function ListItem({ tag, tagTitle, leading, title, date, href }: ListItemProps) {
  return (
    <a className={styles.row} href={href || '#'}>
      <span className={styles.rowTag} title={tagTitle ?? tag ?? undefined}>
        {leading}
        {tag != null && <span className={styles.rowTagText}>{tag}</span>}
      </span>
      <span className={styles.rowTitle}>{title}</span>
      {date && <time className={styles.rowDate}>{date}</time>}
    </a>
  )
}

export function List({ variant = 'register', items = [], title, count }: ListProps) {
  return (
    <div className={styles.listBlock}>
      {title && (
        <div className={styles.listHead}>
          <h2 className={styles.listHeadTitle}>{title}</h2>
          <span className={styles.listHeadCount}>{count != null ? count : items.length}</span>
        </div>
      )}
      <ul className={`${styles.list} ${styles[variant]}`}>
        {items.map((item, i) => (
          <li key={item.key ?? i}>
            <ListItem {...item} />
          </li>
        ))}
      </ul>
    </div>
  )
}
