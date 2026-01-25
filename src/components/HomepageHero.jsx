import styles from './HomepageHero.module.css'

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
