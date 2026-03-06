/**
 * @deprecated EPIC-0160 — replaced by CardBuilderSection + cardBuilderItem schema.
 * Use CardBuilderSection for editor-assembled card grids on pages.
 * This component is kept for backward compatibility with existing content only.
 * Do not use in new code — it will be removed in a future version.
 */
import { urlFor } from '../lib/sanity'
import Link from './atoms/Link'
import styles from './EditorialCard.module.css'

export default function EditorialCard({ card }) {
  if (!card) return null

  const { title, description, image, link } = card

  const cardContent = (
    <>
      {image?.asset && (
        <div className={styles.imageWrapper}>
          <img
            src={urlFor(image.asset).width(400).quality(85).url()}
            alt={image.alt || title || ''}
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && <p className={styles.description}>{description}</p>}
        {link?.label && (
          <span className={styles.linkText}>{link.label}</span>
        )}
      </div>
    </>
  )

  if (link?.url) {
    return (
      <a
        href={link.url}
        className={styles.card}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {cardContent}
      </a>
    )
  }

  return <div className={styles.card}>{cardContent}</div>
}
