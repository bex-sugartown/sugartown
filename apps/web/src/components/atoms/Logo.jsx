import { urlFor } from '../../lib/sanity'
import styles from './Logo.module.css'

export default function Logo({ image, linkUrl = '/', width = 120 }) {
  if (!image?.asset) return null
  
  return (
    <a href={linkUrl} className={styles.logoLink}>
      <img
        src={urlFor(image.asset).width(width * 2).url()}
        alt={image.alt || 'Logo'}
        width={width}
        className={styles.logoImage}
      />
    </a>
  )
}
