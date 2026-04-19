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
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
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
      if (s.heading && s._key) {
        entries.push({ key: s._key, text: s.heading, level: 2, anchor: `section-${s._key}` })
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

  const [activeAnchor, setActiveAnchor] = useState(null)

  useEffect(() => {
    if (!hasToc) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const targets = toc
      .map((entry) => document.getElementById(entry.anchor))
      .filter(Boolean)
    if (!targets.length) return

    // Rescan all targets on every IO event, pick the last one whose top has
    // crossed the trigger line. Stays correct regardless of section size; a
    // simple isIntersecting->setActive pattern misses tall sections that span
    // the entire intersection band without a clean enter/leave edge.
    const update = () => {
      const triggerLine = window.innerHeight * 0.25
      let active = null
      for (const t of targets) {
        if (t.getBoundingClientRect().top <= triggerLine) active = t.id
        else break
      }
      setActiveAnchor(active)
    }
    const observer = new IntersectionObserver(update, {
      rootMargin: '0px 0px -75% 0px',
      threshold: 0,
    })
    targets.forEach((t) => observer.observe(t))
    update()
    return () => observer.disconnect()
  }, [hasToc, toc])

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
    <aside className={styles.pageSidebar} aria-label="Page details">
      <details className={styles.disclosure} open>
        <summary className={styles.summary}>More from this page</summary>
        <div className={styles.blocks}>

          {hasToc && (
            <div className={`${styles.block} ${styles.tocOnly}`}>
              <p className={styles.label}>On this page</p>
              <nav className={styles.toc} aria-label="Page contents">
                <ol className={styles.tocList}>
                  {toc.map((entry) => {
                    const isActive = activeAnchor === entry.anchor
                    return (
                      <li key={entry.key} className={styles.tocItem}>
                        <a
                          href={`#${entry.anchor}`}
                          className={`${styles.tocLink} ${entry.level > 2 ? styles.tocLinkH3 : ''}`}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          {entry.text}
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </nav>
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

          {hasSeries && (
            <div className={styles.block}>
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

          {aiText && (
            <div className={styles.block}>
              <p className={styles.label}>AI Disclosure</p>
              <p className={styles.ai}>{aiText}</p>
              <Link to="/ai-ethics" className={styles.ethicsLink}>AI Ethics Statement →</Link>
            </div>
          )}

        </div>
      </details>
    </aside>
  )
}
