import { useState, useMemo } from 'react'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Chip from '../../design-system/components/chip/Chip'
import Button from '../../design-system/components/button/Button'
import Tile from '../../design-system/components/tile/Tile'
import styles from './SchemaERD.module.css'

/**
 * SchemaERD — interactive entity-relationship diagram for the Sanity schema.
 *
 * Props-driven (no direct manifest import) so the data source can swap from
 * a static JS manifest to a GROQ query or build-time codegen without touching
 * this component.
 *
 * SUG-20 Phase 1: DS alignment — Tile stats, SegmentedControl filter,
 * SectionLabel group headers, Chip kind badges, Button clear action.
 * Header removed — host page (CmsPage) provides heading context.
 *
 * @param {{ entities: Array, relationships: Array }} props
 */
export default function SchemaERD({ entities = [], relationships = [] }) {
  const [activeGroup, setActiveGroup] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  // ── Derived data ──────────────────────────────────────────
  const groups = useMemo(() => {
    const map = {}
    for (const e of entities) {
      const g = e.group || 'other'
      if (!map[g]) map[g] = []
      map[g].push(e)
    }
    return map
  }, [entities])

  const groupNames = useMemo(() => Object.keys(groups), [groups])

  const filtered = useMemo(
    () => (activeGroup === 'all' ? entities : groups[activeGroup] || []),
    [activeGroup, entities, groups],
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
  const docCount = entities.filter((e) => e.kind === 'document').length
  const objCount = entities.filter((e) => e.kind === 'object').length

  // ── Filter options for Chip strip ─────────────────────────
  const filterOptions = useMemo(() => [
    { value: 'all', label: `All (${entities.length})` },
    ...groupNames.map((g) => ({ value: g, label: `${g.charAt(0).toUpperCase() + g.slice(1)} (${groups[g].length})` })),
  ], [entities.length, groupNames, groups])

  // ── Handlers ──────────────────────────────────────────────
  function handleCardClick(id) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  function handleRelClick(id) {
    setSelectedId(id)
  }

  function clearSelection() {
    setSelectedId(null)
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={styles.erdWrapper}>
      {/* Stats strip — bg-through-gap hairline dividers */}
      <div className={styles.statsStrip}>
        <Tile label="Types" value={entities.length} />
        <Tile label="Documents" value={docCount} />
        <Tile label="Objects" value={objCount} />
        <Tile label="Relationships" value={relationships.length} />
      </div>

      {/* Filter chips */}
      <div className={styles.filters}>
        {filterOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => setActiveGroup(opt.value)}
            isActive={activeGroup === opt.value}
          />
        ))}
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
