import styles from './Columns.module.css'

export default function Columns({ count = 2, gap = '5', collapse = 'md', children, className }) {
  return (
    <div
      className={[styles.columns, styles[`count-${count}`], styles[`collapse-${collapse}`], className].filter(Boolean).join(' ')}
      style={{ '--columns-gap': `var(--st-space-${gap})` }}
    >
      {children}
    </div>
  )
}
