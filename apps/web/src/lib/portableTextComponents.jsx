/**
 * portableTextComponents — shared PortableText serializer config.
 *
 * Provides consistent mark and block-type rendering across all pages
 * that use <PortableText> directly (ArticlePage, NodePage, PersonProfilePage).
 *
 * Page-specific type handlers (e.g. richImage in ArticlePage) can be merged
 * via spread: { ...portableTextComponents, types: { ...portableTextComponents.types, richImage: … } }
 */
import { CodeBlock, Table, TableWrap, CitationMarker } from '../design-system'
import { LinkAnnotation, DividerBlock } from '../components/portableTextComponents'

import { Children } from 'react'

/**
 * Block-level heading handlers.
 * - H1 is downgraded to H2 (page title owns the single H1 per page)
 * - Empty headings/paragraphs (whitespace-only) are suppressed to avoid layout gaps
 *
 * React children from PortableText are React elements wrapping text spans,
 * not raw strings. We need to recursively extract text content.
 */
function extractText(node) {
  if (node == null || node === false) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node.props?.children) return extractText(node.props.children)
  return ''
}

function isEmptyBlock(children) {
  const text = extractText(Children.toArray(children))
  return text.trim() === ''
}

const portableTextComponents = {
  block: {
    h1: ({ children }) => isEmptyBlock(children) ? null : <h2>{children}</h2>,
    h2: ({ children }) => isEmptyBlock(children) ? null : <h2>{children}</h2>,
    h3: ({ children }) => isEmptyBlock(children) ? null : <h3>{children}</h3>,
    h4: ({ children }) => isEmptyBlock(children) ? null : <h4>{children}</h4>,
    normal: ({ children }) => isEmptyBlock(children) ? null : <p>{children}</p>,
  },
  marks: {
    code: ({ children }) => <code>{children}</code>,
    // Link annotation — supports internal refs (React Router) + external URLs.
    // Uses shared LinkAnnotation from components/portableTextComponents.jsx.
    link: ({ value, children }) => (
      <LinkAnnotation value={value}>{children}</LinkAnnotation>
    ),
    // Inline citation marker [n] — rendered as CitationMarker superscript pill.
    // Links to the matching endnote anchor in the CitationZone.
    citationRef: ({ value, children }) => (
      <>{children}<CitationMarker index={value?.index || 1} /></>
    ),
  },
  types: {
    // Divider — horizontal rule between content blocks
    divider: ({ value }) => <DividerBlock value={value} />,
    // Code blocks from Sanity's code input plugin — DS CodeBlock with overflow containment
    code: ({ value }) => {
      if (!value?.code) return null
      return (
        <CodeBlock
          code={value.code}
          language={value.language ?? undefined}
          filename={value.filename ?? undefined}
        />
      )
    },
    // Table blocks (EPIC-0163) — DS Table component with semantic HTML
    tableBlock: ({ value }) => {
      if (!value?.rows?.length) return null
      const { variant = 'default', hasHeaderRow = true, rows } = value
      const headerRow = hasHeaderRow ? rows[0] : null
      const bodyRows = hasHeaderRow ? rows.slice(1) : rows
      return (
        <TableWrap>
          <Table variant={variant}>
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.cells?.map((cell, i) => (
                    <th key={i}>{cell}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={row._key ?? ri}>
                  {row.cells?.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )
    },
  },
}

export default portableTextComponents
