import { Link as RouterLink } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { resolveNavLink } from '../lib/resolveNavUrl'
import Link from './atoms/Link'
import SocialLink from './atoms/SocialLink'
import styles from './Footer.module.css'

export default function Footer({ siteSettings }) {
  if (!siteSettings) return null

  const { siteLogo, footerLogo, siteTitle, tagline, footerColumns, socialLinks, copyrightText } = siteSettings
  const displayLogo = footerLogo?.asset ? footerLogo : siteLogo

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {displayLogo?.asset && (
              <RouterLink to="/" className={styles.logoLink}>
                <img
                  src={urlFor(displayLogo.asset).width(360).url()}
                  alt={displayLogo.alt || `Logo: ${siteTitle || 'Home'}`}
                  width={180}
                  className={styles.logoImage}
                />
              </RouterLink>
            )}
            {tagline && (
              <p className={styles.tagline}>{tagline}</p>
            )}
          </div>

          {footerColumns && footerColumns.length > 0 && (
            <div className={styles.columns}>
              {footerColumns.map((column, index) => {
                const heading = column.header || null
                return (
                  <div key={index} className={styles.column}>
                    {heading && (
                      <h3 className={styles.columnHeading}>{heading}</h3>
                    )}
                    {column.items && column.items.length > 0 && (
                      <ul className={styles.linkList}>
                        {column.items.map((item, itemIndex) => {
                          const { url, openInNewTab } = resolveNavLink(item)
                          return (
                            <li key={itemIndex}>
                              <Link
                                label={item.label}
                                url={url}
                                openInNewTab={openInNewTab}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className={styles.social}>
              <h3 className={styles.columnHeading}>Connect</h3>
              <div className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <SocialLink
                    key={index}
                    platform={social.icon}
                    url={social.url}
                    label={social.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          {copyrightText && (
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} {siteTitle}. {copyrightText}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
