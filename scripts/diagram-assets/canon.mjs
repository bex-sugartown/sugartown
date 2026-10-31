/**
 * ST-182: reduce an SVG to a canonical list of tokens so two copies can be compared by content.
 *
 * Sanity re-serialises SVG on upload (attribute order, `<path/>` written as `<path></path>`, extra
 * whitespace), so a byte compare would always report drift. This keeps what the drawing says
 * (elements, their attributes, their text) and drops how it was written.
 */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return String.fromCodePoint(code)
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

const norm = (s) => decode(s).replace(/\s+/g, ' ').trim()

const TOKEN =
  /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([A-Za-z][\w:.-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g
const ATTR = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

/** Canonical tokens: `<tag a="1" b="2">`, `</tag>`, `text:...`. Self-closing tags get a close token. */
export function canonicalSvg(source) {
  const out = []
  for (const m of source.matchAll(TOKEN)) {
    const [, cdata, closing, tag, attrs, selfClose, text] = m
    if (cdata !== undefined) {
      const t = norm(cdata)
      if (t) out.push(`text:${t}`)
    } else if (tag) {
      if (closing) {
        out.push(`</${tag}>`)
        continue
      }
      const pairs = [...(attrs ?? '').matchAll(ATTR)].map((a) => `${a[1]}="${norm(a[2] ?? a[3] ?? '')}"`).sort()
      out.push(`<${tag}${pairs.length ? ' ' + pairs.join(' ') : ''}>`)
      if (selfClose) out.push(`</${tag}>`)
    } else if (text !== undefined) {
      const t = norm(text)
      if (t) out.push(`text:${t}`)
    }
  }
  return out
}

/** First difference between two SVGs, or null when they say the same thing. */
export function svgDifference(a, b) {
  const x = canonicalSvg(a)
  const y = canonicalSvg(b)
  const n = Math.max(x.length, y.length)
  for (let i = 0; i < n; i++) {
    if (x[i] !== y[i]) return { index: i, source: x[i] ?? '(end)', published: y[i] ?? '(end)' }
  }
  return null
}
