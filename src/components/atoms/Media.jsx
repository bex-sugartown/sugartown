import { urlFor } from '../../lib/sanity'
import styles from './Media.module.css'

export default function Media({ image, caption }) {
  if (!image?.asset) return null
  
  return (
    <figure className={styles.figure}>
      <img
        src={urlFor(image.asset).width(800).quality(90).url()}
        alt={image.alt || ''}
        className={styles.image}
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
