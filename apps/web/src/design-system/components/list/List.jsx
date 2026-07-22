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
  const content = (
    <>
      <span className={styles.rowTag} title={tagTitle ?? tag ?? undefined}>
        {leading}
        {tag != null && <span className={styles.rowTagText}>{tag}</span>}
      </span>
      <span className={styles.rowTitle}>{title}</span>
      {date && <time className={styles.rowDate}>{date}</time>}
    </>
  )

  // No href → a non-interactive row. Previously this fell back to href="#",
  // which made every hrefless row a focusable link that navigated nowhere.
  // href is built by the caller via getCanonicalPath(), which yields nothing
  // for an item with no slug, so this path is reachable in production. SUG-231.
  if (!href) {
    return <div className={styles.row}>{content}</div>
  }

  return (
    <a className={`${styles.row} ${styles.rowLink}`} href={href}>
      {content}
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
        {items.map((item, i) => {
          const { key, ...row } = item
          return (
            <li key={key ?? i}>
              <ListItem {...row} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
