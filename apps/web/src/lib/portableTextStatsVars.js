/**
 * portableTextStatsVars.js — SUG-67 PortableText variable pre-processor
 *
 * Walks a PortableText block array and replaces {{namespace.path}} tokens
 * in text spans before the array is passed to <PortableText>.
 *
 * This is a pure data transform — it does not modify the serializer config.
 * Apply it at the call site: <PortableText value={preprocessPortableText(blocks)} />
 *
 * Only processes blocks of _type "block". Non-block types (images, custom
 * sections) are passed through untouched.
 */

import { interpolateStatsVars } from './stats'

/**
 * Preprocesses a PortableText block array, replacing all {{token}} references.
 *
 * @param {Array}  blocks   PortableText value (array of block objects)
 * @param {object} [data]   Override stats data (defaults to imported stats)
 * @param {object} [opts]   Options forwarded to interpolateStatsVars
 * @returns {Array}         New block array with tokens replaced; original untouched
 */
export function preprocessPortableText(blocks, data, opts) {
  if (!Array.isArray(blocks) || blocks.length === 0) return blocks

  // Skip the whole pass if no block contains a token (fast path)
  const raw = JSON.stringify(blocks)
  if (!raw.includes('{{')) return blocks

  return blocks.map(block => {
    if (block._type !== 'block' || !Array.isArray(block.children)) return block
    const processedChildren = block.children.map(span => {
      if (typeof span.text !== 'string' || !span.text.includes('{{')) return span
      return { ...span, text: interpolateStatsVars(span.text, data, opts) }
    })
    return { ...block, children: processedChildren }
  })
}
