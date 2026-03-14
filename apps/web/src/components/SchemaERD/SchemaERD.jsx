import { useState, useMemo } from 'react'
import styles from './SchemaERD.module.css'

/**
 * SchemaERD — interactive entity-relationship diagram for the Sanity schema.
 *
 * Props-driven (no direct manifest import) so the data source can swap from
 * a static JS manifest to a GROQ query or build-time codegen without touching
 * this component.
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

  // Relationships touching the selected entity (inbound + outbound)
  const selectedRels = useMemo(() => {
    if (!selectedId) return { outbound: [], inbound: [] }
    return {
      outbound: relationships.filter((r) => r.from === selectedId),
      inbound: relationships.filter((r) => r.to === selectedId),
    }
  }, [selectedId, relationships])

  // IDs of entities connected to the selected entity
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
    <main className={styles.erdPage}>
      {/* Header */}
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform</p>
        <h1 className={styles.title}>Schema Entity-Relationship Diagram</h1>
        <p className={styles.subtitle}>
          Interactive map of {entities.length} Sanity schema types and{' '}
          {relationships.length} relationships powering sugartown.io.
        </p>
      </header>

      {/* Stats bar */}
      <div className={styles.stats}>
        <span className={styles.stat}>
          <span className={styles.statValue}>{entities.length}</span> types
        </span>
        <span className={styles.stat}>
          <span className={styles.statValue}>{docCount}</span> documents
        </span>
        <span className={styles.stat}>
          <span className={styles.statValue}>{objCount}</span> objects
        </span>
        <span className={styles.stat}>
          <span className={styles.statValue}>{relationships.length}</span>{' '}
          relationships
        </span>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterTab} ${activeGroup === 'all' ? styles.filterTabActive : ''}`}
          onClick={() => setActiveGroup('all')}
        >
          All<span className={styles.filterCount}>({entities.length})</span>
        </button>
        {groupNames.map((g) => (
          <button
            key={g}
            className={`${styles.filterTab} ${activeGroup === g ? styles.filterTabActive : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {g}
            <span className={styles.filterCount}>({groups[g].length})</span>
          </button>
        ))}
      </div>

      {/* Main layout: grid + sidebar */}
      <div className={styles.layout}>
        {/* Entity grid */}
        <div>
          {activeGroup === 'all' ? (
            // Grouped view
            groupNames.map((g) => (
              <section key={g} className={styles.groupSection}>
                <h2 className={styles.groupLabel}>{g}</h2>
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
            // Flat filtered view
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
    </main>
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
      <div className={styles.entityName}>{entity.label}</div>
      <div
        className={`${styles.entityKind} ${entity.kind === 'document' ? styles.entityKindDoc : ''}`}
      >
        {entity.kind}
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
        <span className={styles.sidebarKind}>{entity.kind}</span>
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

        {/* Outbound relationships */}
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

        {/* Inbound relationships */}
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

      <div style={{ padding: '0 1.25rem 1rem' }}>
        <button className={styles.clearButton} onClick={onClear}>
          Clear Selection
        </button>
      </div>
    </div>
  )
}
