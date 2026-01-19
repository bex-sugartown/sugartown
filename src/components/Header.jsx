import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { headerQuery } from '../lib/queries'
import Logo from './atoms/Logo'
import NavigationItem from './atoms/NavigationItem'
import Link from './atoms/Link'
import styles from './Header.module.css'

export default function Header() {
  const [header, setHeader] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    client
      .fetch(headerQuery)
      .then((data) => {
        setHeader(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching header:', error)
        setLoading(false)
      })
  }, [])
  
  if (loading) return null
  if (!header) return null
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {header.logo && (
          <Logo
            image={header.logo.image}
            linkUrl={header.logo.linkUrl}
            width={header.logo.width}
          />
        )}
        
        {header.navigation && header.navigation.length > 0 && (
          <nav className={styles.nav}>
            {header.navigation.map((item, index) => (
              <NavigationItem
                key={index}
                label={item.label}
                url={item.url}
                isActive={item.isActive}
                openInNewTab={item.openInNewTab}
              />
            ))}
          </nav>
        )}
        
        {header.ctaButton && (
          <div className={styles.cta}>
            <Link
              label={header.ctaButton.label}
              url={header.ctaButton.url}
              openInNewTab={header.ctaButton.openInNewTab}
              className={styles.ctaButton}
            />
          </div>
        )}
      </div>
    </header>
  )
}
