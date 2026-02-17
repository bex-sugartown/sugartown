import styles from './HomepageHero.module.css'

/**
 * @deprecated Not used anywhere in the app. Superseded by the heroSection
 * block inside PageSections.jsx, which reads from the `page` document's
 * `sections` array via pageBySlugQuery. Safe to delete once confirmed.
 */
export default function HomepageHero({ title, subtitle }) {
  if (!title && !subtitle) return null

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </section>
  )
}
