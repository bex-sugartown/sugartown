/**
 * TODO Epic 7 — EditorialCard is a CMS-connected component (uses urlFor from Sanity)
 * and cannot be directly replaced by the design system Card.
 * The canonical visual primitive for content cards lives in:
 *   @sugartown/design-system → Card (packages/design-system/src/components/Card/)
 * The design system Card follows the st-card spec: pink border, serif title,
 * eyebrow/header/footer BEM structure, spec-compliant hover shadow.
 * This component serves CMS page sections where Sanity image transformation is needed.
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
