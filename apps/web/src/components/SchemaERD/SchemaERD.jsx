import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Chip from '../../design-system/components/chip/Chip'
import Button from '../../design-system/components/button/Button'
import StatCard from '../StatCard'
import Grid from '../../design-system/components/grid/Grid'
import IndexGroup from '../../design-system/components/index-group/IndexGroup'
import IndexCell from '../../design-system/components/index-cell/IndexCell'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './SchemaERD.module.css'

// Static mapping: schema type name → DS component name (sparse by design)
const ERD_COMPONENT_MAP = {
  ctaButton:          'Button',
  ctaButtonDoc:       'Button',
  linkItem:           'Button (via ctaButton)',
  tableBlock:         'Table',
  accordionSection:   'Accordion',
  calloutSection:     'Callout',
  cardBuilderSection: 'CardBuilderSection',
  citationRef:        'Citation',
  richImage:          'Media',
}

/**
 * SchemaERD — interactive entity-relationship diagram for the Sanity schema.
 *
 * Props-driven (no direct manifest import) so the data source can swap from
 * a static JS manifest to a GROQ query or build-time codegen without touching
 * this component.
 *
 * SUG-20 Phase 1: DS alignment — Tile stats, IndexGroup filter,
 * SectionLabel group headers, Chip kind badges, Button clear action.
 * Header removed — host page (CmsPage) provides heading context.
 *
 * @param {{ entities: Array, relationships: Array }} props
 */
