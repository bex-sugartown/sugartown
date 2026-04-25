/**
 * KnowledgeGraph — SUG-73 Phase 2
 *
 * Force-directed canvas viz fed by stats.graph (build-time, SUG-67 pipeline).
 * Lazy-loads react-force-graph-2d for SSR safety (package touches `window`).
 * Canvas colours resolve from --st-graph-* CSS tokens at runtime; a
 * MutationObserver on data-theme triggers re-resolution on theme switch.
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import KnowledgeGraphSidebar from './KnowledgeGraphSidebar'
import styles from './KnowledgeGraph.module.css'

// Node visual radii by type
const RADIUS = { project: 18, category: 12, item: 6 }

// Resolve a CSS custom property chain to a computed rgb() colour.
// Uses a probe element so the browser resolves all var() references.
function resolveToken(token) {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;width:0;height:0;background-color:var(${token})`
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).backgroundColor
  document.body.removeChild(probe)
  return value
}

// Returns 0–1 relative luminance of an rgb()/rgba() string.
function luminance(rgbStr) {
  const m = rgbStr.match(/\d+/g)
  if (!m) return 0
  const [r, g, b] = m.map(Number)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export default function KnowledgeGraph({ graphData }) {
  const [FG, setFG]             = useState(null)
  const [colors, setColors]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [dims, setDims]         = useState({ width: 800, height: 520 })
  const containerRef            = useRef(null)
  const hoveredRef              = useRef(null)

  // SSR-safe dynamic import — react-force-graph-2d accesses window at module level
  useEffect(() => {
    import('react-force-graph-2d').then(m => setFG(() => m.default))
  }, [])

  // Resolve --st-graph-* tokens to computed rgb() strings
  const readColors = useCallback(() => {
    setColors({
      project:    resolveToken('--st-graph-node-project'),
      category:   resolveToken('--st-graph-node-category'),
      item:       resolveToken('--st-graph-node-item'),
      membership: resolveToken('--st-graph-edge-membership'),
      lateral:    resolveToken('--st-graph-edge-lateral'),
      bg:         resolveToken('--st-graph-bg'),
    })
  }, [])

  useEffect(() => {
    readColors()
    const obs = new MutationObserver(readColors)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [readColors])

  // Container dimensions for responsive canvas sizing
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDims({ width: Math.floor(width), height: 520 })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Transform stats.graph → react-force-graph-2d format.
  // Clones nodes (force sim mutates them) and enriches item nodes with
  // their connected project/category objects for the sidebar.
  const fgData = useMemo(() => {
    if (!graphData?.nodes) return { nodes: [], links: [] }
    const nodeMap = new Map(graphData.nodes.map(n => [n.id, { ...n }]))

    for (const e of graphData.edges ?? []) {
      if (e.kind !== 'membership') continue
      const src = nodeMap.get(e.source)
      const tgt = nodeMap.get(e.target)
      if (!src || !tgt || src.type !== 'item') continue
      if (tgt.type === 'project') {
        src._projects = [...(src._projects ?? []), tgt]
      } else if (tgt.type === 'category') {
        src._categories = [...(src._categories ?? []), tgt]
      }
    }

    return {
      nodes: [...nodeMap.values()],
      links: (graphData.edges ?? []).map(e => ({ ...e })),
    }
  }, [graphData])

  // ── Canvas rendering ────────────────────────────────────────────────────────

  const nodeCanvasObject = useCallback((node, ctx) => {
    if (!colors) return
    const r       = RADIUS[node.type] ?? RADIUS.item
    const nodeC   = colors[node.type] ?? colors.item
    const isHov   = hoveredRef.current === node
    const isSel   = selected?.id === node.id
    const isLight = luminance(colors.bg) > 0.5

    // Selection / hover rings
    if (isSel) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 5, 0, Math.PI * 2)
      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.75)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    } else if (isHov) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2)
      ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    ctx.fillStyle = nodeC
    ctx.fill()

    // White overlay for hover/selected brightness
    if (isHov || isSel) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fill()
    }

    // Hub labels — always visible below node
    if (node.type === 'project' || node.type === 'category') {
      const fs = node.type === 'project' ? 11 : 10
      ctx.font = `600 ${fs}px "IBM Plex Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      // Lime label contrast fix: use muted ink on light canvas
      ctx.fillStyle = (node.type === 'category' && isLight)
        ? 'rgba(13,18,38,0.65)'
        : nodeC
      ctx.fillText(node.label, node.x, node.y + r + 4)
    }

    // Item label pill — hover/selection only
    if (node.type === 'item' && (isHov || isSel)) {
      const label = node.label.length > 34 ? node.label.slice(0, 34) + '…' : node.label
      const fs = 10
      ctx.font = `500 ${fs}px "IBM Plex Mono", monospace`
      const tw  = ctx.measureText(label).width
      const px  = 6
      const py  = 3
      const bx  = node.x - tw / 2 - px
      const by  = node.y + r + 6
      rRect(ctx, bx, by, tw + px * 2, fs + py * 2, 3)
      ctx.fillStyle = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(10,15,26,0.9)'
      ctx.fill()
      ctx.strokeStyle = nodeC
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.fillStyle = nodeC
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(label, node.x, by + py)
    }
  }, [colors, selected])

  // Larger pointer area for small item nodes
  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    const r = (RADIUS[node.type] ?? RADIUS.item) + 5
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }, [])

  const linkColor    = useCallback(l => colors
    ? (l.kind === 'sharedTag' ? colors.lateral : colors.membership)
    : 'rgba(128,128,128,0.2)', [colors])
  const linkWidth    = useCallback(l => l.kind === 'sharedTag' ? 0.8 : 1, [])
  const linkLineDash = useCallback(l => l.kind === 'sharedTag' ? [4, 5] : [], [])

  const handleNodeClick = useCallback(node => {
    setSelected(prev => prev?.id === node.id ? null : node)
  }, [])

  const handleNodeHover = useCallback(node => {
    hoveredRef.current = node
    containerRef.current && (
      containerRef.current.style.cursor = node ? 'pointer' : 'default'
    )
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.graphArea}>
        <div className={styles.canvasWrap} ref={containerRef}>
          {(!FG || !colors) && (
            <div className={styles.loading}>Initialising graph…</div>
          )}
          {FG && colors && (
            <FG
              graphData={fgData}
              backgroundColor={colors.bg}
              width={dims.width}
              height={dims.height}
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => 'replace'}
              nodePointerAreaPaint={nodePointerAreaPaint}
              nodeLabel=""
              linkColor={linkColor}
              linkWidth={linkWidth}
              linkLineDash={linkLineDash}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              cooldownTicks={300}
              d3AlphaDecay={0.028}
              d3VelocityDecay={0.4}
              enableNodeDrag
            />
          )}
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.dotProject} />Project hub
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotCategory} />Category hub
            </span>
            <span className={styles.legendItem}>
              <span className={styles.dotItem} />Node
            </span>
          </div>
        </div>

        <KnowledgeGraphSidebar
          node={selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </div>
  )
}
