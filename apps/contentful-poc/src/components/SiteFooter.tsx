/**
 * SiteFooter — Next.js adapter for the DS Footer pattern. Server component.
 *
 * Seam diff vs apps/web Footer.jsx:
 *   IDENTICAL  : brand zone (logo + tagline + social), footer columns, colophon,
 *                DS token references throughout
 *   DIFFERS    : footer columns via Contentful footerColumns[] (each navigationMenu
 *                entry: title = column heading, items[] = links) vs Sanity footer
 *                which uses primaryNav.items[].children for column structure
 *                social links via fields.platform/url/label vs Sanity SocialLink atom
 *                no footerToolchain chips (Stage 1 scope)
 *                no APP_VERSION / BUILD_DATE (Next.js build — not Vite defines)
 *                no FOOTER_UTILITY_LINKS / TRUST_LINKS (Sanity-specific route registry)
 *   WHY        : Contentful uses atomic linked entries for nav structure; Sanity uses
 *                nested inline objects. The wire format differs; the rendered output is
 *                structurally identical. Route registry and build-time constants are
 *                tied to the Sanity/Vite app — not applicable in the Next.js adapter.
 */

import NextLink from "next/link";
import type { NormalizedSiteSettings } from "@/lib/normalizeSiteSettings";
import styles from "./SiteFooter.module.css";

export function SiteFooter({
  settings,
}: {
  settings: NormalizedSiteSettings | null;
}) {
  if (!settings) return null;

  const {
    siteTitle,
    tagline,
    footerColumns,
    socialLinks,
    copyrightText,
    licenseLabel,
    licenseUrl,
  } = settings;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand zone */}
          <div className={styles.brand}>
            <NextLink href="/" className={styles.brandLink}>
              {siteTitle}
            </NextLink>
            {tagline && <p className={styles.tagline}>{tagline}</p>}
            {socialLinks.length > 0 && (
              <ul className={styles.socialLinks} aria-label="Social links">
                {socialLinks.map((sl) => (
                  <li key={sl.url}>
                    <a
                      href={sl.url}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={sl.label ?? sl.platform}
                    >
                      {sl.label ?? sl.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Navigation columns */}
          {footerColumns.length > 0 && (
            <nav className={styles.columns} aria-label="Footer navigation">
              {footerColumns.map((col) => (
                <div key={col.title} className={styles.column}>
                  <p className={styles.columnHeading}>{col.title}</p>
                  {col.items.length > 0 && (
                    <ul className={styles.columnLinks}>
                      {col.items.map((item) => (
                        <li key={item.url}>
                          <a
                            href={item.url}
                            className={styles.columnLink}
                            target={item.openInNewTab ? "_blank" : undefined}
                            rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Colophon */}
        <div className={styles.colophon}>
          {copyrightText && (
            <p className={styles.copyright}>{copyrightText}</p>
          )}
          {licenseLabel && licenseUrl && (
            <a
              href={licenseUrl}
              className={styles.license}
              target="_blank"
              rel="noopener noreferrer"
            >
              {licenseLabel}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
