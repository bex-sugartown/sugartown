/**
 * PageSidebar — sticky right-rail at ≥1024px, disclosure beneath content below.
 *
 * Replaces MarginColumn (SUG-69). Same prop API for drop-in compatibility.
 *
 * Slots (conditional — empty slots are omitted):
 * - Table of Contents (auto-extracted from section headings + PortableText h2/h3)
 * - Related content (`related[]`)
 * - Series navigation (`series` + `partNumber`)
 * - AI Disclosure (assembled from tools[] + authors, or `aiDisclosure` override)
 *
 * Responsive behaviour:
 * - ≥1024px: sticky rail in grid column 2. Disclosure summary hidden, all blocks render.
 * - <1024px: flows beneath content as a `<details open>` disclosure. TOC block is hidden
 *   below this breakpoint (touch scroll + browser find covers the jump-link case).
 *
 * If all slots are empty, returns null.
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import Sidebar from '../design-system/components/sidebar/Sidebar'
import SidebarNav from '../design-system/components/sidebar-nav/SidebarNav'
import styles from './PageSidebar.module.css'

/** Plain text from a PortableText block. */
function ptBlockText(block) {
  if (!block?.children) return ''
  return block.children.map((c) => c.text ?? '').join('')
}

/**
 * Extract TOC entries:
 * 1. Section-level `heading` + `_key` → anchor `section-{_key}`
 * 2. Inline PortableText h2/h3 inside `sections[].content`
 * 3. Document-level PortableText h2/h3 (articles/nodes/case studies have a
 *    `content` field outside sections)
 */
function extractToc(sections, content) {
  const entries = []

  if (sections?.length) {
    for (const s of sections) {
      const sectionText = s.heading || s.title || s.name
      if (sectionText && s._key) {
        entries.push({ key: s._key, text: sectionText, level: 2, anchor: `section-${s._key}` })
      }
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

const TYPE_LABELS = { node: 'Node', article: 'Article', caseStudy: 'Case Study' }

const AI_TOOL_NAMES = ['claude', 'chatgpt', 'gemini', 'copilot', 'midjourney', 'dall-e', 'stable diffusion']
function isAiTool(tool) {
  const name = (tool?.name || tool?.title || '').toLowerCase()
  return name && AI_TOOL_NAMES.some((n) => name.includes(n))
}

/**
 * Tells pages whether the sidebar would render anything — used to gate the
 * `data-has-margin` flag that activates the two-column grid.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function hasSidebarContent({ sections, content, related, series, tools, aiDisclosure }) {
  const toc = extractToc(sections, content)
  return (
    toc.length > 1 ||
    (related?.length ?? 0) > 0 ||
    !!series?.title ||
    !!aiDisclosure ||
    (tools?.some(isAiTool) ?? false)
  )
}

export default function PageSidebar({
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
  const hasToc = toc.length > 1
  const hasRelated = related?.length > 0
  const hasSeries = !!series?.title
  const hasAi = !!aiDisclosure || (tools?.some(isAiTool) ?? false)


  if (!hasToc && !hasRelated && !hasSeries && !hasAi) return null

  let aiText = null
  if (hasAi) {
    if (aiDisclosure) {
      aiText = aiDisclosure
    } else {
      const aiTools = tools?.filter(isAiTool) ?? []
      const authorName = authors?.[0]?.name ?? 'the author'
      if (aiTools.length > 0) {
        const toolNames = aiTools.map((t) => t.name || t.title).join(', ')
        aiText = `Drafted with ${toolNames}, edited by ${authorName}. All analysis and conclusions are human-authored.`
      }
    }
  }

  return (
    <Sidebar
      label="More from this page"
      side="right"
      breakpoint="lg"
      mobileStyle="appendix"
      aria-label="Page details"
    >
      <div className={styles.blocks}>

          {hasSeries && (
            <div className={`${styles.block} ${styles.seriesBlock}`}>
              <p className={styles.label}>Series</p>
              <div className={styles.series}>
                <Link
                  to={getCanonicalPath({ docType: 'series', slug: series.slug })}
                  className={styles.seriesLink}
                >
                  <strong>{series.title}</strong>
                </Link>
                {partNumber && <span className={styles.seriesPart}>Part {partNumber}</span>}
              </div>
            </div>
          )}

          {hasToc && (
            <div className={`${styles.block} ${styles.tocOnly}`}>
              <SidebarNav
                label="On this page"
                items={toc.map((e) => ({
                  id: e.anchor,
                  label: e.text,
                  href: `#${e.anchor}`,
                  level: e.level,
                }))}
                ariaLabel="Page contents"
              />
            </div>
          )}

          {hasRelated && (
            <div className={styles.block}>
              <p className={styles.label}>Related</p>
              <ul className={styles.relatedList}>
                {related.map((item) => {
                  const href = getCanonicalPath({ docType: item._type, slug: item.slug })
                  const badge = TYPE_LABELS[item._type] ?? item._type
                  return (
                    <li key={item._id} className={styles.relatedItem}>
                      <span className={styles.relatedType}>{badge}</span>
                      <Link to={href} className={styles.relatedLink}>{item.title}</Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}


          {aiText && (
            <div className={styles.block}>
              <p className={styles.label}>AI Disclosure</p>
              <p className={styles.ai}>{aiText}</p>
              <Link to="/ai-ethics" className={styles.ethicsLink}>AI Ethics Statement →</Link>
            </div>
          )}

      </div>
    </Sidebar>
  )
}
