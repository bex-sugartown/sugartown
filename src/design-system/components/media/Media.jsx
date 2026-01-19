import styles from './Media.module.css'

export default function Media({ src, alt = '', caption }) {
  if (!src) return null

  return (
    <figure className={styles.figure}>
      <img src={src} alt={alt} className={styles.image} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}

