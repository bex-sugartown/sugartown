import styles from './Surface.module.css'

const ELEVATION_CLASS = {
  0: styles.elevation0,
  1: styles.elevation1,
  2: styles.elevation2,
  3: styles.elevation3,
}

export default function Surface({ elevation = 1, as, children, className }) {
  const Tag = as || 'div'
  return (
    <Tag className={[styles.surface, ELEVATION_CLASS[elevation], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
