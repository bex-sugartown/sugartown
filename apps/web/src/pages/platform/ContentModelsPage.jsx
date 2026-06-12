import contentModels from '../../data/content-models.json'
import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import Table, { TableWrap } from '../../design-system/components/table/Table'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'
import pageStyles from './ContentModelsPage.module.css'

// Section dependencies:
// Each doc type renders as one section with header info + field table.
// The Callout uses generatedAt from the JSON — update the generator if the format changes.

const CONTENT_TYPES = contentModels.docTypes.filter((t) => t.group === 'content')
const TAXONOMY_TYPES = contentModels.docTypes.filter((t) => t.group === 'taxonomy')

function TypeBadge({ group }) {
  return (
    <span className={pageStyles[`badge${group === 'taxonomy' ? 'Taxonomy' : 'Content'}`]}>
      {group}
    </span>
  )
}

function FieldRow({ field }) {
  const typeLabel = field.isArray ? `array of ${field.type}` : field.type
  const refsLabel = field.refsTo?.length ? ` → ${field.refsTo.join(', ')}` : ''
  const typeDisplay = `${typeLabel}${refsLabel}`

  let valuesDisplay = null
  if (field.enumValues?.length) {
    valuesDisplay = (
      <ul className={pageStyles.enumList}>
        {field.enumValues.map(({ title, value }) => (
          <li key={value}>
            <code>{value}</code>
            {title !== value && <span className={pageStyles.enumTitle}> — {title}</span>}
          </li>
        ))}
      </ul>
    )
  } else if (field.initialValue) {
    valuesDisplay = <span className={pageStyles.initialValue}>default: <code>{field.initialValue}</code></span>
  }

  return (
    <tr>
      <td><code>{field.name}</code></td>
      <td className={pageStyles.typeCell}>{typeDisplay}</td>
      <td className={pageStyles.reqCell}>{field.required ? '✓' : '—'}</td>
      <td>
        {field.description && <span>{field.description}</span>}
        {field.description && valuesDisplay && <br />}
        {valuesDisplay}
      </td>
    </tr>
  )
}

function DocTypeSection({ docType, number }) {
  return (
    <section className={styles.section}>
      <SectionLabel
        number={number}
        name={docType.title.toUpperCase()}
        kicker={`${docType.fieldCount} fields · ${docType.route}`}
      />
      <div className={pageStyles.typeMeta}>
        <TypeBadge group={docType.group} />
        <code className={pageStyles.displayFieldNote}>
          display field: <strong>{docType.displayField}</strong>
        </code>
        {docType.taxonomyNote && (
          <span className={pageStyles.taxonomyNote}>{docType.taxonomyNote}</span>
        )}
      </div>
      <TableWrap>
        <Table tone="subdued" density="compact">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Req</th>
              <th>Description / values</th>
            </tr>
          </thead>
          <tbody>
            {docType.fields.map((field) => (
              <FieldRow key={field.name} field={field} />
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </section>
  )
}

export default function ContentModelsPage() {
  usePlatformHero({
    title: 'Content Models',
    subtitle: 'Field-level reference for every content-facing Sanity doc type — names, types, required flags, enum values, and display-field rules. Generated from schema source at build time.',
  })

  return (
    <>
      <SeoHead
        title="Content Models — Design System"
        description="Field-level reference for all Sugartown Sanity doc types — names, types, required flags, enum values, and display-field rules."
      />
      <div className={styles.hub}>

        <section className={styles.section}>
          <Callout title="Source of truth">
            Generated from <code>apps/studio/schemas/documents/</code> via <code>scripts/generate-content-models.mjs</code> and committed to <code>apps/web/src/data/content-models.json</code>.
            Last generated: <code>{contentModels.generatedAt}</code>.
            Never infer schema fields from sample content — this page is authoritative.
          </Callout>
        </section>

        <section className={styles.section}>
          <SectionLabel number="§01" name="CONTENT TYPES" kicker={`${CONTENT_TYPES.length} types`} />
        </section>

        {CONTENT_TYPES.map((docType, i) => (
          <DocTypeSection
            key={docType.id}
            docType={docType}
            number={`§01.${String(i + 1).padStart(2, '0')}`}
          />
        ))}

        <section className={styles.section}>
          <SectionLabel number="§02" name="TAXONOMY TYPES" kicker={`${TAXONOMY_TYPES.length} types · display field: name`} />
        </section>

        {TAXONOMY_TYPES.map((docType, i) => (
          <DocTypeSection
            key={docType.id}
            docType={docType}
            number={`§02.${String(i + 1).padStart(2, '0')}`}
          />
        ))}

        <section className={styles.section}>
          <div className={styles.trustLinks}>
            <a href={`${PLATFORM_ROUTES.cms}#schema-erd`} className={styles.trustLink}>
              ← Schema ERD
            </a>
          </div>
        </section>

      </div>
    </>
  )
}
