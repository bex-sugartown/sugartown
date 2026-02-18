/**
 * SeoHead — injects SEO meta tags into document.head for the current page.
 *
 * This is a client-side SPA (Vite + React, no SSR), so we use useEffect to
 * imperatively set document.head tags. Each tag is cleaned up when the
 * component unmounts (navigating away), preventing stale tags from leaking
 * between routes.
 *
 * Usage:
 *   import SeoHead from '../components/SeoHead'
 *   import { resolveSeo } from '../lib/seo'
 *   import { useSiteSettings } from '../lib/SiteSettingsContext'
 *
 *   const siteSettings = useSiteSettings()
 *   const seo = resolveSeo({ docSeo: doc.seo, docTitle: doc.title, docType: 'post', docSlug: doc.slug?.current, siteDefaults: siteSettings })
 *   return <><SeoHead seo={seo} /><main>...</main></>
 *
 * Props:
 *   seo {object} — SeoResolved object from resolveSeo()
 *     .title         {string|null}
 *     .description   {string|null}
 *     .canonicalUrl  {string|null}
 *     .robots        { index: bool, follow: bool }
 *     .openGraph     { title, description, image: { asset: { url } }, type }
 */
import { useEffect } from 'react'
import { urlFor } from '../lib/sanity'

// ─── helpers ──────────────────────────────────────────────────────────────────

function setMeta(name, content, attr = 'name') {
  if (!content) return null
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return el
}

function setLink(rel, href) {
  if (!href) return null
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  return el
}

function removeEl(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el)
}

// ─── component ────────────────────────────────────────────────────────────────

export default function SeoHead({ seo }) {
  useEffect(() => {
    if (!seo) return

    // ── <title> ──────────────────────────────────────────────────────────────
    const prevTitle = document.title
    if (seo.title) document.title = seo.title

    // ── <meta name="description"> ────────────────────────────────────────────
    const descEl = setMeta('description', seo.description)

    // ── <link rel="canonical"> ───────────────────────────────────────────────
    const canonEl = setLink('canonical', seo.canonicalUrl)

    // ── <meta name="robots"> ─────────────────────────────────────────────────
    const robotsContent =
      seo.robots
        ? [
            seo.robots.index ? 'index' : 'noindex',
            seo.robots.follow ? 'follow' : 'nofollow',
          ].join(', ')
        : null
    const robotsEl = setMeta('robots', robotsContent)

    // ── Open Graph ───────────────────────────────────────────────────────────
    const ogTitleEl = setMeta('og:title', seo.openGraph?.title, 'property')
    const ogDescEl = setMeta('og:description', seo.openGraph?.description, 'property')
    const ogTypeEl = setMeta('og:type', seo.openGraph?.type || 'website', 'property')
    const ogUrlEl = setMeta('og:url', seo.canonicalUrl, 'property')

    // og:image — resolve Sanity image ref to URL via urlForImage
    let ogImageEl = null
    const ogImageAsset = seo.openGraph?.image
    if (ogImageAsset) {
      try {
        const imgUrl = urlFor(ogImageAsset).width(1200).height(630).url()
        ogImageEl = setMeta('og:image', imgUrl, 'property')
      } catch {
        // urlForImage may throw if asset ref is malformed — fail silently
      }
    }

    // ── Twitter Card ─────────────────────────────────────────────────────────
    const twitterCardEl = setMeta('twitter:card', 'summary_large_image')
    const twitterTitleEl = setMeta('twitter:title', seo.openGraph?.title || seo.title)
    const twitterDescEl = setMeta('twitter:description', seo.openGraph?.description || seo.description)

    // ── Cleanup on unmount / seo change ──────────────────────────────────────
    return () => {
      document.title = prevTitle

      // Only remove elements this effect created (not pre-existing ones from
      // the static HTML template). We can't reliably tell the difference, so
      // we reset to empty content rather than removing the node — this avoids
      // flickering 404 pages from briefly showing the previous doc's title.
      if (descEl) descEl.setAttribute('content', '')
      removeEl(canonEl)
      if (robotsEl) robotsEl.setAttribute('content', '')
      if (ogTitleEl) ogTitleEl.setAttribute('content', '')
      if (ogDescEl) ogDescEl.setAttribute('content', '')
      if (ogTypeEl) ogTypeEl.setAttribute('content', '')
      if (ogUrlEl) ogUrlEl.setAttribute('content', '')
      removeEl(ogImageEl)
      if (twitterCardEl) twitterCardEl.setAttribute('content', '')
      if (twitterTitleEl) twitterTitleEl.setAttribute('content', '')
      if (twitterDescEl) twitterDescEl.setAttribute('content', '')
    }
  }, [seo])

  // Renders nothing — side-effects only
  return null
}
