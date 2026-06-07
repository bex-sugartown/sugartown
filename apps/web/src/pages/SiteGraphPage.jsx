/**
 * SiteGraphPage — SUG-81 Phase 3
 *
 * Site-wide cross-type knowledge graph at /knowledge-graph.
 * Heading, description, and SEO are driven by the `archivePage` Sanity doc
 * with slug "knowledge-graph". Graph, type filter, and card rail are appended
 * below the page header content.
 */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { client } from '../lib/sanity'
import { allSiteItemsQuery, archivePageBySlugQuery } from '../lib/queries'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import KnowledgeGraph from '../components/KnowledgeGraph/KnowledgeGraph'
import ContentCard from '../components/ContentCard'
import FilterStrip from '../components/FilterStrip'
import portableTextComponents from '../lib/portableTextComponents'
import statsJson from '../generated/stats.json'
import { Breadcrumb } from '../design-system'
import styles from './SiteGraphPage.module.css'
import pageStyles from './pages.module.css'

const FILTER_TYPES = [
  { key: 'all',       label: 'All' },
  {
    key: 'article',   label: 'Articles',
    chipTokens: { bg: '--st-kg-chip-article-bg', fg: '--st-kg-chip-article-fg', border: '--st-kg-chip-article-border' },
    dotToken: '--st-kg-node-article',
  },
  {
    key: 'caseStudy', label: 'Case Studies',
    chipTokens: { bg: '--st-kg-chip-case-bg', fg: '--st-kg-chip-case-fg', border: '--st-kg-chip-case-border' },
    dotToken: '--st-kg-node-case',
  },
  {
    key: 'node',      label: 'Nodes',
    chipTokens: { bg: '--st-kg-chip-node-bg', fg: '--st-kg-chip-node-fg', border: '--st-kg-chip-node-border' },
    dotToken: '--st-kg-node-node',
  },
]

const COLOR_TOKENS = {
  article:   '--st-kg-node-article',
  caseStudy: '--st-kg-node-case',
  node:      '--st-kg-node-node',
}

const HUB_TYPE_LABELS = { project: 'Project', category: 'Category' }

function filterGraph(siteGraph, typeFilter) {
  if (!siteGraph?.nodes) return null

  if (typeFilter === 'all') {
    // Exclude tag nodes in "all" view — too many to be useful
    const nodes = siteGraph.nodes.filter(n => n.type !== 'tag')
    const nodeIds = new Set(nodes.map(n => n.id))
    const edges = (siteGraph.edges ?? []).filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    )
    return { ...siteGraph, nodes, edges }
  }

  // Filtered view: keep matching items + hubs/tags reachable from them only
  const visibleItemIds = new Set(
    siteGraph.nodes
      .filter(n => n.type === 'item' && n.docType === typeFilter)
      .map(n => n.id)
  )

  // Hub nodes (project, category) only if they have at least one membership edge to a visible item
  const connectedHubIds = new Set(
    (siteGraph.edges ?? [])
      .filter(e => e.kind === 'membership' && visibleItemIds.has(e.source))
      .map(e => e.target)
  )

  // Tag nodes only if connected to at least one visible item via tag-membership
  const connectedTagIds = new Set(
    (siteGraph.edges ?? [])
      .filter(e => e.kind === 'tag-membership' && visibleItemIds.has(e.source))
      .map(e => e.target)
  )

  const keepIds = new Set([
    ...connectedHubIds,
    ...visibleItemIds,
    ...connectedTagIds,
  ])

  const nodes = siteGraph.nodes.filter(n => keepIds.has(n.id))
  const edges = (siteGraph.edges ?? []).filter(
    e => keepIds.has(e.source) && keepIds.has(e.target)
  )
  return { ...siteGraph, nodes, edges }
}