export default function SchemaERD({ entities = [], relationships = [] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeGroup, setActiveGroup] = useState('all')
  const [selectedId, setSelectedId] = useState(() => {
    const param = searchParams.get('type')
    return param && entities.some((e) => e.id === param) ? param : null
  })

  // Deprecated types are hidden from the main ERD; shown only as a dim count
  const visibleEntities = useMemo(() => entities.filter((e) => e.group !== 'deprecated'), [entities])
  const deprecatedCount = entities.length - visibleEntities.length

  // ── Derived data ──────────────────────────────────────────
  const groups = useMemo(() => {
    const map = {}
    for (const e of visibleEntities) {
      const g = e.group || 'other'
      if (!map[g]) map[g] = []
      map[g].push(e)
    }
    return map
  }, [visibleEntities])

  const groupNames = useMemo(() => Object.keys(groups), [groups])

  const filtered = useMemo(
    () => (activeGroup === 'all' ? visibleEntities : groups[activeGroup] || []),
    [activeGroup, visibleEntities, groups],
  )

  const selectedRels = useMemo(() => {
    if (!selectedId) return { outbound: [], inbound: [] }
    return {
      outbound: relationships.filter((r) => r.from === selectedId),
      inbound: relationships.filter((r) => r.to === selectedId),
    }
  }, [selectedId, relationships])

  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set()
    const ids = new Set()
    ids.add(selectedId)
    for (const r of selectedRels.outbound) ids.add(r.to)
    for (const r of selectedRels.inbound) ids.add(r.from)
    return ids
  }, [selectedId, selectedRels])

  const selectedEntity = entities.find((e) => e.id === selectedId)

  // ── Stats ─────────────────────────────────────────────────
  const docCount = visibleEntities.filter((e) => e.kind === 'document').length
  const objCount = visibleEntities.filter((e) => e.kind === 'object').length

  // ── Filter options ─────────────────────────────────────────
  const filterOptions = useMemo(() => [
    { value: 'all', label: 'All', count: visibleEntities.length },
    ...groupNames.map((g) => ({
      value: g,
      label: g.charAt(0).toUpperCase() + g.slice(1),
      count: groups[g].length,
    })),
  ], [visibleEntities.length, groupNames, groups])

  // ── Handlers ──────────────────────────────────────────────
  function selectId(id) {
    setSelectedId(id)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) next.set('type', id)
      else next.delete('type')
      return next
    }, { replace: true })
  }

  function handleCardClick(id) {
    selectId(selectedId === id ? null : id)
  }

  function handleRelClick(id) {
    selectId(id)
  }

  function clearSelection() {
    selectId(null)
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={styles.erdWrapper}>
      <Grid spacing="0" accentTop accentColor="ink" tabletColumns={2} columns={4} className={styles.statsSection}>
        <StatCard label="Types" value={visibleEntities.length} />
        <StatCard label="Documents" value={docCount} />
        <StatCard label="Objects" value={objCount} />
        <StatCard label="Relationships" value={relationships.length} />
      </Grid>

      {/* Filter strip — IndexGroup/IndexCell */}
      <div className={styles.filters}>
        <IndexGroup label="Filter by group">
          {filterOptions.map((opt) => (
            <IndexCell
              key={opt.value}
              state={activeGroup === opt.value ? 'selected' : 'active'}
              onClick={() => setActiveGroup(opt.value)}
              aria-pressed={activeGroup === opt.value}
              className={styles.filterCell}
            >
              {opt.label}
            </IndexCell>
          ))}
        </IndexGroup>
        {deprecatedCount > 0 && (
          <span className={styles.deprecatedBadge}>
            {deprecatedCount} deprecated hidden
          </span>
        )}
      </div>

      {/* Main layout: grid + sidebar */}
      <div className={styles.layout}>
        {/* Entity grid */}
        <div>
          {activeGroup === 'all' ? (
            groupNames.map((g) => (
              <section key={g} className={styles.groupSection}>
                <SectionLabel name={g.charAt(0).toUpperCase() + g.slice(1)} className={styles.groupLabel} />
                <div className={styles.entityGrid}>
                  {groups[g].map((entity) => (
                    <EntityCard
                      key={entity.id}
                      entity={entity}
                      selected={selectedId === entity.id}
                      dimmed={!!selectedId && !connectedIds.has(entity.id)}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className={styles.entityGrid}>
              {filtered.map((entity) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  selected={selectedId === entity.id}
                  dimmed={!!selectedId && !connectedIds.has(entity.id)}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {selectedEntity ? (
            <DetailPanel
              entity={selectedEntity}
              rels={selectedRels}
              entities={entities}
              onRelClick={handleRelClick}
              onClear={clearSelection}
            />
          ) : (
            <div className={styles.sidebarEmpty}>
              <p className={styles.sidebarEmptyText}>
                Click an entity card to inspect its fields and relationships.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function EntityCard({ entity, selected, dimmed, onClick }) {
  const cardClass = [
    styles.entityCard,
    selected ? styles.entityCardSelected : '',
    dimmed ? styles.entityCardDimmed : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClass}
      onClick={() => onClick(entity.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(entity.id)
        }
      }}
    >
      <div className={styles.entityHeader}>
        <div className={styles.entityName}>{entity.label}</div>
        <Chip
          label={entity.kind}
          size="sm"
          className={entity.kind === 'document' ? styles.chipDoc : styles.chipObj}
        />
      </div>
      {entity.fields && entity.fields.length > 0 && (
        <ul className={styles.fieldList}>
          {entity.fields.slice(0, 5).map((f, i) => {
            const isRef = f.includes('→')
            return (
              <li
                key={i}
                className={`${styles.fieldItem} ${isRef ? styles.fieldRef : ''}`}
              >
                {f}
              </li>
            )
          })}
          {entity.fields.length > 5 && (
            <li className={styles.fieldItem}>
              +{entity.fields.length - 5} more…
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function DetailPanel({ entity, rels, entities, onRelClick, onClear }) {
  const entityMap = useMemo(() => {
    const map = {}
    for (const e of entities) map[e.id] = e
    return map
  }, [entities])

  const renderedBy = ERD_COMPONENT_MAP[entity.id] ?? null

  return (
    <div className={styles.sidebarPanel}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>{entity.label}</span>
        <Chip
          label={entity.kind}
          size="sm"
          className={entity.kind === 'document' ? styles.chipDoc : styles.chipObj}
        />
      </div>
      {renderedBy && (
        <div className={styles.sidebarRenderedBy}>
          <span className={styles.sidebarSectionLabel}>Rendered by</span>
          <Link
            to={`${PLATFORM_ROUTES.dsRegistry}#${renderedBy}`}
            className={styles.sidebarRenderedByLink}
          >
            {renderedBy}
          </Link>
        </div>
      )}
      <div className={styles.sidebarBody}>
        {/* Fields */}
        <p className={styles.sidebarSectionLabel}>Fields</p>
        <ul className={styles.sidebarFieldList}>
          {entity.fields.map((f, i) => {
            const isRef = f.includes('→')
            return (
              <li
                key={i}
                className={`${styles.sidebarFieldItem} ${isRef ? styles.sidebarFieldRef : ''}`}
              >
                {f}
              </li>
            )
          })}
        </ul>

        {rels.outbound.length > 0 && (
          <>
            <p className={styles.sidebarSectionLabel}>References</p>
            <ul className={styles.sidebarRelList}>
              {rels.outbound.map((r, i) => (
                <li key={i} className={styles.sidebarRelItem}>
                  <span className={styles.sidebarRelArrow}>→</span>
                  <button
                    className={styles.sidebarRelLink}
                    onClick={() => onRelClick(r.to)}
                  >
                    {entityMap[r.to]?.label || r.to}
                  </button>
                  <span className={styles.sidebarRelLabel}>{r.label}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {rels.inbound.length > 0 && (
          <>
            <p className={styles.sidebarSectionLabel}>Referenced By</p>
            <ul className={styles.sidebarRelList}>
              {rels.inbound.map((r, i) => (
                <li key={i} className={styles.sidebarRelItem}>
                  <span className={styles.sidebarRelArrow}>←</span>
                  <button
                    className={styles.sidebarRelLink}
                    onClick={() => onRelClick(r.from)}
                  >
                    {entityMap[r.from]?.label || r.from}
                  </button>
                  <span className={styles.sidebarRelLabel}>{r.label}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={styles.sidebarFooter}>
        <Button variant="tertiary" onClick={onClear}>Clear Selection</Button>
      </div>
    </div>
  )
}
