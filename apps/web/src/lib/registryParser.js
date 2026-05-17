/**
 * registryParser — parses component-registry.md into structured section data.
 *
 * Used by DesignSystemRegistryPage to render the registry without duplicating
 * content. The MD file remains the authoritative source; this module transforms
 * it for rendering only.
 */

/** Strip markdown formatting from a cell value. */
function stripMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')        // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')      // italic
    .replace(/~~([^~]+)~~/g, '$1')      // strikethrough
    .trim()
}

/**
 * Parse a single markdown table block into { columns, rows }.
 * Lines must already be filtered to just the table lines for one table.
 */
function parseTable(tableLines) {
  // First line = header, second = separator (|---|), rest = data
  const [headerLine, , ...dataLines] = tableLines
  if (!headerLine) return null

  const columns = headerLine
    .split('|')
    .slice(1, -1)
    .map((c) => stripMarkdown(c))

  const rows = dataLines
    .filter((l) => /\|/.test(l))
    .map((l) => {
      const isRetired = /^\|\s*~~/.test(l)
      const cells = l.split('|').slice(1, -1).map((c) => stripMarkdown(c))
      return { cells, isRetired }
    })

  return { columns, rows }
}

/**
 * Parse the full component-registry.md raw string.
 * Returns an array of sections:
 *   { heading: string, intro: string, table: { columns, rows } | null }
 *
 * Sections without a markdown table (e.g. Coverage key, Storybook story rule)
 * are included with table: null.
 */
export function parseRegistryMd(raw) {
  // Split on level-2 headings
  const sectionChunks = raw.split(/^## /m).slice(1)

  return sectionChunks.map((chunk) => {
    const lines = chunk.split('\n')
    const heading = lines[0].trim()

    // Collect prose lines (non-table, non-blank, non-separator)
    const introLines = []
    const tableLines = []
    let inTable = false

    for (const line of lines.slice(1)) {
      if (line.startsWith('|')) {
        inTable = true
        tableLines.push(line)
      } else if (inTable && line.trim() === '') {
        // blank line after table — table is done
        inTable = false
      } else if (!inTable && line.startsWith('>')) {
        introLines.push(line.replace(/^>\s?/, '').trim())
      } else if (!inTable && line.startsWith('**') && !line.startsWith('|')) {
        introLines.push(stripMarkdown(line))
      }
    }

    const table = tableLines.length > 2 ? parseTable(tableLines) : null
    const intro = introLines.join(' ').trim()

    return { heading, intro, table }
  })
}

