import { Link } from 'react-router-dom'
import { getLinkProps } from '../../../lib/linkUtils'
import Chip from '../chip/Chip'
import styles from './Tile.module.css'

/**
 * Tile — labeled surface for metric display and content preview.
 *
 * Replaces StatTile (metric mode) and TickerCard (content preview mode).
 * Renders as Link/a when href is provided, div otherwise.
 *
 * SUG-96
 */
export default function Tile({
  label,
  labelColor = 'ink',
  title,
  value,        // alias for title — callers from metric context use this
  unit,
  sub,
  body,
  bodyClamp = true,
  chip,
  meta,
  bar,
  legend = false,
  extraLegend,
  href,
  loading = false,
  size = 'md',
  titleSize = 'display',
  className,
}) {
  const primaryContent = title ?? value

  const classNames = [
    styles.tile,
    size === 'sm' ? styles.sm : '',
    href ? styles.linked : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const barTotal = bar?.total ?? bar?.segments?.reduce((sum, s) => sum + s.value, 0) ?? 0

  const inner = (
    <>
      {label && (
        <span className={[
          styles.label,
          labelColor === 'brand' ? styles.labelBrand : styles.labelInk,
        ].join(' ')}>
          {loading ? <span className={styles.skeleton} style={{ width: '50px', display: 'inline-block' }} /> : label}
        </span>
      )}

      {(primaryContent != null || loading) && (
        <div className={[styles.value, styles[`titleSize-${titleSize}`]].join(' ')}>
          {loading
            ? <span className={styles.skeleton} style={{ width: '80%' }} />
            : <>
                {primaryContent}
                {unit && <span className={styles.unit}>{unit}</span>}
              </>
          }
        </div>
      )}

      {sub && !loading && <span className={styles.sub}>{sub}</span>}
      {body && !loading && <p className={bodyClamp ? styles.body : styles.bodyFull}>{body}</p>}

      {chip && !loading && (
        <Chip variant="tag" label={chip} className={styles.chip} />
      )}

      {bar?.segments?.length > 0 && !loading && (
        <div className={styles.barWrap}>
          <div className={styles.barTrack}>
            {bar.segments.map((seg, i) => (
              <div
                key={i}
                className={styles.barSegment}
                style={{
                  width: `${(seg.value / barTotal) * 100}%`,
                  background: seg.color ?? 'var(--st-color-accent)',
                }}
                title={`${seg.label}: ${seg.value}`}
              />
            ))}
          </div>
          {legend && (
            <ul className={styles.legend}>
              {bar.segments.map((seg, i) => (
                <li key={i} className={styles.legendItem}>
                  <span className={styles.legendSwatch} style={{ background: seg.color ?? 'var(--st-color-accent)' }} />
                  <span className={styles.legendLabel}>{seg.label}</span>
                  <span className={styles.legendValue}>{seg.value}</span>
                </li>
              ))}
              {extraLegend?.length > 0 && extraLegend.map((row, i) => (
                <li key={`extra-${i}`} className={`${styles.legendItem} ${styles.legendItemExtra}`}>
                  <span className={styles.legendSwatchEmpty} />
                  <span className={styles.legendLabel}>{row.label}</span>
                  <span className={styles.legendValue}>{row.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {meta && (
        <div className={styles.meta}>
          {loading ? <span className={styles.skeleton} style={{ width: '60%' }} /> : meta}
        </div>
      )}
    </>
  )

  if (!href || loading) return <div className={classNames}>{inner}</div>

  const { isExternal, linkProps } = getLinkProps(href)
  if (isExternal) return <a className={classNames} {...linkProps}>{inner}</a>
  return <Link to={href} className={classNames}>{inner}</Link>
}
