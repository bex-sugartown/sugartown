// Typed citation markers: [N] in a plain-string field (tableBlock cells), or a
// stray one left in a Portable Text span. Pure, so the renderer (citedText.jsx)
// and validate:content share one definition of what a citation looks like (ST-221).
export const CITE_RE = /\[(\d+)\]/g

// 'A. [1] and B [2]' -> ['A.', {cite: 1}, ' and B', {cite: 2}, '']
// The space before [N] is dropped: the marker is a superscript on the word.
export function splitCitations(text) {
  if (typeof text !== 'string' || !text.includes('[')) return [text]
  const out = []
  let last = 0
  for (const m of text.matchAll(CITE_RE)) {
    const index = Number(m[1])
    if (index < 1) continue
    out.push(text.slice(last, m.index).replace(/\s+$/, ''), { cite: index })
    last = m.index + m[0].length
  }
  if (last === 0) return [text]
  out.push(text.slice(last))
  return out
}
