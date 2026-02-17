import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { footerQuery, siteSettingsQuery } from '../lib/queries'
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
  if (!footer) return null
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {footer.logo && (
              <Logo
                image={footer.logo.image}
                linkUrl={footer.logo.linkUrl}
                width={footer.logo.width}
              />
            )}
            {footer.tagline && (
              <p className={styles.tagline}>{footer.tagline}</p>
            )}
          </div>
          
          {footer.navigationColumns && footer.navigationColumns.length > 0 && (
            <div className={styles.columns}>
              {footerColumns.map((column, index) => (
                <div key={index} className={styles.column}>
                  {column.title && (
                    <h3 className={styles.columnHeading}>{column.title}</h3>
                  )}
                  {column.items && column.items.length > 0 && (
                    <ul className={styles.linkList}>
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
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
          
          {footer.socialLinks && footer.socialLinks.length > 0 && (
            <div className={styles.social}>
              <h3 className={styles.columnHeading}>Connect</h3>
              <div className={styles.socialLinks}>
                {footer.socialLinks.map((social, index) => (
                  <SocialLink
                    key={index}
                    platform={social.platform}
                    url={social.url}
                    label={social.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          {footer.copyrightText && (
            <p className={styles.copyright}>{footer.copyrightText}</p>
          )}
          {footer.legalLinks && footer.legalLinks.length > 0 && (
            <div className={styles.legalLinks}>
              {footer.legalLinks.map((link, index) => (
                <Link
                  key={index}
                  label={link.label}
                  url={link.url}
                  openInNewTab={link.openInNewTab}
                  className={styles.legalLink}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
