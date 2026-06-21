"use client";

/**
 * SiteHeader — Next.js adapter for the DS Header pattern.
 *
 * Seam diff vs apps/web Header.jsx:
 *   IDENTICAL  : visual structure (logo + nav + CTA + ThemeToggle), scroll shadow,
 *                sticky positioning, DS token references
 *   DIFFERS    : logo URL via direct Contentful CDN URL (no urlFor() transform)
 *                nav links via Next.js <Link> not React Router <Link>
 *                nav items flat (no children/dropdown — Stage 1 scope)
 *                CTA rendered as <a> (DS Button has no href prop in DS package)
 *                no Preheader, no Drawer/DrawerNav (Stage 1 scope)
 *   WHY        : React Router and urlFor() are Sanity/SPA-specific; Next.js App Router
 *                uses its own Link. Contentful assets are direct CDN URLs — no
 *                image transformation pipeline needed for Stage 1.
 */

import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import type { NormalizedSiteSettings } from "@/lib/normalizeSiteSettings";
import styles from "./SiteHeader.module.css";

export function SiteHeader({
  settings,
}: {
  settings: NormalizedSiteSettings | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--st-header-height",
        `${el.offsetHeight}px`
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [settings]);

  if (!settings) return null;

  const { siteTitle, siteLogoUrl, siteLogoAlt, primaryNav, headerCta } = settings;

  return (
    <header
      ref={headerRef}
      className={`${styles.header}${scrolled ? ` ${styles.scrolled}` : ""}`}
    >
      <div className={styles.inner}>
        {/* Logo or site title */}
        <NextLink href="/" className={styles.logoLink}>
          {siteLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={siteLogoUrl}
              alt={siteLogoAlt ?? `Logo: ${siteTitle}`}
              height={40}
              className={styles.logoImage}
            />
          ) : (
            siteTitle
          )}
        </NextLink>

        {/* Desktop nav */}
        {primaryNav && primaryNav.length > 0 && (
          <nav className={styles.nav} aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <NextLink
                key={item.url}
                href={item.url}
                className={styles.navLink}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </NextLink>
            ))}
          </nav>
        )}

        {/* Actions: CTA */}
        <div className={styles.actions}>
          {headerCta && (
            <a
              href={headerCta.url}
              className={styles.ctaLink}
              target={headerCta.openInNewTab ? "_blank" : undefined}
              rel={headerCta.openInNewTab ? "noopener noreferrer" : undefined}
            >
              {headerCta.label}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
