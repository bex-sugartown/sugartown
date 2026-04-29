import styles from './StatTile.module.css'

/**
 * StatTile — labeled metric tile with optional breakdown bar + legend.
 *
 * Used by TrustReportSection (SUG-87) and KPI Dashboard Cards (SUG-19).
 * Lives in apps/web adapter layer; extract to packages/design-system when SUG-19 activates.
 */
export default function StatTile({
  label,
  value,
  unit,
  sub,
  bar,
  legend = false,
  size = 'md',
  className,
}) {
  const classNames = [
    styles.tile,
    size === 'sm' ? styles.sm : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const barTotal = bar?.total ?? bar?.segments?.reduce((sum, s) => sum + s.value, 0) ?? 0

  return (
    <div className={classNames}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>

      {sub && <span className={styles.sub}>{sub}</span>}

      {bar?.segments?.length > 0 && (
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
                  <span
                    className={styles.legendSwatch}
                    style={{ background: seg.color ?? 'var(--st-color-accent)' }}
                  />
                  <span className={styles.legendLabel}>{seg.label}</span>
                  <span className={styles.legendValue}>{seg.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
