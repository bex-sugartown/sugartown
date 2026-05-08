/**
 * SiteGraphPage — SUG-81 Phase 3
 *
 * Site-wide cross-type knowledge graph at /knowledge-graph.
 * Heading, description, and SEO are driven by the `archivePage` Sanity doc
 * with slug "knowledge-graph". Graph, type filter, and card rail are appended
 * below the page header content.
 */
import { useEffect, useState, useMemo, useCallback } from 'react'
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
import styles from './SiteGraphPage.module.css'

const FILTER_TYPES = [
  { key: 'all',       label: 'All' },
  { key: 'article',   label: 'Articles',     colorToken: '--st-kg-node-article' },
  { key: 'caseStudy', label: 'Case Studies', colorToken: '--st-kg-node-case' },
  { key: 'node',      label: 'Nodes',        colorToken: '--st-kg-node-node' },
]

const COLOR_TOKENS = {
  article:   '--st-kg-node-article',
  caseStudy: '--st-kg-node-case',
  node:      '--st-kg-node-node',
}

const HUB_TYPE_LABELS = { project: 'Project', category: 'Category' }

function filterGraph(siteGraph, typeFilter) {
  if (!siteGraph || typeFilter === 'all') return siteGraph

  const keepIds = new Set(
    siteGraph.nodes
      .filter(n => n.type !== 'item' || n.docType === typeFilter)
      .map(n => n.id)
  )

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
    () => filterGraph(statsJson.siteGraph, typeFilter),
    [typeFilter]
  )

  // Count item nodes connected to the selected hub via membership edges
  const hubConnectedCount = useMemo(() => {
    if (!selectedNode || selectedNode.type === 'item') return 0
    return (statsJson.siteGraph.edges ?? []).filter(
      e => e.kind === 'membership' &&
           (e.source === selectedNode.id || e.target === selectedNode.id)
    ).length
  }, [selectedNode])

  const handleFilterChange = useCallback(key => {
    setTypeFilter(key)
    setSelectedNode(null)
    const params = key === 'all' ? {} : { type: key }
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node)
  }, [])

  const selectedItem = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'item') return null
    return allItemsById.get(selectedNode._id) ?? null
  }, [selectedNode, allItemsById])

  // Heading and kicker: prefer archivePage hero/description, fall back to defaults
  const heading    = archiveDoc?.hero?.heading || archiveDoc?.title || 'Knowledge Graph'
  const subheading = archiveDoc?.hero?.subheading || archiveDoc?.description

  return (
    <main className={styles.page}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      <header className={styles.header}>
        <h1 className={styles.heading}>{heading}</h1>
        {subheading && (
          Array.isArray(subheading)
            ? <div className={styles.kicker}><PortableText value={subheading} components={portableTextComponents} /></div>
            : <p className={styles.kicker}>{subheading}</p>
        )}
        {!subheading && (
          <p className={styles.kicker}>
            A site-wide map of articles, case studies, and nodes — connected by project and category.
          </p>
        )}
      </header>

      <FilterStrip
        filters={FILTER_TYPES}
        activeKey={typeFilter}
        onChange={handleFilterChange}
        className={styles.filterStrip}
      />

      <div className={styles.body}>
        <div className={styles.graphPane}>
          <KnowledgeGraph
            graphData={graphData}
            colorTokens={COLOR_TOKENS}
            showLegend
            selectedId={selectedNode?.id ?? null}
            onNodeClick={handleNodeClick}
          />
        </div>

        <div className={styles.rail}>
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
    </main>
  )
}
