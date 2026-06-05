import { Link } from 'react-router-dom'
import { getLinkProps } from '../lib/linkUtils'
import styles from './StatCard.module.css'

export default function StatCard({
  label,
  labelColor = 'ink',
  value,
  unit,
  sub,
  body,
  bodyClamp = true,
  chip,
  foot,
  href,
  loading = false,
  titleSize = '2xl',
}) {
  const inner = (
    <>
      {label && (
        <div className={[
          styles.label,
          labelColor === 'brand' ? styles.labelBrand : styles.labelInk,
        ].join(' ')}>
          {loading ? <span className={styles.skeleton} style={{ width: '50px', display: 'inline-block' }} /> : label}
        </div>
      )}
      {(value != null || loading) && (
        <div className={[styles.value, styles[`titleSize-${titleSize}`]].filter(Boolean).join(' ')}>
          {loading
            ? <span className={styles.skeleton} style={{ width: '80%' }} />
            : <>{value}{unit && <span className={styles.unit}>{unit}</span>}</>
          }
        </div>
      )}
      {sub && !loading && <div className={styles.sub}>{sub}</div>}
      {body && !loading && <div className={bodyClamp ? styles.body : styles.bodyFull}>{body}</div>}
      {chip && !loading && <div className={styles.chip}>{chip}</div>}
      {foot && !loading && <div className={styles.foot}>{foot}</div>}
    </>
  )

  const wrapClass = [styles.statCard, href ? styles.linked : ''].filter(Boolean).join(' ')

  if (!href || loading) return <div className={wrapClass}>{inner}</div>

  const { isExternal, linkProps } = getLinkProps(href)
  if (isExternal) return <a className={wrapClass} {...linkProps}>{inner}</a>
  return <Link to={href} className={wrapClass}>{inner}</Link>
}
