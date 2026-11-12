import { CitationMarker } from '../design-system'
import { splitCitations } from './citations'

// Renders a typed [N] in a plain-string field (tableBlock cells cannot carry a
// Portable Text mark) as the same CitationMarker pill the citationRef mark uses,
// linking to #st-citation-N (ST-221). Like citationRef, it does not check that
// note N exists: validate:content does.
export function citedText(text) {
  const parts = splitCitations(text)
  if (parts.length === 1) return parts[0]
  return parts.map((p, i) =>
    typeof p === 'string' ? p : <CitationMarker key={i} index={p.cite} />
  )
}
