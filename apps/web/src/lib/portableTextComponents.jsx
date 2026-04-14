/**
 * portableTextComponents — shared PortableText serializer config.
 *
 * Provides consistent mark and block-type rendering across all pages
 * that use <PortableText> directly (ArticlePage, NodePage, PersonProfilePage).
 *
 * Page-specific type handlers (e.g. richImage in ArticlePage) can be merged
 * via spread: { ...portableTextComponents, types: { ...portableTextComponents.types, richImage: … } }
 */
import { CodeBlock, Table, TableWrap, CitationMarker, Media } from '../design-system'
import { LinkAnnotation, DividerBlock } from '../components/portableTextComponents'
import ImageLightbox from '../components/ImageLightbox'
import { urlFor } from './sanity'

import { useState, Children } from 'react'

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

/** Generate a slug-style anchor ID from heading text (matches MarginColumn extractToc). */
function headingAnchor(children) {
  const text = extractText(Children.toArray(children))
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * SharedInlineImage — richImage block with overlay + lightbox.
 * Default renderer for pages that don't override with CSS modules.
 */
function SharedInlineImage({ value }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!value?.asset) return null
  const imgSrc = urlFor(value.asset).width(900).auto('format').url()

  return (
    <>
      <figure
        style={{ margin: '1.5rem 0', cursor: 'zoom-in' }}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxOpen(true) } }}
        aria-label={`View full size: ${value.alt || 'image'}`}
      >
        <Media
          src={imgSrc}
          alt={value.alt ?? ''}
          overlay={value.overlay}
        />
        {value.caption && (
          <figcaption style={{ fontSize: '0.85rem', color: 'var(--st-color-text-muted, #555)', marginTop: '0.5rem', textAlign: 'center', fontStyle: 'italic' }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
      {lightboxOpen && (
        <ImageLightbox
          images={[value]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

const portableTextComponents = {
  block: {
    h1: ({ children }) => isEmptyBlock(children) ? null : <h2 id={headingAnchor(children)}>{children}</h2>,
    h2: ({ children }) => isEmptyBlock(children) ? null : <h2 id={headingAnchor(children)}>{children}</h2>,
    h3: ({ children }) => isEmptyBlock(children) ? null : <h3 id={headingAnchor(children)}>{children}</h3>,
    h4: ({ children }) => isEmptyBlock(children) ? null : <h4 id={headingAnchor(children)}>{children}</h4>,
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
    // richImage blocks — overlay support + lightbox on click
    richImage: ({ value }) => <SharedInlineImage value={value} />,
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
