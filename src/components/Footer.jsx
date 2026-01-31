import { useEffect, useState } from 'react'
import { client, urlFor } from '../lib/sanity'
import { siteSettingsQuery } from '../lib/queries'
import Link from './atoms/Link'
import SocialLink from './atoms/SocialLink'
import styles from './Footer.module.css'

export default function Footer() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(siteSettingsQuery)
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching site settings:', error)
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (!settings) return null

  const footerColumns = settings.footerColumns || []
  const socialLinks = settings.socialLinks || []

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {settings.siteLogo?.asset && (
              <a href="/" className={styles.logoLink}>
                <img
                  src={urlFor(settings.siteLogo.asset).width(240).url()}
                  alt={settings.siteTitle || 'Logo'}
                  width={120}
                  className={styles.logoImage}
                />
              </a>
            )}
          </div>

          {footerColumns.length > 0 && (
            <div className={styles.columns}>
              {footerColumns.map((column, index) => (
                <div key={index} className={styles.column}>
                  {column.title && (
                    <h3 className={styles.columnHeading}>{column.title}</h3>
                  )}
                  {column.items && column.items.length > 0 && (
                    <ul className={styles.linkList}>
                      {column.items.map((item) => (
                        <li key={item._key}>
                          <Link
                            label={item.label}
                            url={item.link?.url}
                            openInNewTab={item.link?.openInNewTab}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className={styles.social}>
              <h3 className={styles.columnHeading}>Connect</h3>
              <div className={styles.socialLinks}>
                {socialLinks.map((social) => (
                  <SocialLink
                    key={social._key}
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
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {settings.siteTitle || 'Sugartown'}.{' '}
            {settings.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  )
}
