/**
 * Card — web app adapter of the DS Card visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Card/Card.tsx
 * CSS sync: Card.module.css must match DS Card.module.css (see MEMORY.md token drift rules).
 *
 * Key differences from DS Card:
 *   - Uses react-router-dom <Link> instead of <a> for SPA navigation
 *     (titleLink, categoryLink, projectLink, kpiLink).
 *   - Uses the web Chip adapter (also <Link>-based) for tags/tools.
 *   - Accepts `children` escape hatch for custom body content
 *     (used by MetadataCard for field grid, KPI list, taxonomy rows).
 *   - tags[] extended with optional `colorHex` for per-chip colour override.
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Chip from '../chip/Chip'
import styles from './Card.module.css'

// ── Status badge colours (synced with DS Card.tsx) ──────────────────────────
const STATUS_BADGE_CLASS = {
  // Legacy / generic
  draft:            styles.statusDraft,
  active:           styles.statusActive,
  archived:         styles.statusArchived,
  implemented:      styles.statusImplemented,
  // Shared / evergreen
  evergreen:        styles.statusEvergreen,
  validated:        styles.statusValidated,
  deprecated:       styles.statusDeprecated,
  // Node evolution (Studio: node.status)
  exploring:        styles.statusExploring,
  operationalized:  styles.statusOperationalized,
  // Project lifecycle (Studio: project.status)
  dreaming:         styles.statusDreaming,
  designing:        styles.statusDesigning,
  developing:       styles.statusDeveloping,
  testing:          styles.statusTesting,
  deploying:        styles.statusDeploying,
  iterating:        styles.statusIterating,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Card({
  // Layout
  variant = 'default',
  density = 'default',
  // Header
  title,
  eyebrow,
  category,
  categoryPosition = 'before',
  status,
  evolution,
  // Body
  excerpt,
  project,
  // Metadata grid (variant="metadata" only)
  metadata,
  // Chips — tags[] extended with optional colorHex for per-chip colour
  tags,
  tools,
  // Footer
  date,
  nextStep,
  aiTool,
  kpiLink,
  // Escape hatch for custom footer content (CardBuilderSection citations/tags)
  footerChildren,
  // Media
  thumbnailUrl,
  thumbnailAlt = '',
  // Colorway
  accentColor,
  // Linking
  href,
  // Escape hatch for custom body content (MetadataCard)
  children,
  // Layout overrides
  className,
}) {
  // ── Root class list ─────────────────────────────────────────────────────
  const rootClasses = [
    styles.card,
    styles[`variant-${variant}`],
    density === 'compact' && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // ── Accent color via CSS custom property ───────────────────────────────
  const accentStyle = accentColor
    ? { '--accent': accentColor }
    : undefined

  // ── Listing + thumbnail → row layout ───────────────────────────────────
  const isListingWithThumb = variant === 'listing' && !!thumbnailUrl

  // ── Title node: full-card link via ::after, or plain text ──────────────
  // Uses <Link to> for SPA navigation instead of <a href>
  const titleNode = href ? (
    <Link to={href} className={styles.titleLink} aria-label={title}>
      {title}
    </Link>
  ) : (
    title
  )

  // ── Category element ───────────────────────────────────────────────────
  const categoryEl = category ? (
    <div className={styles.category}>
      <span className={styles.categoryLabel}>Category: </span>
      <Link to={category.href} className={styles.categoryLink}>
        {category.label}
      </Link>
    </div>
  ) : null

  // ── Header ─────────────────────────────────────────────────────────────
  // evolution takes priority; status is the fallback. Never both simultaneously.
  const badgeValue = evolution ?? status

  const headerEl = (
    <div className={styles.header}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      {categoryPosition === 'before' && categoryEl}
      {badgeValue && (
        <span
          className={[styles.statusBadge, STATUS_BADGE_CLASS[badgeValue]].filter(Boolean).join(' ')}
          aria-label={`Status: ${badgeValue}`}
        >
          {badgeValue}
        </span>
      )}
      <h3 className={styles.title}>{titleNode}</h3>
      {categoryPosition === 'after' && categoryEl}
    </div>
  )

  // ── Body ───────────────────────────────────────────────────────────────
  const hasBody =
    excerpt ||
    (metadata && metadata.length > 0) ||
    (tools && tools.length > 0) ||
    (tags && tags.length > 0) ||
    project ||
    children

  const bodyEl = hasBody ? (
    <div className={styles.body}>
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      {project && (
        <div className={styles.projectAttribution}>
          <span className={styles.projectLabel}>Project: </span>
          {project.href ? (
            <Link
              to={project.href}
              className={[styles.projectLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
            >
              {project.label}
            </Link>
          ) : (
            <span className={styles.projectValue}>{project.label}</span>
          )}
        </div>
      )}

      {metadata && metadata.length > 0 && (
        <dl className={styles.metadataGrid}>
          {metadata.map(({ label, value }) => (
            <Fragment key={label}>
              <dt className={styles.metadataLabel}>{label}</dt>
              <dd className={styles.metadataValue}>{value}</dd>
            </Fragment>
          ))}
        </dl>
      )}

      {tools && tools.length > 0 && (
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>Tools</span>
          <ul className={styles.toolsRow} aria-label="Tools">
            {tools.map(({ label, href: chipHref }) => (
              <li key={label}>
                <Chip
                  label={label}
                  href={chipHref}
                  color="grey"
                  size="sm"
                  className={chipHref && href ? styles.hasCardLink : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>Tags</span>
          <ul className={styles.tagsRow} aria-label="Tags">
            {tags.map(({ label, href: chipHref, colorHex }) => (
              <li key={label}>
                <Chip
                  label={label}
                  href={chipHref}
                  colorHex={colorHex}
                  size="sm"
                  className={
                    [
                      styles.chipTag,
                      chipHref && href ? styles.hasCardLink : '',
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Escape hatch: custom body content (MetadataCard field grid, etc.) */}
      {children}
    </div>
  ) : null

  // ── Footer ─────────────────────────────────────────────────────────────
  const hasFooter = nextStep || aiTool || kpiLink || date || footerChildren

  const footerEl = hasFooter ? (
    <div className={styles.footer}>
      {(nextStep || aiTool || kpiLink || date) && (
        <>
          <div className={styles.footerLeft}>
            {nextStep && (
              <span className={styles.nextStep}>
                <span className={styles.nextStepLabel}>Next Step: </span>
                {nextStep}
              </span>
            )}
            {aiTool && (
              <span className={styles.aiTool}>
                <span className={styles.aiToolLabel}>AI: </span>
                {aiTool}
              </span>
            )}
            {kpiLink && (
              <Link
                to={kpiLink.href}
                className={[styles.kpiLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
              >
                KPIs: {kpiLink.label} →
              </Link>
            )}
          </div>
          <div className={styles.footerRight}>
            {date && (
              <time className={styles.date} dateTime={date}>
                {formatDate(date)}
              </time>
            )}
          </div>
        </>
      )}
      {footerChildren}
    </div>
  ) : null

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <article className={rootClasses} style={accentStyle}>
      {/* Hero thumbnail — default variant, full-width above header */}
      {variant === 'default' && thumbnailUrl && (
        <div className={styles.thumbnailHero}>
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt}
            className={styles.thumbnailImg}
            loading="lazy"
          />
        </div>
      )}

      {/* Listing variant: row layout when thumbnail present */}
      {isListingWithThumb ? (
        <div className={styles.listingRow}>
          <div className={styles.thumbnailRail}>
            <img
              src={thumbnailUrl}
              alt={thumbnailAlt}
              className={styles.thumbnailImg}
              loading="lazy"
            />
          </div>
          <div className={styles.listingContent}>
            {headerEl}
            {bodyEl}
            {footerEl}
          </div>
        </div>
      ) : (
        <>
          {headerEl}
          {bodyEl}
          {footerEl}
        </>
      )}
    </article>
  )
}
