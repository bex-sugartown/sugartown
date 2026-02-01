import Link from './atoms/Link'
import styles from './Preheader.module.css'

/**
 * Checks if the preheader should be displayed based on publish/unpublish dates
 */
function isPreheaderActive(preheader) {
  if (!preheader) return false

  const now = new Date()

  // Check publish date
  if (preheader.publishAt) {
    const publishDate = new Date(preheader.publishAt)
    if (now < publishDate) return false
  }

  // Check unpublish date
  if (preheader.unpublishAt) {
    const unpublishDate = new Date(preheader.unpublishAt)
    if (now > unpublishDate) return false
  }

  return true
}

export default function Preheader({ preheader }) {
  if (!preheader || !isPreheaderActive(preheader)) {
    return null
  }

  const bgColorClass = preheader.backgroundColor
    ? styles[`bg${preheader.backgroundColor.charAt(0).toUpperCase() + preheader.backgroundColor.slice(1)}`]
    : styles.bgPink

  return (
    <div className={`${styles.preheader} ${bgColorClass}`}>
      <div className={styles.container}>
        {preheader.message && (
          <span className={styles.message}>{preheader.message}</span>
        )}
        {preheader.link?.url && (
          <Link
            label={preheader.link.label || 'Learn more'}
            url={preheader.link.url}
            openInNewTab={preheader.link.openInNewTab}
            className={styles.link}
          />
        )}
      </div>
    </div>
  )
}
