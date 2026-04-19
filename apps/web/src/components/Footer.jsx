import { Link as RouterLink } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { resolveNavLink } from '../lib/resolveNavUrl'
import { getCanonicalPath, FOOTER_UTILITY_LINKS } from '../lib/routes'
import { APP_VERSION, BUILD_DATE } from '../lib/buildInfo'
import Link from './atoms/Link'
import SocialLink from './atoms/SocialLink'
import styles from './Footer.module.css'

export default function Footer({ siteSettings }) {
  if (!siteSettings) return null

  const {
    siteLogo,
    footerLogo,
    siteTitle,
    tagline,
    primaryNav,
    socialLinks,
    copyrightText,
    footerToolchain,
    licenseLabel,
    licenseUrl,
  } = siteSettings

  // Footer logo = 75% of header logo width.
  // Header renders siteLogo at width(360) → width={180}px.
  // Footer renders at width(270) → width={135}px (both footerLogo and siteLogo fallback).
  const displayLogo = footerLogo?.asset ? footerLogo : siteLogo

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* ── Zone 1: brand (left) + nav columns (right) ─────────── */}
        <div className={styles.top}>
          <div className={styles.brand}>
            {displayLogo?.asset && (
              <RouterLink to="/" className={styles.logoLink}>
                <img
                  src={urlFor(displayLogo).width(270).url()}
                  alt={displayLogo.alt || `Logo: ${siteTitle || 'Home'}`}
                  width={135}
                  height={55}
                  className={styles.logoImage}
                />
              </RouterLink>
            )}
            {tagline && <p className={styles.tagline}>{tagline}</p>}
            {socialLinks && socialLinks.length > 0 && (
              <div className={styles.socialLinks}>
                {socialLinks.map((social, i) => (
                  <SocialLink
                    key={i}
                    platform={social.icon}
                    url={social.url}
                    label={social.label}
                  />
                ))}
              </div>
            )}
          </div>

          {primaryNav?.items && primaryNav.items.length > 0 && (
            <div className={styles.columns}>
              {primaryNav.items.map((item, i) => {
                const children = item.children ?? []
                return (
                  <div key={i} className={styles.column}>
                    {item.label && (
                      <h3 className={styles.columnHeading}>{item.label}</h3>
                    )}
                    {children.length > 0 && (
                      <ul className={styles.linkList}>
                        {children.map((child, j) => {
                          const { url, openInNewTab } = resolveNavLink(child)
                          return (
                            <li key={j}>
                              <Link
                                label={child.label}
                                url={url}
                                openInNewTab={openInNewTab}
                              />
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Zone 2: utility row ─────────────────────────────────── */}
        <div className={styles.utility}>
          {FOOTER_UTILITY_LINKS.map(({ label, path }) => (
            <RouterLink key={path} to={path} className={styles.utilityLink}>
              {label}
            </RouterLink>
          ))}
        </div>

        {/* ── Zone 3: colophon ────────────────────────────────────── */}
        <div className={styles.colophon}>
          <div className={styles.colophonGrid}>
            <span className={styles.colophonLabel}>Version</span>
            <span className={styles.colophonValue}>{APP_VERSION}</span>

            {footerToolchain && footerToolchain.length > 0 ? (
              <>
                <span className={styles.colophonLabel}>Toolchain</span>
                <div className={styles.chips}>
                  {footerToolchain.map((tool) => (
                    <RouterLink
                      key={tool._id}
                      to={getCanonicalPath({ docType: 'tool', slug: tool.slug })}
                      className={styles.chip}
                    >
                      {tool.name}
                    </RouterLink>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className={styles.colophonLabel}>Built</span>
                <span className={styles.colophonValue}>{BUILD_DATE}</span>
              </>
            )}

            {licenseLabel && (
              <>
                <span className={styles.colophonLabel}>License</span>
                <span className={styles.colophonValue}>
                  {licenseUrl ? (
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.colophonLink}
                    >
                      {licenseLabel}
                    </a>
                  ) : (
                    licenseLabel
                  )}
                </span>
              </>
            )}

            {footerToolchain && footerToolchain.length > 0 && (
              <>
                <span className={styles.colophonLabel}>Built</span>
                <span className={styles.colophonValue}>{BUILD_DATE}</span>
              </>
            )}
          </div>

          {copyrightText && (
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} {siteTitle}. {copyrightText}
            </p>
          )}
        </div>

      </div>
    </footer>
  )
}
