/**
 * @deprecated EPIC-0160 — replaced by CardBuilderSection.
 * Use CardBuilderSection for editor-assembled card grids on pages.
 * This component is kept for backward compatibility with existing content only.
 * Do not use in new code — it will be removed in a future version.
 */
import EditorialCard from './EditorialCard'
import styles from './CardGrid.module.css'

export default function CardGrid({ cards }) {
  if (!cards || cards.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <EditorialCard key={index} card={card} />
        ))}
      </div>
    </section>
  )
}
