import Link from './atoms/Link'
import styles from './Callout.module.css'

/**
 * Get style class based on callout style from Sanity
 */
function getStyleClass(style) {
  switch (style) {
    case 'seafoam':
      return styles.seafoam
    case 'dark':
      return styles.dark
    case 'light':
      return styles.light
    case 'pink':
    default:
      return styles.pink
  }
}

export default function Callout({ callout }) {
  if (!callout?.text) return null

  const { text, link, style } = callout

  return (
    <div className={`${styles.callout} ${getStyleClass(style)}`}>
      <p className={styles.text}>{text}</p>
      {link?.url && (
        <Link
          label={link.label}
          url={link.url}
          openInNewTab={link.openInNewTab}
          className={styles.link}
        />
      )}
    </div>
  )
}