export default function SiteGraphPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [typeFilter, setTypeFilter]     = useState(() => {
    const p = searchParams.get('type')
    return FILTER_TYPES.some(f => f.key === p) ? p : 'all'
  })
  const [selectedNode, setSelectedNode] = useState(null)
  const railRef                         = useRef(null)
  const [allItems, setAllItems]         = useState(null)
  const [archiveDoc, setArchiveDoc]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const siteSettings                    = useSiteSettings()

  useEffect(() => {
    Promise.all([
      client.fetch(allSiteItemsQuery),
      client.fetch(archivePageBySlugQuery, { slug: 'knowledge-graph' }),
    ]).then(([items, doc]) => {
      setAllItems(items)
      setArchiveDoc(doc)
      setLoading(false)
    })
  }, [])

  const seo = resolveSeo(archiveDoc ?? null, siteSettings)

  const allItemsById = useMemo(() => {
    if (!allItems) return new Map()
    return new Map(allItems.map(item => [item._id, item]))
  }, [allItems])

  const graphData = useMemo(
    () => filterGraph(statsJson?.siteGraph, typeFilter),
    [typeFilter]
  )

  // Count item nodes connected to the selected hub via membership edges
  const hubConnectedCount = useMemo(() => {
    if (!selectedNode || selectedNode.type === 'item') return 0
    return (statsJson?.siteGraph?.edges ?? []).filter(
      e => e.kind === 'membership' &&
           (e.source === selectedNode.id || e.target === selectedNode.id)
    ).length
  }, [selectedNode])

  const filterCount = useMemo(() => {
    if (!graphData) return null
    const itemCount = graphData.nodes.filter(n => n.type === 'item').length
    if (typeFilter === 'all') return `${itemCount} items visible`
    const label = FILTER_TYPES.find(f => f.key === typeFilter)?.label?.toLowerCase() ?? typeFilter
    return `${itemCount} ${label} visible`
  }, [graphData, typeFilter])

  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleEmbiggen = useCallback(() => setIsFullscreen(true), [])
  const handleClose    = useCallback(() => setIsFullscreen(false), [])

  // Close on Escape key
  useEffect(() => {
    if (!isFullscreen) return
    const handler = e => { if (e.key === 'Escape') setIsFullscreen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen])

  const handleFilterChange = useCallback(key => {
    setTypeFilter(key)
    setSelectedNode(null)
    const params = key === 'all' ? {} : { type: key }
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node)
    if (node) {
      // Move focus to rail so keyboard users can read the selection
      requestAnimationFrame(() => {
        railRef.current?.focus()
      })
    }
  }, [])

  const selectedItem = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'item') return null
    return allItemsById.get(selectedNode._id) ?? null
  }, [selectedNode, allItemsById])

  // Heading and kicker: prefer archivePage hero/description, fall back to defaults
  const heading    = archiveDoc?.hero?.heading || archiveDoc?.title || 'Knowledge Graph'
  const subheading = archiveDoc?.hero?.subheading || archiveDoc?.description

  return (
    <main className={pageStyles.archivePage}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      <header className={pageStyles.masthead}>
        <Breadcrumb items={[{ label: 'Library', href: '/library' }]} />
        <h1 className={`${pageStyles.archiveHeading} ${pageStyles.archiveHeadingItalic}`}>{heading}</h1>
        {subheading && (
          Array.isArray(subheading)
            ? <div className={pageStyles.archiveDescription}><PortableText value={subheading} components={portableTextComponents} /></div>
            : <p className={pageStyles.archiveDescription}>{subheading}</p>
        )}
        {!subheading && (
          <p className={pageStyles.archiveDescription}>
            A site-wide map of articles, case studies, and nodes, connected by project and category.
          </p>
        )}
      </header>

      <div className={styles.graphSection}>
      <div className={pageStyles.archiveToolbar}>
        <div className={pageStyles.archiveToolbarLeft}>
          <div className={pageStyles.layoutToggleGroup}>
            <Link
              to={typeFilter === 'caseStudy' ? '/case-studies' : typeFilter === 'node' ? '/nodes' : typeFilter === 'article' ? '/articles' : '/library'}
              className={pageStyles.layoutToggleBtn}
              aria-label="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
                <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
              </svg>
            </Link>
            <Link
              to={typeFilter === 'caseStudy' ? '/case-studies' : typeFilter === 'node' ? '/nodes' : typeFilter === 'article' ? '/articles' : '/library'}
              className={pageStyles.layoutToggleBtn}
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
                <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
                <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
              </svg>
            </Link>
            <button type="button" className={`${pageStyles.layoutToggleBtn} ${pageStyles.layoutToggleBtnActive}`} aria-label="Graph view" aria-pressed={true} disabled>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <line x1="8" y1="8" x2="2.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
                <line x1="8" y1="8" x2="13.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
                <line x1="8" y1="8" x2="2.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
                <line x1="8" y1="8" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
                <line x1="2.5" y1="3.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35"/>
                <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
                <circle cx="2.5" cy="3.5" r="1.5" fill="currentColor"/>
                <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor"/>
                <circle cx="2.5" cy="12.5" r="1.5" fill="currentColor"/>
                <circle cx="13.5" cy="12.5" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <span className={pageStyles.archiveToolbarDivider} aria-hidden="true" />
          <FilterStrip
            filters={FILTER_TYPES}
            activeKey={typeFilter}
            onChange={handleFilterChange}
            className={styles.filterStripInline}
          />
        </div>
        <span className={pageStyles.archiveToolbarKicker}>{filterCount}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.graphPane}>
          <KnowledgeGraph
            graphData={graphData}
            colorTokens={COLOR_TOKENS}
            showLegend
            selectedId={selectedNode?.id ?? null}
            onNodeClick={handleNodeClick}
            onEmbiggen={handleEmbiggen}
            className={styles.kgNoBorder}
          />
        </div>

        <div className={styles.rail} ref={railRef} aria-live="polite" aria-atomic="false" tabIndex={-1}>
          <div className={styles.railHeader}>
            <span className={styles.railHeaderLabel}>Selected</span>
          </div>

          <div className={styles.railBody}>
            {!selectedNode && (
              <div className={styles.railEmpty}>
                <p className={styles.railHint}>Click any node to explore it</p>
              </div>
            )}

            {selectedNode && selectedNode.type === 'item' && (
              <div className={styles.railCard}>
                {loading && <p className={styles.railHint}>Loading…</p>}
                {!loading && !selectedItem && (
                  <p className={styles.railHint}>Item not found in content.</p>
                )}
                {!loading && selectedItem && (
                  <ContentCard
                    item={{ ...selectedItem, excerpt: selectedItem.excerpt?.slice(0, 120) ?? null }}
                    density="compact"
                    showExcerpt
                    showHeroImage={false}
                    suppressStatus
                  />
                )}
              </div>
            )}

            {selectedNode && selectedNode.type !== 'item' && (
              <div className={styles.railHub}>
                <p className={styles.railHubType}>
                  {HUB_TYPE_LABELS[selectedNode.type] ?? selectedNode.type}
                </p>
                <p className={styles.railHubLabel}>{selectedNode.label}</p>
                {hubConnectedCount > 0 && (
                  <p className={styles.railHubCount}>
                    {hubConnectedCount} connected {hubConnectedCount === 1 ? 'item' : 'items'}
                  </p>
                )}
                <Link to={selectedNode.href} className={styles.railHubLink}>
                  View {HUB_TYPE_LABELS[selectedNode.type]?.toLowerCase() ?? selectedNode.type} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>{/* /graphSection */}

      {isFullscreen && (
        <div className={styles.fullscreenOverlay} role="dialog" aria-label="Knowledge graph fullscreen" aria-modal="true">
          <div className={styles.fsHeader}>
            <FilterStrip
              filters={FILTER_TYPES}
              activeKey={typeFilter}
              onChange={handleFilterChange}
              count={filterCount}
              className={styles.fsFilterStrip}
            />
            <button type="button" className={styles.fsClose} onClick={handleClose} aria-label="Exit fullscreen">✕</button>
          </div>
          <div className={styles.fsBody}>
            <div className={styles.fsGraph}>
              <KnowledgeGraph
                graphData={graphData}
                colorTokens={COLOR_TOKENS}
                showLegend
                legendTop
                fillHeight
                selectedId={selectedNode?.id ?? null}
                onNodeClick={handleNodeClick}
              />
            </div>
            <div className={styles.fsRail}>
              <div className={styles.railHeader}>
                <span className={styles.railHeaderLabel}>Selected</span>
              </div>
              <div className={styles.railBody}>
                {!selectedNode && (
                  <div className={styles.railEmpty}>
                    <p className={styles.railHint}>Click any node to explore it</p>
                  </div>
                )}
                {selectedNode && selectedNode.type === 'item' && (
                  <div className={styles.railCard}>
                    {loading && <p className={styles.railHint}>Loading…</p>}
                    {!loading && selectedItem && (
                      <ContentCard
                        item={{ ...selectedItem, excerpt: selectedItem.excerpt?.slice(0, 120) ?? null }}
                        density="compact"
                        showExcerpt
                        showHeroImage={false}
                        suppressStatus
                      />
                    )}
                  </div>
                )}
                {selectedNode && selectedNode.type !== 'item' && (
                  <div className={styles.railHub}>
                    <p className={styles.railHubType}>{HUB_TYPE_LABELS[selectedNode.type] ?? selectedNode.type}</p>
                    <p className={styles.railHubLabel}>{selectedNode.label}</p>
                    {hubConnectedCount > 0 && (
                      <p className={styles.railHubCount}>
                        {hubConnectedCount} connected {hubConnectedCount === 1 ? 'item' : 'items'}
                      </p>
                    )}
                    <Link to={selectedNode.href} className={styles.railHubLink}>
                      View {HUB_TYPE_LABELS[selectedNode.type]?.toLowerCase() ?? selectedNode.type} →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
