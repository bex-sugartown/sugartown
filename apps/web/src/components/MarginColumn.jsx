/**
 * MarginColumn — Responsive sidebar for detail pages (SUG-52)
 *
 * Renders at ≥1200px as a sticky column alongside body content.
 * Below 1200px, relocates below body (CSS handles positioning).
 *
 * Slots (conditional — empty slots are omitted):
 * - Table of Contents (auto-generated from section headings)
 * - Related content (from `related[]` field)
 * - Series navigation (from `series` + `partNumber` fields)
 * - AI Disclosure (dynamically assembled from tools[] + authors)
 *
 * If all slots are empty, returns null (no empty column rendered).
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import styles from './MarginColumn.module.css'
import pageStyles from '../pages/pages.module.css'

/**
 * Extract plain text from a PortableText block's children array.
 */
function ptBlockText(block) {
  if (!block?.children) return ''
  return block.children.map((c) => c.text ?? '').join('')
}

/**
 * Extract TOC entries from three sources (in order):
 * 1. Section-level `heading` fields (textSection, ctaSection, etc.)
 * 2. PortableText h2/h3 blocks inside each section's `content` array
 * 3. PortableText h2/h3 blocks in the document-level `content` array
 *    (articles have a separate `content` field outside sections)
 *
 * Each entry gets a stable key for React rendering and an anchor ID
 * that matches the id= attributes set on rendered headings.
 */
function extractToc(sections, content) {
  const entries = []

  // Pass 1: section headings + inline PortableText headings
  if (sections?.length) {
    for (const s of sections) {
      // Section-level heading
      if (s.heading && s._key) {
        entries.push({
          key: s._key,
          text: s.heading,
          level: 2,
          anchor: `section-${s._key}`,
        })
      }
      // PortableText headings within section content
      if (Array.isArray(s.content)) {
        for (const block of s.content) {
          if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
            const text = ptBlockText(block)
            if (text && block._key) {
              entries.push({
                key: block._key,
                text,
                level: block.style === 'h2' ? 2 : 3,
                anchor: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              })
            }
          }
        }
      }
    }
  }

  // Pass 2: document-level content (articles)
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
        const text = ptBlockText(block)
        if (text && block._key) {
          entries.push({
            key: block._key,
            text,
            level: block.style === 'h2' ? 2 : 3,
            anchor: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          })
        }
      }
    }
  }

  return entries
}

/** Map Sanity _type to display label for related badges */
const TYPE_LABELS = {
  node: 'Node',
  article: 'Article',
  caseStudy: 'Case Study',
}

/**
 * Filter AI-category tools from tools[] array.
 * Tools with _type 'tool' that have names matching known AI tools.
 */
const AI_TOOL_NAMES = ['claude', 'chatgpt', 'gemini', 'copilot', 'midjourney', 'dall-e', 'stable diffusion']

function isAiTool(tool) {
  const toolName = tool?.name || tool?.title
  if (!toolName) return false
  const lower = toolName.toLowerCase()
  return AI_TOOL_NAMES.some((n) => lower.includes(n))
}

/**
 * Check whether margin column would render content for the given data.
 * Pages use this to conditionally enable the grid layout (data-has-margin).
 */
export function hasMarginContent({ sections, content, related, series, tools, aiDisclosure }) {
  const toc = extractToc(sections, content)
  const hasToc = toc.length > 1
  const hasRelated = related?.length > 0
  const hasSeries = !!series?.title
  const hasAi = !!aiDisclosure || (tools?.some(isAiTool) ?? false)
  return hasToc || hasRelated || hasSeries || hasAi
}

export default function MarginColumn({
  sections,
  content,
  related,
  series,
  partNumber,
  tools,
  authors,
  aiDisclosure,
}) {
  const toc = extractToc(sections, content)
  const hasRelated = related?.length > 0
  const hasSeries = series?.title
  const hasAiDisclosure = aiDisclosure || tools?.some(isAiTool)
  const hasToc = toc.length > 1 // need at least 2 headings for a useful TOC

  // If no slots have content, don't render the column
  if (!hasToc && !hasRelated && !hasSeries && !hasAiDisclosure) {
    return null
  }

  // Build AI disclosure text dynamically
  let aiDisclosureContent = null
  if (hasAiDisclosure) {
    if (aiDisclosure) {
      // Manual override — use as-is
      aiDisclosureContent = aiDisclosure
    } else {
      // Dynamic assembly from tools[] + authors
      const aiTools = tools?.filter(isAiTool) ?? []
      const authorName = authors?.[0]?.name ?? 'the author'
      if (aiTools.length > 0) {
        const toolNames = aiTools.map((t) => t.name || t.title).join(', ')
        aiDisclosureContent = `Drafted with ${toolNames}, edited by ${authorName}. All analysis and conclusions are human-authored.`
      }
    }
  }

  return (
    <aside className={`${styles.marginColumn} ${pageStyles.marginColumn}`}>

      {/* TOC */}
      {hasToc && (
        <div className={styles.marginSection}>
          <h3 className={styles.marginHeading}>Contents</h3>
          <ul className={styles.tocList}>
            {toc.map((entry) => (
              <li key={entry.key} className={styles.tocItem}>
                <a
                  href={`#${entry.anchor}`}
                  className={`${styles.tocLink} ${entry.level > 2 ? styles.tocLinkH3 : ''}`}
                >
                  {entry.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related content */}
      {hasRelated && (
        <div className={styles.marginSection}>
          <h3 className={styles.marginHeading}>Related</h3>
          <ul className={styles.relatedList}>
            {related.map((item) => {
              const href = getCanonicalPath({ docType: item._type, slug: item.slug })
              const badge = TYPE_LABELS[item._type] ?? item._type
              return (
                <li key={item._id} className={styles.relatedItem}>
                  <span className={styles.relatedBadge}>{badge}</span>
                  <Link to={href} className={styles.relatedLink}>
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Series navigation */}
      {hasSeries && (
        <div className={styles.marginSection}>
          <h3 className={styles.marginHeading}>Series</h3>
          {partNumber && (
            <div className={styles.seriesPosition}>Part {partNumber}</div>
          )}
          <div className={styles.seriesTitle}>
            <Link
              to={getCanonicalPath({ docType: 'series', slug: series.slug })}
              className={styles.seriesLink}
            >
              {series.title}
            </Link>
          </div>
        </div>
      )}

      {/* AI Disclosure */}
      {aiDisclosureContent && (
        <div className={styles.marginSection}>
          <h3 className={styles.marginHeading}>AI Disclosure</h3>
          <p className={styles.aiDisclosure}>{aiDisclosureContent}</p>
          <Link to="/ai-ethics" className={styles.ethicsLink}>
            AI Ethics Statement →
          </Link>
        </div>
      )}
    </aside>
  )
}
