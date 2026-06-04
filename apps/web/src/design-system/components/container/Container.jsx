import styles from './Container.module.css'

const SIZE_CLASS = {
  reading: styles.reading,
  detail:  styles.detail,
  archive: styles.archive,
  bleed:   styles.bleed,
}

export default function Container({ size = 'reading', as, children, className }) {
  const Tag = as || 'div'
  return (
    <Tag className={[styles.container, SIZE_CLASS[size], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
