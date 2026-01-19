import { urlFor } from '../lib/sanity'
import Link from './atoms/Link'
import styles from './Hero.module.css'

export default function Hero({ hero }) {
  if (!hero) return null

  const primary = hero.ctas?.[0]
  const secondary = hero.ctas?.[1]

  const backgroundStyles = {}

  if (hero.backgroundStyle === 'image' && hero.backgroundMedia?.image?.asset) {
    backgroundStyles.backgroundImage = `url(${urlFor(hero.backgroundMedia.image.asset).width(1920).url()})`
  } else if (hero.backgroundStyle === 'pink') {
    backgroundStyles.backgroundColor = 'var(--st-pink)'
  } else if (hero.backgroundStyle === 'green') {
    backgroundStyles.backgroundColor = 'var(--st-green)'
  } else if (hero.backgroundStyle === 'white') {
    backgroundStyles.backgroundColor = 'var(--st-white)'
  }

  return (
    <section
      className={styles.hero}
      style={backgroundStyles}
      data-style={hero.backgroundStyle}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {hero.heading && <h1 className={styles.heading}>{hero.heading}</h1>}
          {hero.subheading && <p className={styles.subheading}>{hero.subheading}</p>}

          {(primary || secondary) && (
            <div className={styles.actions}>
              {primary && (
                <Link
                  label={primary.label}
                  url={primary.url}
                  openInNewTab={primary.openInNewTab}
                  className={styles.primaryButton}
                />
              )}
              {secondary && (
                <Link
                  label={secondary.label}
                  url={secondary.url}
                  openInNewTab={secondary.openInNewTab}
                  className={styles.secondaryButton}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
