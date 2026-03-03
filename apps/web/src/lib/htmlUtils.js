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

/**
 * Decode HTML entities in all span text nodes within a PortableText value.
 *
 * Why: Sanity content migrated from WordPress stores literal HTML entity
 * strings (e.g. &#8220;) in PortableText span.text fields. @portabletext/react
 * passes span.text through React's JSX renderer which does NOT decode HTML
 * entities (unlike innerHTML). This pre-processes the blocks array so entities
 * are resolved to actual Unicode characters before the tree reaches React.
 *
 * Only `_type: "block"` blocks with `children` arrays are walked.
 * All other block types (richImage, code, etc.) are returned unchanged.
 *
 * @param {Array|null|undefined} blocks  — Portable Text value array
 * @returns {Array}
 */
export function decodePortableText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return blocks
  return blocks.map((block) => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return block
    const decodedChildren = block.children.map((span) => {
      if (span._type !== 'span' || typeof span.text !== 'string') return span
      return { ...span, text: decodeHtml(span.text) }
    })
    return { ...block, children: decodedChildren }
  })
}
