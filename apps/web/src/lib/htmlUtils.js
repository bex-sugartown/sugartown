/**
 * htmlUtils.js — lightweight HTML/text utilities for the web app.
 *
 * decodeHtml: decodes HTML entities in plain text strings.
 *
 * Why: Sanity content imported from WordPress (and some PortableText
 * serialisers) stores literal HTML entities in text fields — e.g.
 * "Let&#8217;s" instead of "Let's", "Product &amp; Strategy" instead
 * of "Product & Strategy". React renders these as literal characters,
 * not decoded glyphs, so we fix them at render time.
 *
 * Implementation: leverages the browser's built-in HTML parser via
 * a temporary <textarea> element — handles all numeric + named entities
 * without a dependency.
 */

/**
 * Decode HTML entities in a string.
 * Returns the original value unchanged if str is falsy or not a string,
 * or if called outside a browser context (e.g. test environments without DOM).
 *
 * @param {string|null|undefined} str
 * @returns {string}
 */
export function decodeHtml(str) {
  if (!str || typeof str !== 'string') return str
  if (typeof document === 'undefined') return str  // SSR guard (future-proof)
  const el = document.createElement('textarea')
  el.innerHTML = str
  return el.value
}
