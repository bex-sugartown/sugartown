import styles from './List.module.css'

/**
 * List / ListItem — web adapter mirror of the DS primitive
 * (packages/design-system/src/components/List). Content-agnostic ledger
 * "register" list. The gutter status dot is supplied by the caller via
 * `leading` (colour is a content concern owned by the app adapter).
 *
 * Keep this file and List.module.css in sync with the DS package copy
 * (Mirrored File Registry). SUG-167.
 */

export function ListItem({ tag, tagTitle, leading, title, date, href }) {
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

export function List({ variant = 'register', items = [], title, count }) {
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
