/**
 * markGlossaryFirstOccurrences — pre-processes a PortableText block array to
 * mark the first occurrence of each glossary term slug with `_firstOccurrence: true`
 * on the markDef object.
 *
 * GlossaryTermAnnotation reads `value._firstOccurrence` to decide whether to
 * render as <dfn> (first occurrence, semantic definition) or <span>.
 *
 * Apply at each PortableText call site before passing blocks to <PortableText>.
 * The function is pure and idempotent — safe to apply multiple times.
 */
export function markGlossaryFirstOccurrences(blocks) {
  if (!blocks?.length) return blocks
  const seen = new Set()
  return blocks.map(block => {
    if (block._type !== 'block' || !block.markDefs?.length) return block
    const newMarkDefs = block.markDefs.map(def => {
      if (def._type !== 'glossaryTermRef') return def
      const slug = def.term?.slug
      if (!slug) return def
      if (seen.has(slug)) return def
      seen.add(slug)
      return { ...def, _firstOccurrence: true }
    })
    return { ...block, markDefs: newMarkDefs }
  })
}
