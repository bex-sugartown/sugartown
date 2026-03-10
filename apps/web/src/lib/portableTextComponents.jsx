/**
 * portableTextComponents — shared PortableText serializer config.
 *
 * Provides consistent mark and block-type rendering across all pages
 * that use <PortableText> directly (ArticlePage, NodePage, PersonProfilePage).
 *
 * Page-specific type handlers (e.g. richImage in ArticlePage) can be merged
 * via spread: { ...portableTextComponents, types: { ...portableTextComponents.types, richImage: … } }
 */
import { InlineCode, Table, TableWrap } from '../design-system'

const portableTextComponents = {
  marks: {
    code: ({ children }) => <InlineCode>{children}</InlineCode>,
  },
  types: {
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
