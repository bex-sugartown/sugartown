import styles from './PageHeader.module.css'

export function PageHeader({
  breadcrumb,
  media,
  eyebrow,
  title,
  description,
  count,
  metadataCard,
  actions,
  tint,
  className,
}) {
  const tintStyle = tint ? { '--page-header-tint': tint } : undefined

  const hasTopRow = breadcrumb || actions

  return (
    <div
      className={[styles.root, tint ? styles.tinted : undefined, className]
        .filter(Boolean)
        .join(' ')}
      style={tintStyle}
    >
      <div className={styles.inner}>
        {hasTopRow && (
          <div className={styles.topRow}>
            {breadcrumb && <div className={styles.breadcrumbSlot}>{breadcrumb}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        )}

        <div className={styles.body}>
          {media && <div className={styles.media}>{media}</div>}

          <div className={styles.content}>
            {eyebrow && (
              <p className={styles.eyebrow} aria-label={eyebrow}>
                {eyebrow}
              </p>
            )}

            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              {count !== undefined && (
                <span className={styles.count} aria-label={`${count} items`}>
                  {count}
                </span>
              )}
            </div>

            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>

        {metadataCard && <div className={styles.metadataCard}>{metadataCard}</div>}
      </div>
    </div>
  )
}
