/**
 * trackCtaClick.js — GA4 `cta_click` event for CMS-authored CTA buttons.
 *
 * Sends only when analytics consent is granted. Otherwise it does nothing:
 * nothing is pushed to dataLayer, and nothing is queued to replay after a
 * later accept. Never calls preventDefault, so navigation is never delayed.
 *
 * Usage (call site passes it through Button's rest props):
 *   <Button onClickCapture={() => trackCtaClick({ label, style, section: 'hero', url })} />
 *
 * #145
 */

import { getConsent } from './consent.js'
import { isExternalUrl, toInternalPath } from './linkUtils.js'

export function trackCtaClick({ label, style, section, url }) {
  if (getConsent() !== 'granted') return
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  window.gtag('event', 'cta_click', {
    cta_label: label ?? '',
    cta_style: style ?? '',
    cta_section: section ?? '',
    link_url: url ?? '',
    // An absolute link to this site's own host is internal, matching Button routing.
    outbound: isExternalUrl(url) && toInternalPath(url) === null,
  })
}
