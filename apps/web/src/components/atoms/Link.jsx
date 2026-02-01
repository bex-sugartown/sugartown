import styles from './Link.module.css'

export default function Link({ label, url, openInNewTab, className = '' }) {
  const isExternal = url?.startsWith('http')
  
  const attrs = {
    href: url,
    className: `${styles.link} ${className}`,
  }
  
  if (openInNewTab || isExternal) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }
  
  return <a {...attrs}>{label}</a>
}
