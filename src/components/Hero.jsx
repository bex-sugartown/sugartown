import { urlFor } from '../lib/sanity'
import Link from './atoms/Link'
import styles from './Hero.module.css'
import { Button } from '../design-system'

export default function Hero({ hero }) {
  if (!hero) return null

  const primary = hero.ctas?.[0]
  const secondary = hero.ctas?.[1]

  const backgroundStyles = {}

  if (hero.backgroundStyle === 'image' && hero.backgroundMedia?.image?.asset) {
    const img = hero.backgroundMedia.image

    // Default to center if no hotspot is set
    const x = img.hotspot?.x ?? 0.5
    const y = img.hotspot?.y ?? 0.5

    backgroundStyles.backgroundImage = `url(${urlFor(img.asset).width(1920).quality(90).url()})`

    // This is the key: aim the CSS crop at the hotspot
    backgroundStyles.backgroundPosition = `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
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
              <Button
                variant="primary"
                href={primary.url}
                target={primary.openInNewTab ? '_blank' : undefined}
                rel={primary.openInNewTab ? 'noreferrer' : undefined}
                className={styles.primaryButton}
              >
                {primary.label}
              </Button>
            )}

            {secondary && (
              <Button
                variant="secondary"
                href={secondary.url}
                target={secondary.openInNewTab ? '_blank' : undefined}
                rel={secondary.openInNewTab ? 'noreferrer' : undefined}
                className={styles.secondaryButton}
              >
                {secondary.label}
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
