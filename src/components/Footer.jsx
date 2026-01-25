import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { siteSettingsQuery } from '../lib/queries'
import Logo from './atoms/Logo'
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

  const { siteLogo, tagline, footerColumns, socialLinks, copyrightText } = settings

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {siteLogo && (
              <Logo
                image={siteLogo}
                linkUrl="/"
              />
            )}
            {tagline && (
              <p className={styles.tagline}>{tagline}</p>
            )}
          </div>

          {footerColumns && footerColumns.length > 0 && (
            <div className={styles.columns}>
              {footerColumns.map((column, index) => (
                <div key={index} className={styles.column}>
                  {column.title && (
                    <h3 className={styles.columnHeading}>{column.title}</h3>
                  )}
                  {column.items && column.items.length > 0 && (
                    <ul className={styles.linkList}>
                      {column.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
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
            <p className={styles.copyright}>{copyrightText}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
