import registryMd from '../../../../../docs/conventions/component-registry.md?raw'
import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import Table, { TableWrap } from '../../design-system/components/table/Table'
import { parseRegistryMd } from '../../lib/registryParser'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

const SECTIONS = parseRegistryMd(registryMd)

const COVERAGE_KEY_SECTION = SECTIONS.find((s) => s.heading === 'Coverage key')

// Headings to skip — preamble sections that have no table or are not registry tables
const SKIP_HEADINGS = new Set(['Coverage key', 'Storybook story rule', 'Token files'])

// Section number labels — assigned in render order to match §NN pattern
const SECTION_NUMBERS = [
  '§01', '§02', '§03', '§04', '§05', '§06',
]

function RegistryTable({ columns, rows }) {
  return (
    <TableWrap>
      <Table tone="subdued" density="compact">
        <thead>
          <tr>
            {columns.map((col) => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ cells, isRetired }, ri) => (
            <tr key={ri} className={isRetired ? styles.retiredRow : undefined}>
              {cells.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  )
}

export default function DesignSystemRegistryPage() {
  usePlatformHero({
    title: 'Component Registry',
    subtitle: 'Inventory of all DS primitives, web adapters, and app composites. Coverage, dark mode health, and architectural notes for every component in the system.',
  })

  const renderableSections = SECTIONS.filter(
    (s) => s.table && !SKIP_HEADINGS.has(s.heading)
  )

  return (
    <>
      <SeoHead
        title="Component Registry — Design System"
        description="Sugartown design system component registry — live inventory of DS primitives, web adapters, and app composites."
      />
      <div className={styles.hub}>

        <section className={styles.section}>
          <Callout title="Source of truth">
            <code>docs/conventions/component-registry.md</code> — generated from that file at build time. Registry updates in any epic are immediately reflected here.
          </Callout>
          {COVERAGE_KEY_SECTION?.table && (
            <div className={styles.coverageKey}>
              <span className={styles.coverageKeyLabel}>Coverage key</span>
              {COVERAGE_KEY_SECTION.table.rows.map(({ cells }) => (
                <span key={cells[0]} className={styles.coverageKeyItem}>
                  <span className={styles.coverageKeySymbol}>{cells[0]}</span>
                  <span className={styles.coverageKeyMeaning}>{cells[1]}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {renderableSections.map((section, i) => (
          <section key={section.heading} className={styles.section}>
            <SectionLabel
              number={SECTION_NUMBERS[i]}
              name={section.heading.toUpperCase()}
              kicker={`${section.table.rows.length} components`}
            />
            <RegistryTable
              columns={section.table.columns}
              rows={section.table.rows}
            />
          </section>
        ))}

        <section className={styles.section}>
          <div className={styles.trustLinks}>
            <a href={PLATFORM_ROUTES.designSystem} className={styles.trustLink}>
              ← Design System
            </a>
          </div>
        </section>

      </div>
    </>
  )
}
