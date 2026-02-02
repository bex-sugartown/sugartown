import styles from './NavigationItem.module.css'

export default function NavigationItem({ label, url, isActive, openInNewTab }) {
  const isExternal = url?.startsWith('http')
  
  const attrs = {
    href: url,
    className: `${styles.navItem} ${isActive ? styles.active : ''}`,
  }
  
  if (openInNewTab || isExternal) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }
  
  return <a {...attrs}>{label}</a>
}
