/**
 * ViewToggle — grid, list and graph view switch for archive pages and the knowledge graph.
 *
 * A thin composition of the DS SegmentedControl (icon variant) with the three view icons, shared
 * by ArchivePage and SiteGraphPage so neither hand-builds its selected state (ST-251).
 * An option with an href is a link to another page; one without is a button that calls onChange.
 */
import { SegmentedControl } from '../design-system'

const ICONS = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  ),
  list: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
    </svg>
  ),
  graph: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="8" y1="8" x2="2.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="8" y1="8" x2="13.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="8" y1="8" x2="2.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="8" y1="8" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="2.5" y1="3.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35" />
      <circle cx="8" cy="8" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="3.5" r="1.5" fill="currentColor" />
      <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor" />
      <circle cx="2.5" cy="12.5" r="1.5" fill="currentColor" />
      <circle cx="13.5" cy="12.5" r="1.5" fill="currentColor" />
    </svg>
  ),
}

export default function ViewToggle({
  value,
  onChange,
  gridHref,
  listHref,
  graphHref,
  showGraph = true,
  graphLabel = 'Graph view',
}) {
  const options = [
    { value: 'grid', icon: ICONS.grid, ariaLabel: 'Grid view', href: gridHref },
    { value: 'list', icon: ICONS.list, ariaLabel: 'List view', href: listHref },
    ...(showGraph ? [{ value: 'graph', icon: ICONS.graph, ariaLabel: graphLabel, href: graphHref }] : []),
  ]
  return (
    <SegmentedControl
      variant="icon"
      aria-label="View"
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
